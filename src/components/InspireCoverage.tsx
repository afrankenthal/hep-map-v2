import { ExternalLink } from 'lucide-react';
import { INSPIRE_AUDIT } from '@/lib/inspire';

export default function InspireCoverage({ onSelect }: { onSelect: (id: string) => void }) {
  const { counts, entries, snapshotFetchedAt } = INSPIRE_AUDIT;
  return <section className="coverage-source inspire-audit" aria-labelledby="inspire-audit-title">
    <h3 id="inspire-audit-title">INSPIRE catalogue links</h3>
    <p>Snapshot: {snapshotFetchedAt.slice(0, 10)} (UTC), {counts.source.toLocaleString('en-US')} source records. This inventory is broader than the map and does not establish global completeness.</p>
    <div className="coverage-counts"><strong>{counts.linked} linked</strong><span>{counts.candidate} name candidates</span><span>{counts.ambiguous} ambiguous</span><span>{counts.unmatched} unresolved</span></div>
    <p>The six links below retain the original catalogue’s explicit INSPIRE IDs. Name matches require identity review, especially for programmes and detector phases. “Unresolved” means no exact name match; the experiment may still have an INSPIRE record.</p>
    <div className="inspire-linked">{entries.filter(entry => entry.status === 'linked').map(entry => <div key={entry.localId}><button className="text-button" onClick={() => onSelect(entry.localId)}>{entry.name}</button><a href={entry.candidates[0].url} target="_blank" rel="noreferrer">INSPIRE {entry.candidates[0].inspireId}<ExternalLink size={12} /></a></div>)}</div>
    <details className="coverage-exclusions"><summary>Identities awaiting review ({counts.local - counts.linked})</summary><ul>{entries.filter(entry => entry.status !== 'linked').map(entry => <li key={entry.localId}><button className="text-button" onClick={() => onSelect(entry.localId)}>{entry.name}</button><span className="inspire-disposition">{entry.status === 'candidate' ? 'Name candidate' : entry.status === 'ambiguous' ? 'Ambiguous' : 'No exact match'}</span>{entry.candidates.map(candidate => <a className="inspire-candidate" key={candidate.inspireId} href={candidate.url} target="_blank" rel="noreferrer">{candidate.name} · {candidate.inspireId}<ExternalLink size={11} /></a>)}</li>)}</ul></details>
    <a className="particle-overview-source" href="https://inspirehep.net/experiments" target="_blank" rel="noreferrer">Browse INSPIRE experiments <ExternalLink size={12} /></a>
  </section>;
}
