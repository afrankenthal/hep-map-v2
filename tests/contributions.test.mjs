import test from 'node:test';
import assert from 'node:assert/strict';
import { contributionDraft, hasSupportingSource } from '../src/lib/contributions.ts';
import { STORIES, readSharedView, writeSharedView } from '../src/lib/catalogue.ts';

test('correction drafts retain stable record identity, references, and literal user text', () => {
  const context = { id: 'cms', name: 'CMS', sources: [{ label: 'CMS', url: 'https://home.cern/science/experiments/cms' }] };
  const draft = contributionDraft('correction', 'CMS & friends', 'A correction? # test\nSecond line', 'https://example.org/paper?a=1&b=2', context);
  const url = new URL(draft.url);
  assert.equal(url.origin, 'https://github.com');
  assert.equal(url.pathname, '/afrankenthal/hep-map-v2/issues/new');
  assert.equal(url.searchParams.get('title'), 'Correction: CMS & friends');
  assert.equal(url.searchParams.get('body'), draft.body);
  assert.ok(draft.body.includes('`cms`'));
  assert.ok(draft.body.includes(context.sources[0].url));
  assert.ok(draft.body.includes('A correction? # test\nSecond line'));
  assert.equal(url.hash, '');
});

test('suggestion drafts have no unrelated experiment context and need an HTTPS reference', () => {
  const draft = contributionDraft('suggestion', 'New detector', 'Location and purpose', 'https://example.org');
  assert.equal(draft.title, 'Experiment suggestion: New detector');
  assert.ok(!draft.body.includes('Current references'));
  assert.ok(hasSupportingSource('A paper\nhttps://example.org'));
  for (const value of ['', 'not a URL', 'javascript:alert(1)', 'http://example.org']) assert.equal(hasSupportingSource(value), false);
});

test('discovery trails retain dated evidence and round-trip every stop', () => {
  for (const id of ['neutrino-discovery', 'quark-discovery']) {
    const story = STORIES.find(story => story.id === id);
    assert.ok(story.stops.length >= 4);
    for (const [stop, entry] of story.stops.entries()) {
      assert.ok(entry.date);
      assert.equal(new URL(entry.source).protocol, 'https:');
      const restored = readSharedView(writeSharedView({ query: '', topic: 'all', stage: 'all', mode: 'all', particle: null, experiment: entry.experiment, story: id, stop, milestone: null }));
      assert.equal(restored.stop, stop);
      assert.equal(restored.experiment, entry.experiment);
      assert.equal(restored.story, id);
    }
  }
});
