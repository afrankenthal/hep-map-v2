import { ArrowUpRight, ExternalLink } from 'lucide-react';
import { PARTICLES, PARTICLE_FAMILIES, STANDARD_MODEL_SOURCE, type Particle } from '@/lib/particles.ts';
import { EXPERIMENTS } from '@/lib/catalogue';

export default function ParticleExplorer({ selected, onChoose, onExperiment }: { selected?: Particle; onChoose: (id: string) => void; onExperiment: (id: string) => void }) {
  return <div className="particle-explorer">
    <span className="eyebrow">THE STANDARD MODEL</span><h2>Meet the particles.<br />Trace the evidence.</h2>
    <p className="particle-intro">All 17 particle types have a sourced discovery history. Select one to explore the experiments behind it.</p>
    <div className="particle-grid" aria-label="Standard Model particle table">{PARTICLES.map(particle => <button key={particle.id} className={`particle-cell family-${particle.family} ${selected?.id === particle.id ? 'active' : ''}`} style={{ gridRow: particle.row, gridColumn: particle.column }} onClick={() => onChoose(particle.id)} aria-pressed={selected?.id === particle.id} aria-label={`${particle.name}: explore discovery history`}><small>{particle.charge}</small><strong>{particle.symbol}</strong><span>{particle.name}</span></button>)}</div>
    <div className="particle-legend">{Object.entries(PARTICLE_FAMILIES).map(([key,label]) => <span key={key} className={`family-${key}`}><i />{label}</span>)}</div>
    <p className="particle-table-note">Charges are in units of e. Colour states and antiparticles are grouped; W⁺ and W⁻ share a cell. Gravity is outside the Standard Model. Neutrino masses require an extension of its minimal form.</p>
    <a className="particle-overview-source" href={STANDARD_MODEL_SOURCE} target="_blank" rel="noreferrer">CERN · The Standard Model <ExternalLink size={12} /></a>
    {selected && <section className="particle-history" aria-label={`${selected.name} discovery history`}><span className="eyebrow">FOLLOW THE DISCOVERY</span><h3><span>{selected.symbol}</span>{selected.name}</h3><p>{selected.role}</p>{selected.history.map((moment,index) => <article className="discovery-moment" key={`${selected.id}-${index}`}><div><strong>{moment.date}</strong><span>{moment.kind}</span></div><h4>{moment.title}</h4><p>{moment.explanation}</p>{moment.experiments.length > 0 && <div className="discovery-sites">{moment.experiments.map(id => <button key={id} onClick={() => onExperiment(id)}>{EXPERIMENTS.find(e => e.id === id)?.name}<ArrowUpRight size={12} /></button>)}</div>}<a href={moment.source} target="_blank" rel="noreferrer">Historical source <ExternalLink size={11} /></a></article>)}</section>}
  </div>;
}
