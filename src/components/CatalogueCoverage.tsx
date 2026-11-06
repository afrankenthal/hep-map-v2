import { ArrowUpRight, Check, ExternalLink } from 'lucide-react';
import { COVERAGE_GAPS, COVERAGE_SOURCES, DISCOVERY_SOURCES, EXPERIMENTS, REVIEW_DATE, coverageFor } from '@/lib/catalogue';

export default function CatalogueCoverage({ onSelect }: { onSelect: (id: string) => void }) {
  return <>
    <span className="eyebrow">WHAT IS HERE · WHAT IS MISSING</span>
    <h2 id="coverage-title">A growing map.<br />An open coverage record.</h2>
    <p className="coverage-lead"><strong>{EXPERIMENTS.length} mapped records.</strong> Global completeness has not been established. Counts below refer to the named source snapshots, never to all particle-physics experiments.</p>
    <section className="coverage-scope"><h3>What belongs on Particle Map?</h3><p>Experiments investigating particles, their interactions, and physics beyond the Standard Model: collider and fixed-target experiments, precision measurements, neutrino studies, dark-matter searches, rare decays, and particle astrophysics. Historical and proposed experiments, including foundational discoveries of the nucleus and neutron, are in scope.</p><p>General biology, geology, and detector-test infrastructure are recorded as exclusions when they appear on a source roster. Broader nuclear physics and general astronomy need a separate scope decision.</p><p>A programme, experiment, and detector phase are distinct record types. One programme pin does not establish coverage of all its phases. A multi-site experiment keeps one identity with its sites explained.</p></section>
    <h3 className="coverage-section-title">Source reconciliation</h3>
    <p className="coverage-intro">Reviewed {REVIEW_DATE}. “Roster reconciled” means every entry on that linked page has a disposition; it does not certify a laboratory’s entire history.</p>
    {COVERAGE_SOURCES.map(source => {
      const result = coverageFor(source);
      return <section key={source.id} className="coverage-source">
        <div className="coverage-source-heading"><h3><a href={source.url} target="_blank" rel="noreferrer">{source.name}<ExternalLink size={13} /></a></h3><span>{source.review}</span></div>
        <div className="coverage-counts"><strong>{result.mapped.length} mapped</strong><span>{result.missing.length} known missing</span>{result.excluded.length > 0 && <span>{result.excluded.length} excluded</span>}</div>
        <p>{source.note}</p>
        {result.mapped.length > 0 && <div className="mapped-links">{result.mapped.map(entry => <button key={entry.id} onClick={() => onSelect(entry.id)}><Check size={12} />{EXPERIMENTS.find(experiment => experiment.id === entry.id)?.name || entry.name}<ArrowUpRight size={12} /></button>)}</div>}
        {result.missing.length > 0 && <div className="missing-records"><h4>Known missing records</h4><p>{result.missing.map(e => e.name).join(' · ')}</p></div>}
        {result.excluded.length > 0 && <details className="coverage-exclusions"><summary>Exclusions and reasons ({result.excluded.length})</summary><ul>{result.excluded.map(entry => <li key={entry.id}><strong>{entry.name}</strong> — {entry.reason}</li>)}</ul></details>}
      </section>;
    })}
    <h3 className="coverage-section-title">Discovery sources still to reconcile</h3>
    {DISCOVERY_SOURCES.map(source => <div key={source.url} className="discovery-source"><a href={source.url} target="_blank" rel="noreferrer">{source.name}<ExternalLink size={13} /></a><p>{source.note}</p></div>)}
    <p className="coverage-gap">{COVERAGE_GAPS}</p>
    <h3 className="coverage-section-title">When can we call a release complete?</h3><p>Only against a named, dated source inventory and an explicit scope. Each source record must be mapped, marked as a duplicate or linked phase, excluded with a reason, or left visibly unresolved. New discoveries and source changes reopen that review.</p>
  </>;
}
