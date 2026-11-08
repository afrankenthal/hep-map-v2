import { EXPERIMENTS, MILESTONES } from './catalogue.ts';

export type Surprise = { key: string; kind: 'experiment' | 'fact' | 'milestone'; experiment: string; milestone: number | null };

export const SURPRISES: Surprise[] = [
  ...EXPERIMENTS.map(e => ({ key: `experiment:${e.id}`, kind: 'experiment' as const, experiment: e.id, milestone: null })),
  ...EXPERIMENTS.filter(e => e.funFact).map(e => ({ key: `fact:${e.id}`, kind: 'fact' as const, experiment: e.id, milestone: null })),
  ...MILESTONES.map((m, i) => ({ key: `milestone:${m.year}:${m.experiment}`, kind: 'milestone' as const, experiment: m.experiment, milestone: i })),
];

// Give each kind equal weight so the few fun facts are still easy to discover.
// Skip the current experiment when possible, including other kinds for that site.
export function pickSurprise(currentExperiment: string | null, random = Math.random): Surprise {
  const pool = SURPRISES.filter(item => item.experiment !== currentExperiment);
  const kinds = Array.from(new Set(pool.map(item => item.kind)));
  const kind = kinds[Math.floor(random() * kinds.length)];
  const candidates = pool.filter(item => item.kind === kind);
  return candidates[Math.floor(random() * candidates.length)];
}
