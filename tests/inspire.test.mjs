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

test('source-comparison links preserve evidence and cannot omit review provenance', () => {
  const source = snapshot([record(1, 'A')]);
  const base = { inspireId: '1', reason: 'Compared identities', origin: 'source-comparison' };
  assert.throws(() => reconcile([local('a', 'A')], source, { a: base }), /requires a date/);
  const reviewed = { ...base, reviewedOn: '2026-11-06', reviewMethod: 'AI-assisted source comparison', evidenceUrls: ['https://example.org/experiment'] };
  const report = reconcile([local('a', 'A')], source, { a: reviewed });
  assert.equal(report.counts.sourceCompared, 1);
  assert.deepEqual(publicAudit(report).entries[0].identityReview.evidenceUrls, reviewed.evidenceUrls);
  assert.throws(() => reconcile([local('a', 'A')], source, { a: { ...reviewed, evidenceUrls: ['javascript:alert(1)'] } }), /HTTPS evidence/);
});

test('programme and run relationships remain scope notes rather than identity links', () => {
  const source = snapshot([record(1, 'Parent programme')]);
  const note = { reason: 'The local phase is narrower than the programme.', reviewedOn: '2026-11-06', reviewMethod: 'AI-assisted source comparison', evidenceUrls: ['https://example.org/experiment'], relatedRecords: [{ inspireId: '1', relationship: 'parent programme' }] };
  const report = reconcile([local('phase', 'Phase 1')], source, {}, { phase: note });
  assert.equal(report.entries[0].status, 'unmatched');
  assert.equal(report.entries[0].identityReview, null);
  assert.equal(report.counts.linked, 0);
  assert.equal(publicAudit(report).entries[0].reviewNote.relatedRecords[0].url, 'https://inspirehep.net/experiments/1');
  assert.throws(() => reconcile([local('phase', 'Phase 1')], source, {}, { phase: { ...note, relatedRecords: [{ inspireId: '99', relationship: 'parent' }] } }), /Invalid related/);
});

test('reviewed acronym collisions point to the correct laboratory and experimental context', async () => {
  const { readFile } = await import('node:fs/promises');
  const links = JSON.parse(await readFile(new URL('../data/inspire/links.json', import.meta.url)));
  const raw = JSON.parse(await readFile(new URL('../data/inspire/snapshot.json', import.meta.url)));
  const source = new Map(raw.records.map(record => [record.id, record.metadata]));
  assert.ok(source.get(links.pico.inspireId).institutions.some(i => i.value.includes('SNOLAB')));
  assert.equal(source.get(links.alpha.inspireId).accelerator.value, 'AD');
  assert.equal(source.get(links.ace.inspireId).experiment.value, 'AD-4');
  assert.equal(source.get(links.supercdms.inspireId).legacy_name, 'SuperCDMS-SNOLAB');
  assert.equal(source.get(links.homestake.inspireId).legacy_name, 'HOMESTAKE-CHLORINE');
  assert.notEqual(links.sno.inspireId, links['sno-plus'].inspireId);
});

test('aggregate mappings retain every labelled mode, per-record date, and source identity', () => {
  const source = snapshot([record(1, 'Neutrino mode', { date_started: '2002' }), record(2, 'Antineutrino mode', { date_started: '2007' })]);
  const group = { scope: 'aggregate', records: [{ inspireId: '1', relationship: 'operating-mode', label: 'Neutrino mode' }, { inspireId: '2', relationship: 'operating-mode', label: 'Antineutrino mode' }], origin: 'source-comparison', reason: 'One experiment with separate mode records.', reviewedOn: '2026-11-06', reviewMethod: 'AI-assisted source comparison', evidenceUrls: ['https://example.org/experiment'] };
  const report = reconcile([local('experiment', 'Experiment')], source, { experiment: group });
  assert.equal(report.counts.linked, 1);
  assert.equal(report.counts.linkedSourceRecords, 2);
  assert.equal(report.counts.aggregateEntries, 1);
  assert.equal(report.unlinkedSourceRecords.length, 0);
  assert.deepEqual(report.entries[0].candidates.map(c => c.displayDates.started), ['2002', '2007']);
  assert.deepEqual(publicAudit(report).entries[0].candidates.map(c => c.label), ['Neutrino mode', 'Antineutrino mode']);
  assert.equal(publicAudit(report).entries[0].linkScope, 'aggregate');
});

test('aggregate mappings cannot silently accept duplicate, unlabelled, or unscoped records', () => {
  const source = snapshot([record(1, 'A'), record(2, 'B')]);
  const base = { scope: 'aggregate', records: [{ inspireId: '1', relationship: 'detector-run', label: 'Run I' }, { inspireId: '2', relationship: 'detector-run', label: 'Run II' }], origin: 'source-comparison', reason: 'Same experiment across runs', reviewedOn: '2026-11-06', reviewMethod: 'AI-assisted source comparison', evidenceUrls: ['https://example.org/experiment'] };
  for (const broken of [
    { ...base, scope: 'identity' },
    { ...base, inspireId: '1' },
    { ...base, records: [base.records[0]] },
    { ...base, records: [base.records[0], base.records[0]] },
    { ...base, records: [base.records[0], { ...base.records[1], relationship: 'same-name' }] },
    { ...base, records: [base.records[0], { ...base.records[1], label: '' }] },
  ]) assert.throws(() => reconcile([local('a', 'A')], source, { a: broken }), /Invalid|require/);
});

test('cross-entry conflicts include every aggregate member, not just the first record', () => {
  const source = snapshot([record(1, 'A'), record(2, 'B')]);
  const group = { scope: 'aggregate', records: [{ inspireId: '1', relationship: 'detector-run', label: 'Run I' }, { inspireId: '2', relationship: 'detector-run', label: 'Run II' }], origin: 'source-comparison', reason: 'Detector runs', reviewedOn: '2026-11-06', reviewMethod: 'AI-assisted source comparison', evidenceUrls: ['https://example.org/experiment'] };
  const report = reconcile([local('a', 'A'), local('b', 'B')], source, { a: group, b: { inspireId: '2', reason: 'Conflicting identity' } });
  assert.equal(report.conflicts[0].inspireId, '2');
  assert.deepEqual(report.conflicts[0].localIds, ['a', 'b']);
  assert.throws(() => publicAudit(report), /before publishing/);
});

test('reviewed mode and run mappings preserve the physics-relevant distinctions', async () => {
  const { readFile } = await import('node:fs/promises');
  const links = JSON.parse(await readFile(new URL('../data/inspire/links.json', import.meta.url)));
  assert.deepEqual(links.miniboone.records.map(r => r.inspireId), ['1110641', '1108267', '1670770']);
  assert.deepEqual(links.d0.records.map(r => r.inspireId), ['1109214', '1110315']);
  assert.ok(links.cdf.records.some(r => r.inspireId === '1109001' && r.label === 'Run I upgrade'));
  assert.ok(links.minos.records.some(r => r.inspireId === '1671995'));
  assert.ok(!links.minos.records.some(r => r.inspireId === '1108536'));
});

test('bounded no-match reviews keep search evidence without claiming global absence', () => {
  const source = snapshot([record(1, 'Modern Compton experiment'), record(2, 'Different apparatus')]);
  const note = { kind: 'no-match-in-snapshot', reason: 'No historical identity selected.', reviewedOn: '2026-11-06', reviewMethod: 'AI-assisted source comparison', evidenceUrls: ['https://example.org/history'], relatedRecords: [], searchTerms: ['Compton', 'historical name'] };
  const report = reconcile([local('historical', 'Historical scattering')], source, {}, { historical: note });
  assert.equal(report.entries[0].status, 'unmatched');
  assert.equal(report.counts.noMatchNotes, 1);
  assert.equal(report.counts.pendingWithoutNotes, 0);
  assert.deepEqual(report.entries[0].reviewNote.searchEvidence.map(s => s.count), [1, 0]);
  assert.equal(report.entries[0].reviewNote.searchEvidence[0].records[0].inspireId, '1');
  const compact = publicAudit(report).entries[0].reviewNote.searchEvidence[0];
  assert.deepEqual(compact, { term: 'Compton', count: 1 });
  assert.equal(report.entries[0].identityReview, null);
  for (const broken of [{ ...note, searchTerms: [] }, { ...note, relatedRecords: [{ inspireId: '1', relationship: 'identity' }] }, { ...note, kind: 'made-up' }]) assert.throws(() => reconcile([local('historical', 'Historical scattering')], source, {}, { historical: broken }), /Invalid|requires/);
});

test('metadata conflicts remain candidates until their identity is explicitly settled', () => {
  const source = snapshot([record(1, 'BESIII', { date_started: '1991' })]);
  const note = { kind: 'metadata-conflict', reason: 'Primary-source chronology differs.', reviewedOn: '2026-11-06', reviewMethod: 'AI-assisted source comparison', evidenceUrls: ['https://example.org/history'], relatedRecords: [{ inspireId: '1', relationship: 'candidate with conflicting chronology' }] };
  const report = reconcile([local('besiii', 'BESIII')], source, {}, { besiii: note });
  assert.equal(report.entries[0].status, 'candidate');
  assert.equal(report.entries[0].candidates[0].sourceDates.started, '1991');
  assert.equal(report.counts.metadataConflicts, 1);
  assert.equal(report.counts.linked, 0);
});

test('every unresolved local identity has a documented follow-up disposition', async () => {
  const { readFile } = await import('node:fs/promises');
  const report = JSON.parse(await readFile(new URL('../data/inspire/reconciliation.json', import.meta.url)));
  assert.equal(report.counts.pendingWithoutNotes, 0);
  for (const entry of report.entries.filter(e => e.status !== 'linked')) assert.ok(entry.reviewNote?.reason);
  const besiii = report.entries.find(e => e.localId === 'besiii');
  assert.equal(besiii.reviewNote.kind, 'metadata-conflict');
  assert.equal(besiii.identityReview, null);
  const mark = report.entries.find(e => e.localId === 'mark-i');
  assert.equal(mark.candidates[0].inspireId, '1110108');
  assert.ok(mark.identityReview.evidenceUrls.includes('https://ahro.slac.stanford.edu/history-bits/november-revolution-physics'));
});
