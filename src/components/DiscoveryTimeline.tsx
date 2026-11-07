'use client';

import { useEffect, useRef } from 'react';
import { ArrowLeft, ArrowRight, ExternalLink, X } from 'lucide-react';
import { MILESTONES, EXPERIMENTS, milestoneKey } from '@/lib/catalogue';

export default function DiscoveryTimeline({ index, onChoose, onClose, onExplore }: {
  index: number; onChoose: (index: number) => void; onClose: () => void; onExplore: (id: string) => void;
}) {
  const strip = useRef<HTMLDivElement>(null);
  const event = MILESTONES[index];
  const record = EXPERIMENTS.find(e => e.id === event.experiment)!;
  useEffect(() => {
    const active = strip.current?.querySelector<HTMLElement>('[aria-pressed="true"]');
    if (active && strip.current) strip.current.scrollTo({ left: active.offsetLeft - strip.current.offsetLeft - (strip.current.clientWidth - active.clientWidth) / 2, behavior: 'auto' });
  }, [index]);
  return <section className="milestone-tray" aria-label="Discovery milestones">
    <div className="milestone-heading"><span className="eyebrow">Through time · selected milestones</span><button aria-label="Close milestones" className="icon-button" onClick={onClose}><X size={15} /></button></div>
    <div className="time-controls">
      <button aria-label="Previous milestone" disabled={index === 0} onClick={() => onChoose(index - 1)}><ArrowLeft size={16} /></button>
      <div><label htmlFor="history-position">{event.year}<span>{event.title}</span></label><input id="history-position" aria-label="Historical milestone" aria-valuetext={`${event.year}: ${event.title}`} type="range" min={0} max={MILESTONES.length - 1} step={1} value={index} onChange={e => onChoose(Number(e.target.value))} /><div className="time-endpoints"><span>{MILESTONES[0].year}</span><span>{MILESTONES[MILESTONES.length - 1].year}</span></div></div>
      <button aria-label="Next milestone" disabled={index === MILESTONES.length - 1} onClick={() => onChoose(index + 1)}><ArrowRight size={16} /></button>
    </div>
    <p className="time-scope">Sites accumulate with each selected event. This is not a record of experiment operating dates.</p>
    <div className="milestone-years" ref={strip}>{MILESTONES.map((m, i) => <button key={milestoneKey(m)} aria-pressed={index === i} className={index === i ? 'active' : ''} onClick={() => onChoose(i)}><span>{m.year}</span><i /><small>{m.title}</small></button>)}</div>
    <div className="milestone-description" aria-live="polite"><p><strong>{event.date}</strong> · {event.text}</p><a href={event.url} target="_blank" rel="noreferrer">Read the source <ExternalLink size={12} /></a></div>
    <button className="text-button time-explore" onClick={() => onExplore(record.id)}>Explore {record.name} <ArrowRight size={13} /></button>
  </section>;
}
