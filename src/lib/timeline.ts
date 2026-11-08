import { MILESTONES } from './catalogue.ts';

/** Sites represented by selected events up to this point, not operating experiments. */
export function milestoneSitesThrough(index: number): Set<string> {
  if (!Number.isInteger(index) || index < 0 || index >= MILESTONES.length) return new Set();
  return new Set(MILESTONES.slice(0, index + 1).map(event => event.experiment));
}
