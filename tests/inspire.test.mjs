import test from 'node:test';
import assert from 'node:assert/strict';
import { fetchSnapshot, normalizeDate, normalizeName, publicAudit, reconcile, recordNames, totalHits, validateRecord } from '../scripts/lib/inspire.mjs';

const record = (id, name, extra = {}) => ({ id: String(id), updated: '2026-01-01T00:00:00Z', metadata: { control_number: Number(id), legacy_name: name, ...extra } });
const local = (id, name, extra = {}) => ({ id, name, fullName: name, aliases: [], ...extra });
const snapshot = records => ({ schemaVersion: 1, source: 'https://inspirehep.net/api/experiments', fetchedAt: '2026-11-06T00:00:00Z', reportedTotal: records.length, records });
const response = (records, total = records.length) => Response.json({ hits: { total, hits: records } });

test('import exhausts pagination, accepts exact totals, and sorts stable record IDs', async () => {
  const urls = [];
  const result = await fetchSnapshot({ pageSize: 1, sleep: async () => {}, fetcher: async url => { urls.push(new URL(url)); return response([record(urls.length === 1 ? 20 : 10, 'Test')], { value: 2, relation: 'eq' }); } });
  assert.equal(urls.length, 2);
  assert.equal(urls[1].searchParams.get('page'), '2');
  assert.ok(urls[0].searchParams.get('fields').includes('legacy_name'));
  assert.deepEqual(result.records.map(r => r.id), ['10', '20']);
  assert.equal(result.reportedTotal, 2);
});

test('rate limits wait at least five seconds and retain a bounded retry budget', async () => {
  const pauses = []; let calls = 0;
  const result = await fetchSnapshot({ sleep: async ms => pauses.push(ms), fetcher: async () => ++calls === 1 ? new Response('', { status: 429, headers: { 'Retry-After': '1' } }) : response([]) });
  assert.equal(result.records.length, 0);
  assert.equal(pauses[0], 5000);
  calls = 0;
  await assert.rejects(fetchSnapshot({ sleep: async () => {}, fetcher: async () => { calls++; return new Response('', { status: 503 }); } }), /retries exhausted/);
  assert.equal(calls, 4);
});

test('malformed, non-exact, duplicated, changed, and truncated inventories fail visibly', async () => {
  assert.throws(() => totalHits({ value: 10000, relation: 'gte' }), /exact total/);
  assert.throws(() => validateRecord({ id: 'not-an-id', metadata: {} }), /Malformed/);
  assert.throws(() => validateRecord(record(1, 'A', { control_number: 2 })), /Conflicting/);
  for (const mode of ['duplicate', 'changed', 'truncated']) {
    let page = 0;
    await assert.rejects(fetchSnapshot({ pageSize: 1, sleep: async () => {}, fetcher: async () => {
      page++;
      return page === 1 ? response([record(1, 'A')], 2) : mode === 'changed' ? response([record(2, 'B')], 3) : mode === 'truncated' ? response([], 2) : response([record(1, 'A')], 2);
    } }), /Duplicate|changed|ended/);
  }
});

test('snapshot field selection excludes unrelated response fields and personal data', () => {
  const r = validateRecord(record(1, 'A', { emails: ['private@example.org'], description: 'Not imported', date_completed: '9999' }));
  assert.equal(r.metadata.emails, undefined);
  assert.equal(r.metadata.description, undefined);
  assert.equal(r.metadata.date_completed, '9999');
});

test('experiment object and legacy array representations supply identity names', () => {
  assert.ok(recordNames(record(1, 'CERN-LHC-CMS', { experiment: { value: 'CMS', short_name: 'CMS' } })).includes('CMS'));
  assert.ok(recordNames(record(1, 'A', { experiment: [{ value: 'B' }] })).includes('B'));
  assert.notEqual(normalizeName('SNO+'), normalizeName('SNO'));
  assert.equal(normalizeName('Super-Kamiokande'), normalizeName('Super Kamiokande'));
});

test('source date sentinels remain raw while display dates preserve precision', () => {
  for (const value of ['9999', '9999-12-31', '', 'unknown', '2000-99', '2001-02-29', '2000-02-31', 2000, null]) assert.equal(normalizeDate(value), null);
  for (const value of ['1968', '1984-10', '2009-11-23', '2000-02-29']) assert.equal(normalizeDate(value), value);
});

test('reconciliation distinguishes explicit links, ambiguous candidates, and no match', () => {
  const source = snapshot([record(1, 'CMS', { date_completed: '9999' }), record(2, 'Phase A'), record(3, 'Phase-A')]);
  const locals = [local('cms', 'CMS'), local('phase', 'Phase A'), local('unknown', 'Missing')];
  const original = JSON.stringify(locals);
  const report = reconcile(locals, source, { cms: { inspireId: '1', reason: 'Original stable identity' } });
  assert.deepEqual(report.entries.map(e => e.status), ['linked', 'ambiguous', 'unmatched']);
  assert.equal(report.entries[0].candidates[0].displayDates.completed, null);
  assert.equal(report.entries[0].candidates[0].sourceDates.completed, '9999');
  assert.equal(JSON.stringify(locals), original);
  assert.equal(report.unlinkedSourceRecords.length, 2);
});

test('a unique name match stays a candidate and broad research aliases cannot match identities', () => {
  const report = reconcile([local('cms', 'CMS'), local('a', 'Different', { aliases: ['CMS'] })], snapshot([record(1, 'CMS')]));
  assert.equal(report.entries[0].status, 'candidate');
  assert.equal(report.entries[1].status, 'unmatched');
});

test('invalid links and duplicate explicit assignments cannot silently merge detector phases', () => {
  const source = snapshot([record(1, 'Programme')]);
  assert.throws(() => reconcile([local('a', 'A')], source, { wrong: { inspireId: '1', reason: 'Test' } }), /missing local/);
  assert.throws(() => reconcile([local('a', 'A')], source, { a: { inspireId: '2', reason: 'Test' } }), /missing from snapshot/);
  const report = reconcile([local('a', 'A'), local('b', 'B')], source, { a: { inspireId: '1', reason: 'Test' }, b: { inspireId: '1', reason: 'Test' } });
  assert.equal(report.counts.conflictingLinks, 1);
  assert.deepEqual(report.conflicts[0].localIds, ['a', 'b']);
  assert.throws(() => publicAudit(report), /before publishing/);
});
