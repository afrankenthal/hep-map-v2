'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Map, { AttributionControl, Layer, Marker, NavigationControl, ScaleControl, Source, type MapRef, type MapLayerMouseEvent } from 'react-map-gl/maplibre';
import { setWorkerUrl, type GeoJSONSource, type StyleSpecification } from 'maplibre-gl';

setWorkerUrl('/maplibre/maplibre-gl-worker.mjs');
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUpRight, Atom, BookOpen, Check, Compass, ExternalLink, Globe2, Layers3, Lightbulb, MapPin, Moon, Network, Search, Share2, Sun, X } from 'lucide-react';
import { PARTICLES } from '@/lib/particles.ts';
import ParticleExplorer from '@/components/ParticleExplorer';
import ContributionForm from '@/components/ContributionForm';
import CatalogueCoverage from '@/components/CatalogueCoverage';
import { CONNECTION_KINDS, connectionsFor, mapCoordinates, MAP_VIEWS, RESEARCH, EXPERIMENTS, MILESTONES, REVIEW_DATE, STORIES, STAGES, TOPICS, filterExperiments, readSharedView, writeSharedView, type Experiment, type MapView, type SharedView, type Topic } from '@/lib/catalogue';

const BASEMAP: StyleSpecification = {
  version: 8,
  sources: { osm: { type: 'raster', tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'], tileSize: 256, maxzoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' } },
  layers: [
    { id: 'paper', type: 'background', paint: { 'background-color': '#eeeee7' } },
    { id: 'basemap', type: 'raster', source: 'osm', paint: { 'raster-saturation': -0.8, 'raster-opacity': 0.75 } },
  ],
};
const INITIAL_VIEW: SharedView = { query: '', topic: 'all', stage: 'all', mode: 'all', particle: null, experiment: null, story: null, stop: 0, milestone: null };
const TOPIC_KEYS = Object.keys(TOPICS) as Topic[];
const BEAM: GeoJSON.FeatureCollection = { type: 'FeatureCollection', features: [
  { type: 'Feature', properties: {}, geometry: { type: 'LineString', coordinates: [[-88.2653, 41.8358], [-103.7512, 44.3516]] } },
  { type: 'Feature', properties: { name: 'Fermilab · planned beam source' }, geometry: { type: 'Point', coordinates: [-88.2653, 41.8358] } },
] };

function TopicMark({ topic }: { topic: Topic }) {
  return <span className="topic-mark" style={{ color: TOPICS[topic].color }} aria-hidden="true">{TOPICS[topic].symbol}</span>;
}

export default function FullMap() {
  const [view, setView] = useState<SharedView>(INITIAL_VIEW);
  const [hydrated, setHydrated] = useState(false);
  const [tab, setTab] = useState<'explore' | 'journeys' | 'particles'>('explore');
  const [dark, setDark] = useState(false);
  const [ready, setReady] = useState(false);
  const [mapError, setMapError] = useState(false);
  const [showBeam, setShowBeam] = useState(false);
  const [showConnections, setShowConnections] = useState(false);
  const [showTimeline, setShowTimeline] = useState(false);
  const [notice, setNotice] = useState('');
  const [clusters, setClusters] = useState<{ id: number; coordinates: [number, number]; count: number }[]>([]);
  const map = useRef<MapRef>(null);
  const search = useRef<HTMLInputElement>(null);
  const journeyStops = useRef<HTMLDivElement>(null);
  const about = useRef<HTMLDialogElement>(null);
  const coverage = useRef<HTMLDialogElement>(null);
  const contribution = useRef<HTMLDialogElement>(null);
  const [contributionRecord, setContributionRecord] = useState<Experiment | undefined>();
  const [contributionSession, setContributionSession] = useState(0);
  const openContribution = (record?: Experiment) => {
    setContributionRecord(record); setContributionSession(value => value + 1);
    contribution.current?.showModal();
  };
  const details = useRef<HTMLDivElement>(null);
  const mapArea = useRef<HTMLElement>(null);
  const visible = useMemo(() => {
    const found = filterExperiments(view);
    const story = STORIES.find(s => s.id === view.story);
    return story ? found.filter(e => story.stops.some(s => s.experiment === e.id)) : found;
  }, [view]);
  const selected = visible.find(e => e.id === view.experiment);
  const related = useMemo(() => selected ? connectionsFor(selected.id) : [], [selected]);
  const connectionFeatures = useMemo<GeoJSON.FeatureCollection>(() => ({ type: 'FeatureCollection', features: selected ? related.map(link => ({ type: 'Feature', properties: {}, geometry: { type: 'LineString', coordinates: [mapCoordinates(selected), mapCoordinates(link.experiment)] } })) : [] }), [selected, related]);
  const connectionGroups = useMemo(() => {
    const groups = new globalThis.Map<string, { coordinates: [number, number]; records: typeof related }>();
    related.forEach(link => {
      const key = mapCoordinates(link.experiment).join(',');
      const group = groups.get(key) || { coordinates: mapCoordinates(link.experiment), records: [] };
      group.records.push(link); groups.set(key, group);
    });
    return Array.from(groups.values());
  }, [related]);
  const activeParticle = PARTICLES.find(p => p.id === view.particle);
  const story = STORIES.find(s => s.id === view.story);
  const milestone = view.milestone === null ? null : MILESTONES[view.milestone];
  const countries = new Set(EXPERIMENTS.map(e => e.country)).size;

  useEffect(() => {
    const strip = journeyStops.current;
    const active = strip?.querySelector<HTMLElement>('[aria-current="step"]');
    if (strip && active && window.matchMedia('(max-width: 760px)').matches) {
      strip.scrollTo({ left: active.offsetLeft - (strip.clientWidth - active.clientWidth) / 2, behavior: 'auto' });
    }
  }, [view.story, view.stop, tab]);

  useEffect(() => {
    const restore = () => {
      const next = readSharedView(window.location.search);
      setView(next);
      setTab(next.particle ? 'particles' : next.story ? 'journeys' : 'explore');
      setShowTimeline(next.milestone !== null);
    };
    restore();
    setHydrated(true);
    window.addEventListener('popstate', restore);
    return () => window.removeEventListener('popstate', restore);
  }, []);

  useEffect(() => {
    if (hydrated) window.history.replaceState(null, '', `${window.location.pathname}${writeSharedView(view)}`);
  }, [view, hydrated]);

  useEffect(() => {
    try { setDark(localStorage.getItem('hep-map-theme') === 'dark'); } catch { /* Storage may be unavailable. */ }
  }, []);

  useEffect(() => {
    if (details.current) details.current.scrollTop = 0;
    setShowBeam(false);
    setShowConnections(false);
  }, [selected?.id]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      const editing = ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName) || target.isContentEditable;
      if (about.current?.open || coverage.current?.open || contribution.current?.open) return;
      if ((event.key === '/' && !editing) || ((event.metaKey || event.ctrlKey) && event.key === 'k')) {
        event.preventDefault();
        setTab('explore');
        setView(v => ({ ...v, particle: null, story: null }));
        requestAnimationFrame(() => search.current?.focus());
      }
      if (event.key === 'Escape') {
        setView(v => ({ ...v, experiment: null, particle: null, story: null, milestone: null }));
        setShowTimeline(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const flyTo = useCallback((experiment: Experiment, beam = false) => {
    if (!map.current) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const mobile = window.matchMedia('(max-width: 760px)').matches;
    const height = map.current.getContainer().clientHeight;
    const padding = mobile ? { top: 150, bottom: Math.max(0, height - 215), left: 25, right: 25 } : { top: 100, bottom: 70, left: 35, right: 360 };
    if (beam) {
      map.current.fitBounds([[-104.5, 39.5], [-87, 46.5]], { padding, duration: reduced ? 0 : 1000 });
    } else {
      map.current.flyTo({ center: mapCoordinates(experiment), padding, zoom: experiment.id === 'dune' ? 6 : 9, duration: reduced ? 0 : 1100 });
    }
  }, []);

  useEffect(() => {
    if (ready && selected) {
      flyTo(selected);
      if (window.matchMedia('(max-width: 760px)').matches) mapArea.current?.scrollIntoView({ block: 'start', behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
    }
  }, [ready, selected, flyTo]);

  const resetMap = useCallback(() => {
    const points = visible.length ? visible : EXPERIMENTS;
    const longitudes = points.map(e => mapCoordinates(e)[0]);
    const latitudes = points.map(e => mapCoordinates(e)[1]);
    map.current?.fitBounds([[Math.min(...longitudes), Math.min(...latitudes)], [Math.max(...longitudes), Math.max(...latitudes)]],
      { padding: { top: 175, bottom: 120, left: 30, right: 30 }, maxZoom: 9, duration: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 800 });
  }, [visible]);

  useEffect(() => { if (ready && !selected) resetMap(); }, [ready, selected, resetMap]);

  const select = (id: string) => {
    setView(v => {
      const activeStory = STORIES.find(s => s.id === v.story);
      const stop = activeStory?.stops.findIndex(s => s.experiment === id) ?? -1;
      const particle = PARTICLES.find(p => p.id === v.particle);
      const keepParticle = particle?.history.some(moment => moment.experiments.includes(id));
      return { ...v, particle: keepParticle ? v.particle : null, experiment: id, stop: stop >= 0 ? stop : v.stop, milestone: null };
    });
    setShowTimeline(false);
    setNotice('');
    if (window.matchMedia('(max-width: 760px)').matches) mapArea.current?.scrollIntoView({ block: 'start', behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  };
  const changeFilter = (patch: Partial<SharedView>) => {
    setView(v => ({ ...v, ...patch, experiment: null, particle: null, story: null, milestone: null }));
    setShowTimeline(false);
  };
  const startStory = (id: string, stop = 0) => {
    const next = STORIES.find(s => s.id === id);
    if (!next) return;
    setTab('journeys');
    setShowTimeline(false);
    setView({ ...INITIAL_VIEW, story: id, stop, experiment: next.stops[stop].experiment });
  };
  const chooseMilestone = (index: number) => {
    setTab('explore');
    setView({ ...INITIAL_VIEW, milestone: index, experiment: MILESTONES[index].experiment });
    setShowTimeline(true);
  };

  const features = useMemo<GeoJSON.FeatureCollection>(() => ({ type: 'FeatureCollection', features: visible.map(e => ({
    type: 'Feature', geometry: { type: 'Point', coordinates: mapCoordinates(e) },
    properties: { id: e.id, name: e.name, color: TOPICS[e.topic].color, proposed: e.stage === 'Proposed' || e.stage === 'In development' },
  })) }), [visible]);

  // HTML cluster counts keep labels local: no third-party glyph service needed.
  const refreshClusters = useCallback(() => {
    if (!map.current?.getLayer('clusters')) return;
    const found = new globalThis.Map<number, { id: number; coordinates: [number, number]; count: number }>();
    map.current.queryRenderedFeatures(undefined, { layers: ['clusters'] }).forEach(feature => {
      if (feature.properties?.cluster && feature.geometry.type === 'Point') {
        const id = Number(feature.properties.cluster_id);
        found.set(id, { id, coordinates: feature.geometry.coordinates as [number, number], count: Number(feature.properties.point_count) });
      }
    });
    const next = Array.from(found.values()).sort((a, b) => a.id - b.id);
    setClusters(previous => JSON.stringify(previous) === JSON.stringify(next) ? previous : next);
  }, []);

  const clickMap = async (event: MapLayerMouseEvent) => {
    const feature = event.features?.[0];
    if (!feature) return;
    if (feature.properties?.cluster) {
      const source = map.current?.getSource('experiments') as GeoJSONSource | undefined;
      if (source && feature.geometry.type === 'Point') {
        try {
          const zoom = await source.getClusterExpansionZoom(Number(feature.properties.cluster_id));
          map.current?.easeTo({ center: feature.geometry.coordinates as [number, number], zoom, duration: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 600 });
        } catch { setNotice('Choose an experiment from the list to explore this location.'); }
      }
    } else if (feature.properties?.id) select(feature.properties.id);
  };

  const followConnection = (id: string) => { setTab('explore'); setView({ ...INITIAL_VIEW, experiment: id }); };
  const frameConnections = () => {
    if (!selected || !related.length || !map.current) return;
    const points = [mapCoordinates(selected), ...related.map(link => mapCoordinates(link.experiment))];
    const mobile = window.matchMedia('(max-width: 760px)').matches;
    const height = map.current.getContainer().clientHeight;
    map.current.fitBounds([[Math.min(...points.map(p => p[0])), Math.min(...points.map(p => p[1]))], [Math.max(...points.map(p => p[0])), Math.max(...points.map(p => p[1]))]], { maxZoom: 9, padding: mobile ? { top: 150, bottom: Math.max(0, height - 215), left: 45, right: 45 } : { top: 210, bottom: 100, left: 65, right: 390 }, duration: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 800 });
  };

  const share = async () => {
    try { await navigator.clipboard.writeText(window.location.href); setNotice('Link copied. This view is ready to share.'); }
    catch { setNotice('Copy the address in your browser to share this view.'); }
  };

  return <main className={`hep-app ${dark ? 'theme-dark' : ''}`}>
    <header className="site-header">
      <a href="/" className="brand" aria-label="HEPMAP home"><span className="brand-symbol"><Atom size={25} strokeWidth={1.5} /></span><span>HEP<span className="brand-light">MAP</span><small>A world of particle physics</small></span></a>
      <div className="header-caption">BIG QUESTIONS. <span>SMALL PARTICLES.</span></div>
      <div className="header-actions">
        <button className="icon-button" onClick={() => { setDark(!dark); try { localStorage.setItem('hep-map-theme', dark ? 'light' : 'dark'); } catch {} }} aria-label={dark ? 'Use light theme' : 'Use dark theme'}>{dark ? <Sun size={18} /> : <Moon size={18} />}</button>
        <button className="about-button coverage-button" onClick={() => coverage.current?.showModal()}>Coverage <ArrowUpRight size={14} /></button>
        <button className="about-button" onClick={() => about.current?.showModal()}>About <ArrowUpRight size={14} /></button>
      </div>
    </header>

    <div className="workspace">
      <aside className="explorer" aria-label="Experiment explorer">
        <div className="explorer-intro"><span className="eyebrow"><span className="tiny-dot" /> THE PARTICLE PHYSICS EXPLORER</span><h1>The smallest things.<br /><em>The biggest questions.</em></h1><p>Explore the places where we look for answers.</p><button className="scope-note" onClick={() => coverage.current?.showModal()}>{EXPERIMENTS.length} mapped records · Coverage incomplete <ArrowUpRight size={11} /></button></div>
        <div className="explorer-tabs" role="tablist" aria-label="Explore mode" onKeyDown={event => {
          if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
          event.preventDefault();
          const modes = ['explore', 'particles', 'journeys'] as const;
          const index = modes.indexOf(tab);
          const next = event.key === 'Home' ? 'explore' : event.key === 'End' ? 'journeys' : modes[(index + (event.key === 'ArrowLeft' ? 2 : 1)) % 3];
          setTab(next);
          if (next !== 'journeys' && story) setView(v => ({ ...v, story: null }));
          if (next !== 'particles' && activeParticle) setView(v => ({ ...v, particle: null }));
          document.getElementById(`${next}-tab`)?.focus();
        }}>
          <button id="explore-tab" role="tab" tabIndex={tab === 'explore' ? 0 : -1} aria-selected={tab === 'explore'} aria-controls="explore-panel" onClick={() => { setTab('explore'); setView(v => ({ ...v, story: null, particle: null })); }}><Compass size={16} /> Explore</button>
          <button id="particles-tab" role="tab" tabIndex={tab === 'particles' ? 0 : -1} aria-selected={tab === 'particles'} aria-controls="particles-panel" onClick={() => { setTab('particles'); if (story) setView(v => ({ ...v, story: null })); }}><Atom size={15} /> Particles</button>
          <button id="journeys-tab" role="tab" tabIndex={tab === 'journeys' ? 0 : -1} aria-selected={tab === 'journeys'} aria-controls="journeys-panel" onClick={() => { setTab('journeys'); setView(v => ({ ...v, particle: null })); }}><BookOpen size={16} /> Journeys <span>{STORIES.length}</span></button>
        </div>

        <section id="explore-panel" role="tabpanel" aria-labelledby="explore-tab" hidden={tab !== 'explore'}>
          <div className="scope-selector"><label htmlFor="map-view">Research view</label><select id="map-view" value={view.mode || 'all'} onChange={e => changeFilter({ mode: e.target.value as MapView, topic: 'all', stage: 'all', query: '' })}>{Object.entries(MAP_VIEWS).map(([id, mode]) => <option value={id} key={id}>{mode.label}</option>)}</select><p>{MAP_VIEWS[view.mode || 'all'].description}</p></div>
          <label className="search-field"><Search size={17} /><span className="sr-only">Search experiments, places, or physics</span><input ref={search} placeholder="Experiment, place, or big question…" value={view.query} onChange={e => changeFilter({ query: e.target.value })} maxLength={200} /><kbd>/</kbd></label>
          <div className="topic-filters" aria-label="Physics topic"><button className={view.topic === 'all' ? 'active' : ''} aria-pressed={view.topic === 'all'} onClick={() => changeFilter({ topic: 'all' })}>All physics</button>{TOPIC_KEYS.map(topic => <button key={topic} className={view.topic === topic ? 'active' : ''} aria-pressed={view.topic === topic} onClick={() => changeFilter({ topic })}><span style={{ background: TOPICS[topic].color }} />{TOPICS[topic].label}</button>)}</div>
          <div className="results-toolbar"><span aria-live="polite">{visible.length} {visible.length === 1 ? 'experiment' : 'experiments'}</span><label><span className="sr-only">Programme stage</span><select value={view.stage} onChange={e => changeFilter({ stage: e.target.value })}><option value="all">All stages</option>{STAGES.map(s => <option key={s}>{s}</option>)}</select></label></div>
          <div className="experiment-list">{visible.map((e, i) => <button key={e.id} className={`experiment-row ${selected?.id === e.id ? 'selected' : ''}`} aria-pressed={selected?.id === e.id} onClick={() => select(e.id)}><span className="row-number">{String(i + 1).padStart(2, '0')}</span><span className="row-copy"><strong>{e.name}</strong><small>{e.laboratory} <span>· {e.country}</span></small></span><TopicMark topic={e.topic} /><ArrowUpRight size={15} /></button>)}</div>
          {!visible.length && <div className="empty-results"><Search size={25} /><h2>No experiments match yet.</h2><p>Try a laboratory, country, or a term such as “Higgs”. This is a growing, curated collection.</p><button className="text-button" onClick={() => changeFilter(INITIAL_VIEW)}>Clear filters <ArrowRight size={15} /></button></div>}
        </section>

        <section id="particles-panel" role="tabpanel" aria-labelledby="particles-tab" hidden={tab !== 'particles'}><ParticleExplorer selected={activeParticle} onChoose={id => {
          const particle = PARTICLES.find(p => p.id === id)!;
          const experiment = particle.history.find(moment => moment.experiments.length)?.experiments[0] || null;
          setView({ ...INITIAL_VIEW, particle: id, experiment });
        }} onExperiment={id => setView(v => ({ ...v, experiment: id }))} /></section>
        <section id="journeys-panel" role="tabpanel" aria-labelledby="journeys-tab" hidden={tab !== 'journeys'}>
          {story ? <div className="active-journey"><button className="text-button" onClick={() => setView({ ...INITIAL_VIEW })}><ArrowLeft size={14} /> All journeys</button><span className="eyebrow">A GUIDED EXPLORATION</span><h2>{story.title}</h2><p>{story.subtitle}</p><p className="trail-progress" role="status">Stop {view.stop + 1} of {story.stops.length}</p><progress className="trail-progress-bar" aria-label="Discovery trail progress" value={view.stop + 1} max={story.stops.length} /><div className="journey-stops" ref={journeyStops}>{story.stops.map((stop, i) => <button className={view.stop === i ? 'active' : ''} aria-current={view.stop === i ? 'step' : undefined} key={stop.experiment} onClick={() => startStory(story.id, i)}><span>{i + 1}</span><div><strong>{stop.title}</strong><small>{stop.date ? `${stop.date} · ` : ''}{EXPERIMENTS.find(e => e.id === stop.experiment)?.name}</small></div></button>)}</div><div className="journey-note"><BookOpen size={17} /><p>Follow an idea across experiments. Each stop connects a question to a real place.</p></div></div> : <div className="journey-list"><p className="journey-intro">A few stops. A different way to see the universe.</p>{STORIES.map((s, i) => <button key={s.id} className="journey-card" onClick={() => startStory(s.id)}><span className="journey-meta">JOURNEY {String(i + 1).padStart(2, '0')} <span>{s.stops.length} stops</span></span><TopicMark topic={s.topic} /><h2>{s.title}</h2><p>{s.subtitle}</p><span className="text-button">Start exploring <ArrowRight size={16} /></span></button>)}</div>}
        </section>
        <footer className="explorer-footer"><span><Globe2 size={13} /> {EXPERIMENTS.length} experiments · {countries} countries & regions</span><button onClick={() => coverage.current?.showModal()}>Coverage & sources <ArrowUpRight size={12} /></button><button onClick={() => openContribution()}>Suggest an experiment <ArrowUpRight size={12} /></button></footer>
      </aside>

      <section ref={mapArea} className={`map-section ${selected ? 'has-selection' : ''} ${showTimeline ? 'with-timeline' : ''}`} aria-label="World map of particle physics experiments">
        <Map ref={map} initialViewState={{ longitude: 12, latitude: 37, zoom: 1.4 }} minZoom={-1} maxZoom={19} mapStyle={BASEMAP} dragRotate={false} touchPitch={false} attributionControl={false} interactiveLayerIds={['clusters', 'experiment-points']} onClick={clickMap}
          onMouseMove={e => { if (map.current) map.current.getCanvas().style.cursor = e.features?.length ? 'pointer' : ''; }}
          onResize={() => { if (ready) { if (showConnections) frameConnections(); else if (selected) flyTo(selected, showBeam); else resetMap(); } }}
          onLoad={() => { map.current?.getMap().keyboard.disableRotation(); map.current?.getMap().touchZoomRotate.disableRotation(); setReady(true); }} onRender={refreshClusters} onError={() => setMapError(true)}>
          <NavigationControl position="top-right" showCompass={false} /><ScaleControl position="bottom-left" /><AttributionControl compact={false} />
          {showConnections && selected && <Source id="research-connections" type="geojson" data={connectionFeatures}><Layer id="research-links" type="line" paint={{ 'line-color': '#4d7165', 'line-width': 1.8, 'line-dasharray': [2, 3], 'line-opacity': 0.85 }} /></Source>}
          <Source id="experiments" type="geojson" data={features} cluster clusterRadius={42} clusterMaxZoom={11}>
            <Layer id="clusters" type="circle" filter={['has', 'point_count']} paint={{ 'circle-color': '#244e47', 'circle-radius': 23, 'circle-stroke-color': '#fffdf7', 'circle-stroke-width': 4 }} />
            <Layer id="experiment-points" type="circle" filter={['!', ['has', 'point_count']]} paint={{ 'circle-color': ['get', 'color'], 'circle-radius': ['case', ['==', ['get', 'id'], selected?.id || ''], 11, 7], 'circle-stroke-width': 3, 'circle-stroke-color': '#fffdf7', 'circle-opacity': ['case', ['get', 'proposed'], 0.65, 1] }} />
          </Source>
          {showConnections && connectionGroups.map(group => <Marker key={group.coordinates.join(',')} longitude={group.coordinates[0]} latitude={group.coordinates[1]} anchor="top-left" offset={[12, 9]}><div className="connection-pin-group">{group.records.map(link => <button key={link.experiment.id} className="connection-pin" onClick={event => { event.stopPropagation(); followConnection(link.experiment.id); }} aria-label={`Explore related experiment ${link.experiment.name}`}>{link.experiment.name}<ArrowUpRight size={12} /></button>)}</div></Marker>)}
          {clusters.map(cluster => <Marker key={cluster.id} longitude={cluster.coordinates[0]} latitude={cluster.coordinates[1]} style={{ pointerEvents: 'none' }}><span className="cluster-label" aria-hidden="true">{cluster.count}</span></Marker>)}
          {showBeam && selected?.id === 'dune' && <Source id="planned-beam" type="geojson" data={BEAM}>
            <Layer id="beam-line" type="line" filter={['==', '$type', 'LineString']} paint={{ 'line-color': TOPICS.neutrinos.color, 'line-width': 3, 'line-dasharray': [2, 2] }} />
            <Layer id="beam-source-point" type="circle" filter={['==', '$type', 'Point']} paint={{ 'circle-color': TOPICS.neutrinos.color, 'circle-radius': 7, 'circle-stroke-color': '#fff', 'circle-stroke-width': 3 }} />
          </Source>}
          {showBeam && selected?.id === 'dune' && <Marker longitude={-88.2653} latitude={41.8358} anchor="bottom" offset={[0, -13]}><span className="beam-label">Fermilab · planned source</span></Marker>}
        </Map>
        <div className="map-heading"><span className="eyebrow">A SHARED PLANET. A SHARED CURIOSITY.</span><h2>{activeParticle ? `The ${activeParticle.name.toLowerCase()} discovery trail` : story ? story.title : 'Where discovery happens.'}</h2><p>{activeParticle ? 'Proposal, evidence, and discovery · choose a historical site' : story ? `Journey · stop ${view.stop + 1} of ${story.stops.length}` : 'Select a place. Follow a question.'}</p></div>
        <div className="map-tools"><button onClick={resetMap} title="Fit visible experiments"><Globe2 size={16} /><span>World view</span></button><button onClick={() => { setShowTimeline(!showTimeline); if (showTimeline) setView(v => ({ ...v, milestone: null })); }} aria-pressed={showTimeline}><Layers3 size={16} /><span>Milestones</span></button></div>
        {showConnections && <span className="connection-caption"><Network size={13} />Research connections · schematic, not beam paths</span>}
        {mapError && <div className="map-error" role="status">Some map tiles could not load. You can still explore the experiment list.</div>}
        {!selected && <div className="map-invitation"><span className="orbit-illustration" aria-hidden="true"><Atom size={42} strokeWidth={0.8} /></span><p>From underground caverns<br />to the frontiers of physics.</p><span>Choose an experiment to begin <ArrowDown size={13} /></span></div>}

        {selected && <article className="detail-panel" aria-label={`${selected.name} details`} ref={details} tabIndex={-1}>
          <div className="detail-top"><span className="eyebrow" style={{ color: TOPICS[selected.topic].color }}>{TOPICS[selected.topic].label}</span><div><button className="icon-button" onClick={share} aria-label="Copy link to this experiment"><Share2 size={16} /></button><button className="icon-button" aria-label="Close experiment details" onClick={() => setView(v => ({ ...v, experiment: null, particle: null, story: null, milestone: null }))}><X size={18} /></button></div></div>
          <div className="detail-title"><TopicMark topic={selected.topic} /><h2>{selected.name}</h2><p>{selected.fullName}</p></div>
          <div className="detail-place"><MapPin size={14} /><span>{selected.place}<small>{selected.laboratory}</small></span></div>
          <div className="record-tags"><span className="stage-badge"><span />{selected.stage}</span><span>{RESEARCH[selected.id].recordKind}</span><span>{RESEARCH[selected.id].setting}</span></div>
          {related.length > 0 && <button className="connection-toggle" aria-pressed={showConnections} onClick={() => { setShowConnections(!showConnections); if (!showConnections) frameConnections(); else flyTo(selected); }}><Network size={14} />{showConnections ? 'Hide map connections' : `Show ${related.length} research connections`}<ArrowUpRight size={13} /></button>}
          {story && <div className="story-excerpt"><span className="eyebrow">STOP {view.stop + 1} / {story.stops.length}</span><h3>{story.stops[view.stop].title}</h3>{story.stops[view.stop].date && <strong className="trail-date">{story.stops[view.stop].date}</strong>}<p>{story.stops[view.stop].text}</p>{story.stops[view.stop].source && <a className="trail-source" href={story.stops[view.stop].source} target="_blank" rel="noreferrer">Evidence for this stop <ExternalLink size={12} /></a>}<div className="story-controls"><button aria-label="Previous journey stop" disabled={view.stop === 0} onClick={() => startStory(story.id, view.stop - 1)}><ArrowLeft size={15} /> Back</button><button disabled={view.stop === story.stops.length - 1} onClick={() => startStory(story.id, view.stop + 1)}>Next stop <ArrowRight size={15} /></button></div></div>}
          <div className="detail-section"><h3>{selected.question}</h3><p>{selected.summary}</p></div>
          {selected.impact && <div className="historical-impact"><span className="eyebrow">WHY IT MATTERED</span><p>{selected.impact}</p></div>}
          {selected.fact && <div className="key-fact"><strong>{selected.fact[0]}</strong><span>{selected.fact[1]}</span></div>}
          {selected.funFact && <aside className="fun-fact" aria-label="Fun fact"><span><Lightbulb size={14} />FUN FACT</span><p>{selected.funFact.text}</p><a href={selected.funFact.sourceUrl} target="_blank" rel="noreferrer">Source <ExternalLink size={11} /></a></aside>}
          {selected.method && <details className="method"><summary>How does it work? <span>+</span></summary><p>{selected.method}</p></details>}
          {selected.id === 'dune' && <div className="beam-control"><button className={`secondary-button ${showBeam ? 'active' : ''}`} aria-pressed={showBeam} onClick={() => { setShowBeam(!showBeam); flyTo(selected, !showBeam); }}>{showBeam ? <Check size={16} /> : <ArrowUpRight size={16} />}{showBeam ? 'Hide planned beam' : 'Show planned beam'}</button><p>Source-to-detector connection; schematic surface projection, not a surveyed beam path.</p></div>}
          {selected.locationNote && <p className="location-note">{selected.locationNote}</p>}
          {related.length > 0 && <section className="related-experiments" aria-label="Related experiments"><h3>Follow the connections</h3>{related.map(link => <div className="related-record" key={link.experiment.id}><span>{CONNECTION_KINDS[link.kind]}</span><button onClick={() => followConnection(link.experiment.id)}><strong>{link.experiment.name}</strong><ArrowRight size={14} /></button><p>{link.label}. {link.note}</p><details><summary>Evidence</summary>{link.sourceUrls.map((url, i) => <a href={url} key={url} target="_blank" rel="noreferrer">Primary source {i + 1}<ExternalLink size={11} /></a>)}</details></div>)}</section>}
          <div className="detail-sources"><span className="eyebrow">GO DEEPER · PRIMARY SOURCES</span>{selected.sources.map(s => <a key={s.url} href={s.url} target="_blank" rel="noreferrer">{s.label}<ExternalLink size={13} /></a>)}<button className="text-button report-correction" onClick={() => openContribution(selected)}>Suggest a correction <ArrowUpRight size={12} /></button><small>Editorial review · {REVIEW_DATE}<br />Programme stage is not live detector status.</small></div>
        </article>}

        <div className="map-legend" aria-label="Map legend">{TOPIC_KEYS.map(t => <span key={t}><i style={{ background: TOPICS[t].color }} />{TOPICS[t].label}</span>)}<small>Numbers group nearby experiments</small></div>
        {showTimeline && <section className="milestone-tray" aria-label="Discovery milestones"><div className="milestone-heading"><span className="eyebrow">MOMENTS THAT CHANGED OUR VIEW</span><button aria-label="Close milestones" className="icon-button" onClick={() => { setShowTimeline(false); setView(v => ({ ...v, milestone: null })); }}><X size={15} /></button></div><div className="milestone-years">{MILESTONES.map((m, i) => <button key={`${m.year}-${m.experiment}`} aria-pressed={view.milestone === i} className={view.milestone === i ? 'active' : ''} onClick={() => chooseMilestone(i)}><span>{m.year}</span><i /><small>{m.title}</small></button>)}</div>{milestone && <div className="milestone-description"><p><strong>{milestone.date}</strong> · {milestone.text}</p><a href={milestone.url} target="_blank" rel="noreferrer">Read the source <ArrowUpRight size={13} /></a></div>}</section>}
        <span className="map-caption">Host sites approximate · Polar sites projected at map edge</span>
      </section>
    </div>
    {notice && <div className="toast" role="status"><Check size={16} /><span>{notice}</span><button onClick={() => setNotice('')} aria-label="Dismiss notification"><X size={14} /></button></div>}
    <dialog className="about-dialog" ref={about} aria-labelledby="about-title"><button className="icon-button dialog-close" aria-label="Close about" onClick={() => about.current?.close()}><X size={20} /></button><span className="eyebrow">CURIOSITY HAS NO BORDERS</span><h2 id="about-title">A map for the<br />particle-physics curious.</h2><p>HEPMAP connects big scientific questions to the places and people exploring them. Start with an experiment, or follow a short journey across an idea.</p><h3>What is particle physics?</h3><p>Particle physics studies the fundamental constituents of matter and radiation, and their interactions. Researchers use accelerators and particles from natural sources, along with low-background detectors, to test these ideas. High-energy physics is a common name for the field; underground research belongs within this broader picture. <a href="https://home.cern/science/physics" target="_blank" rel="noreferrer">Read CERN’s introduction</a>.</p><h3>Built on a shared idea</h3><p>Based on <a href="https://github.com/afrankenthal/hep-map-v2" target="_blank" rel="noreferrer">Andre Frankenthal’s HEP Map</a>. The journeys and milestones take inspiration from the exploratory approach of <a href="https://github.com/DeanChensj/jiangshan-map" target="_blank" rel="noreferrer">Jiangshan Map</a>.</p><h3>A curated starting point</h3><p>These {EXPERIMENTS.length} experiments are a selection, not a complete directory. Descriptions link to primary sources and were reviewed on {REVIEW_DATE}. Locations are approximate; proposed host sites and DUNE’s far site are labelled in their details. Programme stages are editorial categories, not live beam or detector status.</p><button className="text-button" onClick={() => { about.current?.close(); coverage.current?.showModal(); }}>See known coverage gaps <ArrowUpRight size={14} /></button><h3>Help the map grow</h3><p>Missing a site or spotted a mistake? Prepare a source-backed contribution for the project’s GitHub issue tracker.</p><button className="text-button" onClick={() => { about.current?.close(); openContribution(); }}>Suggest an experiment <ArrowUpRight size={14} /></button><h3>Map & navigation</h3><p>Rendered with MapLibre and OpenStreetMap tiles. Use the list as a keyboard-accessible alternative to map pins. Press <kbd>/</kbd> to search and <kbd>Esc</kbd> to close a selection. Your theme preference stays in this browser.</p><button className="primary-button" onClick={() => about.current?.close()}>Back to exploring <ArrowRight size={16} /></button></dialog>
    <dialog className="about-dialog contribution-dialog" ref={contribution} aria-labelledby="contribution-title"><button className="icon-button dialog-close" aria-label="Close contribution" onClick={() => contribution.current?.close()}><X size={20} /></button><ContributionForm key={contributionSession} context={contributionRecord} /></dialog>
    <dialog className="about-dialog coverage-dialog" ref={coverage} aria-labelledby="coverage-title"><button className="icon-button dialog-close" aria-label="Close coverage" onClick={() => coverage.current?.close()}><X size={20} /></button><CatalogueCoverage onSelect={id => { coverage.current?.close(); setTab('explore'); setView({ ...INITIAL_VIEW, experiment: id }); }} /></dialog>
  </main>;
}
