import { PARTICLES } from '../src/lib/particles.ts';
import test from 'node:test';
import assert from 'node:assert/strict';
import { EXPERIMENTS, STORIES, MILESTONES, TOPICS, STAGES, filterExperiments, readSharedView, writeSharedView, RESEARCH, MAP_VIEWS, COVERAGE_SOURCES, coverageFor, CONNECTIONS, CONNECTION_KINDS, connectionsFor, mapCoordinates } from '../src/lib/catalogue.ts';

const all = { particle: null, query: '', topic: 'all', stage: 'all', mode: 'all' };

test('search covers aliases, host laboratories, countries, and scientific questions', () => {
  assert.equal(filterExperiments({ ...all, query: 'FNAL-E-1071' })[0].id, 'dune');
  assert.equal(filterExperiments({ ...all, query: 'superk' })[0].id, 'super-k');
  assert.equal(filterExperiments({ ...all, query: 'g−2' })[0].id, 'muon-g2');
  assert.equal(filterExperiments({ ...all, query: 'SLAC momentum' })[0].id, 'ldmx');
  assert.ok(filterExperiments({ ...all, query: 'japan' }).length >= 4);
  assert.ok(filterExperiments({ ...all, query: 'CERN' }).length >= 20);
});

test('text, topic, and stage filters intersect rather than overriding one another', () => {
  assert.equal(filterExperiments({ query: 'electron', topic: 'dark', stage: 'Proposed' })[0].id, 'ldmx');
  assert.equal(filterExperiments({ query: 'CERN', topic: 'neutrinos', stage: 'Proposed' }).length, 0);
  assert.equal(filterExperiments({ ...all, query: '     ' }).length, EXPERIMENTS.length);
});

test('shared view round trips filters and experiment selection', () => {
  const view = { ...all, query: 'Higgs', topic: 'colliders', experiment: 'cms', story: null, stop: 0, milestone: null };
  assert.deepEqual(readSharedView(writeSharedView(view)), view);
});

test('untrusted URL values cannot introduce invalid topics, stages, or stop indexes', () => {
  const view = readSharedView('?topic=__proto__&stage=imaginary&experiment=missing&milestone=-1');
  assert.equal(view.topic, 'all');
  assert.equal(view.stage, 'all');
  assert.equal(view.experiment, null);
  assert.equal(view.milestone, null);
  assert.equal(readSharedView('?milestone=99').milestone, null);
  assert.equal(readSharedView('?milestone=NaN').milestone, null);
  assert.equal(readSharedView('?story=higgs&stop=999').stop, 1);
  assert.equal(readSharedView('?story=higgs&stop=NaN').stop, 0);
});

test('journey deep links restore the matching stop and clear conflicting filters', () => {
  const view = readSharedView('?story=neutrinos&stop=1&topic=dark&q=CMS&experiment=cms');
  assert.equal(view.experiment, 'dune');
  assert.equal(view.topic, 'all');
  assert.equal(view.query, '');
  assert.equal(view.story, 'neutrinos');
});

test('catalogue records, stories, and milestones form a valid linked collection', () => {
  const ids = new Set(EXPERIMENTS.map(e => e.id));
  assert.equal(ids.size, EXPERIMENTS.length);
  for (const e of EXPERIMENTS) {
    assert.ok(Object.hasOwn(TOPICS, e.topic));
    assert.ok(STAGES.includes(e.stage));
    assert.ok(Math.abs(e.coordinates[0]) <= 180 && Math.abs(e.coordinates[1]) <= 90);
    assert.ok(e.sources.length && e.sources.every(s => new URL(s.url).protocol === 'https:'));
  }
  for (const story of STORIES) for (const stop of story.stops) assert.ok(ids.has(stop.experiment));
  for (const milestone of MILESTONES) assert.ok(ids.has(milestone.experiment));
  assert.deepEqual(MILESTONES.map(m => m.year), [...MILESTONES.map(m => m.year)].sort((a, b) => a - b));
});


test('research views overlap for accelerator-neutrino experiments', () => {
  const beam = filterExperiments({ ...all, mode: 'accelerator' }).map(e => e.id);
  const underground = filterExperiments({ ...all, mode: 'underground' }).map(e => e.id);
  for (const id of ['dune', 'super-k']) {
    assert.ok(beam.includes(id));
    assert.ok(underground.includes(id));
  }
  assert.ok(underground.includes('cuore') && underground.includes('lz'));
  assert.ok(!underground.includes('cms'));
  assert.equal(filterExperiments({ ...all, mode: 'underground', topic: 'rare' })[0].id, 'cuore');
  assert.equal(readSharedView('?mode=unknown').mode, 'all');
  assert.equal(readSharedView('?mode=__proto__').mode, 'all');
  const view = { ...readSharedView(''), mode: 'underground', experiment: 'lz' };
  assert.deepEqual(readSharedView(writeSharedView(view)), view);
});

test('every mapped record has a research identity and valid overlapping views', () => {
  assert.equal(Object.keys(RESEARCH).length, EXPERIMENTS.length);
  for (const e of EXPERIMENTS) {
    assert.ok(RESEARCH[e.id].facility);
    assert.ok(RESEARCH[e.id].views.length);
    assert.ok(RESEARCH[e.id].views.every(view => Object.hasOwn(MAP_VIEWS, view)));
  }
  assert.equal(RESEARCH.pico.recordKind, 'Programme');
  assert.equal(RESEARCH['pandax-4t'].recordKind, 'Detector phase');
});

test('coverage distinguishes mapped, missing, and excluded source entries', () => {
  for (const source of COVERAGE_SOURCES) {
    const { mapped, missing, excluded } = coverageFor(source);
    assert.equal(new Set(source.entries.map(e => e.id)).size, source.entries.length);
    assert.equal(mapped.length + missing.length + excluded.length, source.entries.length);
    assert.ok(mapped.every(e => EXPERIMENTS.some(record => record.id === e.id)));
    assert.ok(missing.every(e => !EXPERIMENTS.some(record => record.id === e.id)));
    assert.ok(excluded.every(e => e.reason));
  }
  const snolab = coverageFor(COVERAGE_SOURCES.find(source => source.id === 'snolab'));
  assert.equal(snolab.mapped.length, 12);
  assert.equal(snolab.missing.length, 0);
  assert.equal(snolab.excluded.length, 4);
  assert.ok(snolab.mapped.some(e => e.id === 'sno'));
  assert.ok(snolab.mapped.some(e => e.id === 'sno-plus'));
});


test('research connections have valid identities, evidence, and symmetric navigation', () => {
  const seen = new Set();
  for (const link of CONNECTIONS) {
    assert.notEqual(link.from, link.to);
    assert.ok(EXPERIMENTS.some(e => e.id === link.from));
    assert.ok(EXPERIMENTS.some(e => e.id === link.to));
    assert.ok(Object.hasOwn(CONNECTION_KINDS, link.kind));
    assert.ok(link.sourceUrls.length && link.sourceUrls.every(url => new URL(url).protocol === 'https:'));
    const key = [link.from, link.to].sort().join(':');
    assert.ok(!seen.has(key), `Duplicate relationship: ${key}`);
    seen.add(key);
    assert.ok(connectionsFor(link.from).some(c => c.experiment.id === link.to));
    assert.ok(connectionsFor(link.to).some(c => c.experiment.id === link.from));
  }
});

test('optional fun facts are attributed to a source linked on that experiment', () => {
  assert.ok(EXPERIMENTS.some(e => e.funFact));
  for (const e of EXPERIMENTS.filter(e => e.funFact)) {
    assert.ok(e.funFact.text.trim().length > 0);
    assert.ok(e.sources.some(source => source.url === e.funFact.sourceUrl));
  }
});


test('polar locations retain true coordinates but project safely at the map edge', () => {
  const icecube = EXPERIMENTS.find(e => e.id === 'icecube');
  assert.equal(icecube.coordinates[1], -90);
  assert.deepEqual(mapCoordinates(icecube), [0, -84]);
  assert.ok(icecube.locationNote.includes('not its physical location'));
  const ams = EXPERIMENTS.find(e => e.id === 'ams-02');
  assert.ok(ams.locationNote.includes('no fixed Earth position'));
});

test('reconciled underground and neutrino snapshots contain no missing scientific rows', () => {
  for (const id of ['snolab', 'lngs', 'fnal-neutrinos']) {
    const source = COVERAGE_SOURCES.find(source => source.id === id);
    assert.equal(coverageFor(source).missing.length, 0, id);
  }
});


test('all 17 Standard Model types have attributed histories and mapped evidence', () => {
  const expected = ['up','down','strange','charm','bottom','top','electron','muon','tau','electron-neutrino','muon-neutrino','tau-neutrino','photon','gluon','w','z','higgs'];
  assert.deepEqual(PARTICLES.map(p => p.id).sort(), expected.sort());
  assert.equal(new Set(PARTICLES.map(p => `${p.row}:${p.column}`)).size, 17);
  for (const particle of PARTICLES) {
    assert.ok(particle.history.length);
    assert.ok(particle.history.some(moment => moment.experiments.length));
    for (const moment of particle.history) {
      assert.ok(['Proposal','Evidence','Discovery'].includes(moment.kind));
      assert.equal(new URL(moment.source).protocol, 'https:');
      for (const id of moment.experiments) assert.ok(EXPERIMENTS.some(e => e.id === id), `${particle.id}: ${id}`);
    }
  }
  for (const id of ['up','down','strange']) assert.equal(PARTICLES.find(p => p.id === id).history[0].kind, 'Proposal');
  assert.equal(PARTICLES.find(p => p.id === 'photon').history[0].kind, 'Proposal');
});

test('particle deep links preserve a selected valid discovery site', () => {
  const view = readSharedView('?particle=charm&experiment=mark-i&mode=underground&q=wrong');
  assert.equal(view.experiment, 'mark-i');
  assert.equal(view.query, '');
  assert.equal(view.mode, 'all');
  assert.equal(view.particle, 'charm');
  assert.deepEqual(readSharedView(writeSharedView(view)), view);
  assert.equal(readSharedView('?particle=unknown').particle, null);
  assert.equal(readSharedView('?particle=higgs&experiment=ldmx').experiment, 'cms');
});

test('historical expansion preserves legacy milestone URLs and stable new event URLs', () => {
  const old = readSharedView('?milestone=2');
  assert.equal(MILESTONES[old.milestone].year, 2012);
  const recent = readSharedView('?event=1964-cp-violation');
  assert.equal(MILESTONES[recent.milestone].experiment, 'cp-violation');
  assert.equal(readSharedView(writeSharedView(recent)).milestone, recent.milestone);
});
