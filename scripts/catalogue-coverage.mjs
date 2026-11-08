import { EXPERIMENTS, COVERAGE_SOURCES, REVIEW_DATE, coverageFor } from '../src/lib/catalogue.ts';

console.log(JSON.stringify({
  reviewed: REVIEW_DATE,
  mappedRecords: EXPERIMENTS.length,
  globalCompleteness: 'Not established',
  scope: 'Particle-physics experiments, programmes and named phases; see the Coverage panel for boundaries.',
  sources: COVERAGE_SOURCES.map(source => {
    const { mapped, missing, excluded } = coverageFor(source);
    return { source: source.name, url: source.url, review: source.review, note: source.note, mapped, missing, excluded };
  }),
}, null, 2));
