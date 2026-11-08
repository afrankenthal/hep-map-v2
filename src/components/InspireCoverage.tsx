import { ExternalLink } from 'lucide-react';
import { INSPIRE_AUDIT } from '@/lib/inspire';

type Entry = (typeof INSPIRE_AUDIT.entries)[number];

function IdentityEvidence({ entry }: { entry: Entry }) {
  const review = entry.identityReview;
  if (!review) return null;
  return <details className="identity-evidence"><summary>Identity evidence for {entry.name}</summary>
    <p>{review.origin === 'upstream-legacy' ? 'ID retained from the original catalogue.' : `${review.reviewMethod} · ${review.reviewedOn}. Not an independent human review.`}</p>
    <p>{review.reason}</p>
    {review.evidenceUrls.map(url => <a className="inspire-candidate" key={url} href={url} target="_blank" rel="noreferrer">{new URL(url).hostname}<ExternalLink size={11} /></a>)}
  </details>;
}

export default function InspireCoverage({ onSelect }: { onSelect: (id: string) => void }) {
  const { counts, entries, snapshotFetchedAt } = INSPIRE_AUDIT;
  return <section className="coverage-source inspire-audit" aria-labelledby="inspire-audit-title">
    <h3 id="inspire-audit-title">INSPIRE catalogue links</h3>
    <p>Snapshot: {snapshotFetchedAt.slice(0, 10)} (UTC), {counts.source.toLocaleString('en-US')} source records. This inventory is broader than the map and does not establish global completeness.</p>
    <div className="coverage-counts"><strong>{counts.linked} linked</strong><span>{counts.candidate} name {counts.candidate === 1 ? 'candidate' : 'candidates'}</span><span>{counts.ambiguous} ambiguous</span><span>{counts.unmatched} unresolved</span></div>
    <p>{counts.linked - counts.sourceCompared} IDs come from the original catalogue; {counts.sourceCompared} have an AI-assisted source comparison with evidence below. {counts.aggregateEntries} entries link to multiple constituent records ({counts.linkedSourceRecords} INSPIRE records in total). Name candidates are not confirmed identities. {counts.scopeNotes} scope differences, {counts.metadataConflicts} metadata conflict, and {counts.noMatchNotes} bounded name-search reviews are documented below. A link or review note is recorded for every local entry; this is not a completeness claim.</p>
    <details className="coverage-exclusions"><summary>Explicit identity links ({counts.linked})</summary>
      <div className="inspire-linked">{entries.filter(entry => entry.status === 'linked').map(entry => <div key={entry.localId}>
        <button className="text-button" onClick={() => onSelect(entry.localId)}>{entry.name}</button>
        <div className="inspire-record-links">{entry.candidates.map(record => <a key={record.inspireId} href={record.url} target="_blank" rel="noreferrer">{record.relationship === 'identity' ? 'INSPIRE' : record.label} {record.inspireId}<ExternalLink size={12} /></a>)}</div>
        <IdentityEvidence entry={entry} />
      </div>)}</div>
    </details>
    <details className="coverage-exclusions"><summary>Unresolved identities ({counts.local - counts.linked})</summary><ul>{entries.filter(entry => entry.status !== 'linked').map(entry => <li key={entry.localId}>
      <button className="text-button" onClick={() => onSelect(entry.localId)}>{entry.name}</button>
      <span className="inspire-disposition">{entry.status === 'candidate' ? 'Name candidate' : entry.status === 'ambiguous' ? 'Ambiguous' : 'No exact match'}</span>
      {entry.reviewNote && <div className="identity-scope-note"><strong className="review-kind">{entry.reviewNote.kind === 'metadata-conflict' ? 'Conflicting source metadata' : entry.reviewNote.kind === 'no-match-in-snapshot' ? 'No identity selected from this snapshot' : 'Programme or scope difference'}</strong><p>{entry.reviewNote.reason}</p><small>{entry.reviewNote.reviewMethod} · {entry.reviewNote.reviewedOn}</small>{entry.reviewNote.relatedRecords.map(record => <a className="inspire-candidate" key={record.inspireId} href={record.url} target="_blank" rel="noreferrer">{record.relationship} · {record.inspireId}<ExternalLink size={11} /></a>)}<>{entry.reviewNote.searchEvidence.length > 0 && <div className="inspire-search-evidence"><span>Name-field search hits, not identity matches:</span><ul>{entry.reviewNote.searchEvidence.map(search => <li key={search.term}>{search.term}: {search.count}</li>)}</ul></div>}{entry.reviewNote.evidenceUrls.map(url => <a className="inspire-candidate" key={url} href={url} target="_blank" rel="noreferrer">Evidence · {new URL(url).hostname}<ExternalLink size={11} /></a>)}{entry.reviewNote.relatedRecords.length > 0 && <p className="scope-note-caption">Related records for review, not identity links.</p>}</></div>}
      {entry.candidates.map(candidate => <a className="inspire-candidate" key={candidate.inspireId} href={candidate.url} target="_blank" rel="noreferrer">{candidate.name} · {candidate.inspireId}<ExternalLink size={11} /></a>)}
    </li>)}</ul></details>
    <a className="particle-overview-source" href="https://inspirehep.net/experiments" target="_blank" rel="noreferrer">Browse INSPIRE experiments <ExternalLink size={12} /></a>
  </section>;
}
