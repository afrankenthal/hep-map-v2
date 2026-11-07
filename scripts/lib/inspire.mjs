import { mkdir, rename, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';

export const API = 'https://inspirehep.net/api/experiments';
export const FIELDS = ['legacy_name', 'long_name', 'name_variants', 'experiment', 'collaboration', 'accelerator', 'institutions', 'date_started', 'date_completed', 'date_proposed', 'date_approved', 'project_type', 'inspire_classification', 'urls'];

export async function atomicJson(path, value) {
  await mkdir(dirname(path), { recursive: true });
  const temporary = `${path}.${process.pid}.tmp`;
  await writeFile(temporary, `${JSON.stringify(value, null, 2)}\n`);
  await rename(temporary, path);
}

export function validateRecord(record) {
  if (!/^\d+$/.test(String(record?.id)) || !record.metadata || typeof record.metadata !== 'object' || Array.isArray(record.metadata)) throw new Error('Malformed INSPIRE record');
  if (record.metadata.control_number && String(record.metadata.control_number) !== String(record.id)) throw new Error(`Conflicting INSPIRE identity: ${record.id}`);
  return { id: String(record.id), created: record.created ?? null, updated: record.updated ?? null, metadata: Object.fromEntries(['control_number', ...FIELDS].filter(key => record.metadata[key] !== undefined).map(key => [key, record.metadata[key]])) };
}

export function totalHits(value) {
  const total = typeof value === 'number' ? value : value?.relation === 'eq' ? value.value : undefined;
  if (!Number.isSafeInteger(total) || total < 0) throw new Error('INSPIRE did not return an exact total');
  return total;
}

export async function fetchSnapshot({ fetcher = fetch, sleep = ms => new Promise(resolve => setTimeout(resolve, ms)), pageSize = 250, onPage = () => {} } = {}) {
  const records = new Map();
  let expected;
  const startedAt = new Date().toISOString();
  for (let page = 1; ; page++) {
    const url = new URL(API);
    url.search = new URLSearchParams({ size: String(pageSize), page: String(page), fields: FIELDS.join(',') }).toString();
    let result;
    for (let attempt = 0; attempt < 4; attempt++) {
      try {
        const response = await fetcher(url, { headers: { Accept: 'application/json', 'User-Agent': 'HEPMAP catalogue sync (https://github.com/afrankenthal/hep-map-v2)' }, signal: AbortSignal.timeout(30000) });
        if (response.status === 429 || response.status >= 500) {
          if (attempt === 3) throw new Error(`INSPIRE HTTP ${response.status}; retries exhausted`);
          const retry = Number(response.headers.get('retry-after'));
          await sleep(Math.max(response.status === 429 ? 5000 : 1000, Number.isFinite(retry) ? retry * 1000 : 0));
          continue;
        }
        if (!response.ok) throw new Error(`INSPIRE HTTP ${response.status}`);
        result = await response.json();
        break;
      } catch (error) {
        // HTTP/schema failures must stay visible; transient transport failures may retry.
        if (attempt === 3 || String(error.message).startsWith('INSPIRE HTTP') || error instanceof SyntaxError) throw error;
        await sleep(1000 * (attempt + 1));
      }
    }
    const total = totalHits(result?.hits?.total);
    if (expected === undefined) expected = total;
    if (expected !== total) throw new Error('INSPIRE inventory changed during import; rerun for a consistent snapshot');
    const hits = result?.hits?.hits;
    if (!Array.isArray(hits)) throw new Error('Malformed INSPIRE search response');
    if (!hits.length && records.size < expected) throw new Error('INSPIRE pagination ended before the reported total');
    for (const hit of hits) {
      const record = validateRecord(hit);
      if (records.has(record.id)) throw new Error(`Duplicate record ${record.id} across pages; rerun the import`);
      records.set(record.id, record);
    }
    onPage({ page, fetched: records.size, total: expected });
    if (records.size >= expected) break;
    await sleep(400);
  }
  if (records.size !== expected) throw new Error('Imported count does not match INSPIRE total');
  return { schemaVersion: 1, source: API, fields: FIELDS, scope: 'All records returned by the INSPIRE experiments endpoint; this is not a global inventory of particle physics.', startedAt, fetchedAt: new Date().toISOString(), reportedTotal: expected, records: [...records.values()].sort((a, b) => Number(a.id) - Number(b.id)) };
}

export function normalizeName(value) {
  return String(value).normalize('NFKD').replace(/\+/g, ' plus ').replace(/\p{M}/gu, '').toLowerCase().replace(/[^\p{L}\p{N}]/gu, '');
}

export function recordNames(record) {
  const m = record.metadata;
  const experiments = Array.isArray(m.experiment) ? m.experiment : m.experiment ? [m.experiment] : [];
  return [m.legacy_name, m.long_name, ...(m.name_variants || []), ...experiments.flatMap(value => typeof value === 'string' ? [value] : [value.value, value.short_name])].filter(value => typeof value === 'string');
}

export function normalizeDate(value) {
  if (typeof value !== 'string' || !value || /^9999(?:-|$)/.test(value)) return null;
  // Retain source precision instead of inventing a day or live operational status.
  if (!/^\d{4}(?:-(?:0[1-9]|1[0-2])(?:-(?:0[1-9]|[12]\d|3[01]))?)?$/.test(value)) return null;
  const [year, month, day] = value.split('-').map(Number);
  if (day) {
    const date = new Date(0); date.setUTCFullYear(year, month - 1, day);
    if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) return null;
  }
  return value;
}

export function reconcile(catalogue, snapshot, links = {}, notes = {}) {
  if (snapshot.schemaVersion !== 1 || !Array.isArray(snapshot.records) || snapshot.records.length !== snapshot.reportedTotal) throw new Error('Invalid or incomplete INSPIRE snapshot');
  const records = snapshot.records.map(validateRecord);
  const byId = new Map(records.map(record => [record.id, record]));
  if (byId.size !== records.length) throw new Error('Duplicate INSPIRE IDs in snapshot');
  const localIds = new Set(catalogue.map(record => record.id));
  if (localIds.size !== catalogue.length) throw new Error('Duplicate local catalogue IDs');
  for (const id of Object.keys(links)) if (!localIds.has(id)) throw new Error(`Link references missing local record: ${id}`);
  const httpsSources = values => Array.isArray(values) && values.length > 0 && values.every(value => { try { return new URL(value).protocol === 'https:'; } catch { return false; } });
  const validReview = review => review.reviewMethod === 'AI-assisted source comparison' && /^\d{4}-\d{2}-\d{2}$/.test(review.reviewedOn || '') && normalizeDate(review.reviewedOn) && httpsSources(review.evidenceUrls);
  for (const [id, note] of Object.entries(notes)) {
    if (!localIds.has(id) || links[id] || !note.reason || !validReview(note) || !Array.isArray(note.relatedRecords) || !note.relatedRecords.length) throw new Error(`Invalid scope review for ${id}`);
    for (const related of note.relatedRecords) if (!byId.has(String(related.inspireId)) || !related.relationship) throw new Error(`Invalid related INSPIRE record for ${id}`);
  }
  const index = new Map();
  for (const record of records) for (const name of recordNames(record)) {
    const key = normalizeName(name);
    if (key.length < 3) continue;
    if (!index.has(key)) index.set(key, new Set());
    index.get(key).add(record.id);
  }
  const entries = catalogue.map(local => {
    const explicit = links[local.id];
    let references = [];
    if (explicit) {
      if (!explicit.reason || (explicit.inspireId && explicit.records)) throw new Error(`Invalid explicit link for ${local.id}`);
      if (explicit.records) {
        const relations = ['operating-mode', 'detector-run', 'constituent-experiment'];
        if (explicit.scope !== 'aggregate' || !Array.isArray(explicit.records) || explicit.records.length < 2 || explicit.origin !== 'source-comparison') throw new Error(`Aggregate link for ${local.id} requires reviewed, scoped records`);
        references = explicit.records;
        if (references.some(ref => !relations.includes(ref.relationship) || typeof ref.label !== 'string' || !ref.label.trim())) throw new Error(`Aggregate records for ${local.id} require a relationship and label`);
      } else {
        if (explicit.scope && explicit.scope !== 'identity') throw new Error(`Invalid single-record scope for ${local.id}`);
        references = [{ inspireId: explicit.inspireId, relationship: 'identity', label: 'Experiment record' }];
      }
      if (references.some(ref => !/^\d+$/.test(String(ref.inspireId))) || new Set(references.map(ref => String(ref.inspireId))).size !== references.length) throw new Error(`Invalid or duplicate record IDs for ${local.id}`);
    }
    if (explicit?.origin === 'source-comparison' && !validReview(explicit)) throw new Error(`Source comparison for ${local.id} requires a date, method, and HTTPS evidence`);
    if (explicit?.origin && !['source-comparison', 'upstream-legacy'].includes(explicit.origin)) throw new Error(`Invalid link origin for ${local.id}`);
    for (const ref of references) if (!byId.has(String(ref.inspireId))) throw new Error(`Linked INSPIRE record ${ref.inspireId} missing from snapshot`);
    // Research keywords in aliases (e.g. Higgs, proton) are not identities.
    const names = [local.name, local.fullName];
    const evidence = new Map();
    for (const name of names) for (const id of index.get(normalizeName(name)) || []) {
      if (!evidence.has(id)) evidence.set(id, []);
      evidence.get(id).push(name);
    }
    const candidateIds = explicit ? references.map(ref => String(ref.inspireId)) : [...evidence.keys()].sort((a, b) => Number(a) - Number(b));
    const candidates = candidateIds.map(id => {
      const record = byId.get(id), m = record.metadata;
      const reference = references.find(ref => String(ref.inspireId) === id);
      return { relationship: reference?.relationship || 'candidate', label: reference?.label || 'Name candidate', inspireId: id, name: m.legacy_name || m.long_name || id, url: `https://inspirehep.net/experiments/${id}`, matchedNames: evidence.get(id) || [], sourceUpdatedAt: record.updated, sourceDates: { proposed: m.date_proposed ?? null, approved: m.date_approved ?? null, started: m.date_started ?? null, completed: m.date_completed ?? null }, displayDates: { proposed: normalizeDate(m.date_proposed), approved: normalizeDate(m.date_approved), started: normalizeDate(m.date_started), completed: normalizeDate(m.date_completed) } };
    });
    const identityReview = explicit ? { origin: explicit.origin || 'upstream-legacy', reason: explicit.reason, reviewedOn: explicit.reviewedOn || null, reviewMethod: explicit.reviewMethod || null, evidenceUrls: explicit.evidenceUrls || [] } : null;
    const note = notes[local.id];
    const reviewNote = note ? { ...note, relatedRecords: note.relatedRecords.map(related => ({ ...related, inspireId: String(related.inspireId), name: byId.get(String(related.inspireId)).metadata.legacy_name || related.inspireId, url: `https://inspirehep.net/experiments/${related.inspireId}` })) } : null;
    return { localId: local.id, name: local.name, linkScope: explicit?.scope || 'identity', identityReview, reviewNote, status: explicit ? 'linked' : candidates.length > 1 ? 'ambiguous' : candidates.length === 1 ? 'candidate' : 'unmatched', reason: explicit?.reason || (candidates.length ? 'Exact normalized identity match; manual review required, including programme/phase identity.' : 'No exact identity match. This does not establish absence from INSPIRE.'), candidates };
  });
  const assignments = new Map();
  for (const entry of entries.filter(entry => entry.status === 'linked')) {
    for (const { inspireId: id } of entry.candidates) {
      if (!assignments.has(id)) assignments.set(id, []);
      assignments.get(id).push(entry.localId);
    }
  }
  const conflicts = [...assignments].filter(([, ids]) => ids.length > 1).map(([inspireId, localIds]) => ({ inspireId, localIds }));
  const linkedIds = new Set(assignments.keys());
  return { schemaVersion: 1, snapshotFetchedAt: snapshot.fetchedAt, source: snapshot.source, completeness: 'Not established. Unlinked INSPIRE records include out-of-scope programmes and phases requiring review.', counts: { local: entries.length, source: records.length, linked: entries.filter(e => e.status === 'linked').length, candidate: entries.filter(e => e.status === 'candidate').length, ambiguous: entries.filter(e => e.status === 'ambiguous').length, unmatched: entries.filter(e => e.status === 'unmatched').length, conflictingLinks: conflicts.length, linkedSourceRecords: linkedIds.size, aggregateEntries: entries.filter(e => e.status === 'linked' && e.linkScope === 'aggregate').length, sourceCompared: entries.filter(e => e.identityReview?.origin === 'source-comparison').length, scopeNotes: entries.filter(e => e.reviewNote).length }, conflicts, entries, unlinkedSourceRecords: records.filter(record => !linkedIds.has(record.id)).map(record => ({ inspireId: record.id, name: record.metadata.legacy_name || record.metadata.long_name || record.id, url: `https://inspirehep.net/experiments/${record.id}` })) };
}

export function publicAudit(report) {
  if (report.conflicts.length) throw new Error('Conflicting explicit links require review before publishing the compact audit.');
  return { snapshotFetchedAt: report.snapshotFetchedAt, source: report.source, counts: report.counts, entries: report.entries.map(({ localId, name, status, linkScope, identityReview, reviewNote, candidates }) => ({ localId, name, status, linkScope, identityReview, reviewNote, candidates: candidates.map(({ inspireId, name, url, relationship, label }) => ({ inspireId, name, url, relationship, label })) })) };
}
