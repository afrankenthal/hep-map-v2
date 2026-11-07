import { HISTORICAL_IMPACTS, LANDMARK_EVENTS } from './history.ts';
import { PARTICLES } from './particles.ts';
import { ADDITIONAL_RECORDS, SITES } from './additional-catalogue.ts';

export const TOPICS = {
  colliders: { label: 'Hadron & collider physics', color: '#207568', symbol: '↗' },
  neutrinos: { label: 'Neutrinos', color: '#386da0', symbol: 'ν' },
  dark: { label: 'Dark matter', color: '#8b5e91', symbol: 'χ' },
  precision: { label: 'Precision', color: '#b46537', symbol: 'μ' },
  cosmic: { label: 'Cosmic particles', color: '#58668b', symbol: 'γ' },
  rare: { label: 'Rare decays', color: '#8a7435', symbol: 'β' },
} as const;

export type Topic = keyof typeof TOPICS;
export type Stage = 'Established' | 'In development' | 'Proposed' | 'Final result' | 'Historical';
export interface Experiment {
  id: string;
  name: string;
  fullName: string;
  laboratory: string;
  place: string;
  country: string;
  coordinates: [number, number];
  topic: Topic;
  stage: Stage;
  aliases: string[];
  question: string;
  summary: string;
  method?: string;
  fact?: [string, string];
  sources: { label: string; url: string }[];
  locationNote?: string;
  impact?: string;
  funFact?: { text: string; sourceUrl: string };
}

// Editorial catalogue. Coordinates are approximate detector / host-site locations,
// not surveyed tunnel geometry. The six original locations are retained from
// Andre Frankenthal's catalogue; additions are approximate host-site positions.
// Stages describe programme maturity, never live beam or detector availability.
export const EXPERIMENTS: Experiment[] = [
  {
    id: 'cms', name: 'CMS', fullName: 'Compact Muon Solenoid',
    laboratory: 'CERN · LHC', place: 'Cessy, France', country: 'France',
    coordinates: [6.07654, 46.3105], topic: 'colliders', stage: 'Established',
    aliases: ['CERN-LHC-CMS', 'Higgs', 'proton', 'solenoid'],
    question: 'What is the universe made of?',
    summary: 'A general-purpose detector studying the Higgs boson, testing the Standard Model, and searching for new particles in collisions at the LHC.',
    method: 'Layers of tracking detectors and calorimeters reconstruct collision debris. A superconducting solenoid bends charged-particle tracks so their momenta can be measured.',
    fact: ['4 tesla', 'Solenoid magnetic field'],
    funFact: { text: 'CMS was assembled in 15 sections above ground, then lowered into its cavern and put together underground.', sourceUrl: 'https://home.cern/science/experiments/cms' },
    sources: [{ label: 'CERN · CMS explained', url: 'https://home.cern/science/experiments/cms' }, { label: 'CMS collaboration', url: 'https://cms.cern/' }],
  },
  {
    id: 'atlas', name: 'ATLAS', fullName: 'A Toroidal LHC Apparatus',
    laboratory: 'CERN · LHC', place: 'Meyrin, Switzerland', country: 'Switzerland',
    coordinates: [6.0558, 46.2354], topic: 'colliders', stage: 'Established',
    aliases: ['CERN-LHC-ATLAS', 'Higgs', 'proton', 'toroid'],
    question: 'What lies beyond the Standard Model?',
    summary: 'An independent, general-purpose view of LHC collisions. Together with CMS, ATLAS announced the discovery of a Higgs-like particle in July 2012.',
    method: 'Tracking, calorimetry, and a large muon system measure the particles flying out of collisions. Its toroidal magnets offer a different design from CMS.',
    fact: ['46 metres', 'Length of the detector'],
    sources: [{ label: 'CERN · ATLAS explained', url: 'https://home.cern/science/experiments/atlas' }, { label: 'ATLAS collaboration', url: 'https://atlas.cern/' }],
  },
  {
    id: 'alice', name: 'ALICE', fullName: 'A Large Ion Collider Experiment',
    laboratory: 'CERN · LHC', place: 'Saint-Genis-Pouilly, France', country: 'France',
    coordinates: [6.020, 46.251], topic: 'colliders', stage: 'Established',
    aliases: ['heavy ions', 'quark gluon plasma', 'QCD', 'lead', 'early universe'],
    question: 'What was matter like just after the Big Bang?',
    summary: 'ALICE studies quark–gluon plasma: an extreme state of matter in which quarks and gluons are no longer confined inside individual protons and neutrons.',
    method: 'Heavy-ion collisions create tiny, short-lived droplets of hot matter. ALICE identifies the particles that emerge to reconstruct its properties.',
    fact: ['Heavy ions', 'A laboratory for hot, dense matter'],
    sources: [{ label: 'CERN · ALICE explained', url: 'https://home.cern/science/experiments/alice' }],
  },
  {
    id: 'lhcb', name: 'LHCb', fullName: 'Large Hadron Collider beauty',
    laboratory: 'CERN · LHC', place: 'Ferney-Voltaire, France', country: 'France',
    coordinates: [6.097, 46.241], topic: 'colliders', stage: 'Established',
    aliases: ['beauty', 'bottom', 'charm', 'flavour', 'flavor', 'antimatter', 'CP violation'],
    question: 'Why do matter and antimatter behave differently?',
    summary: 'LHCb studies particles containing beauty and charm quarks, looking for subtle differences between matter and antimatter and rare decays that test our theories.',
    method: 'A forward spectrometer measures particles travelling close to the beam direction, using precise tracking and particle identification.',
    fact: ['Forward view', 'A different perspective on LHC collisions'],
    sources: [{ label: 'CERN · LHCb explained', url: 'https://home.cern/science/experiments/lhcb' }],
  },
  {
    id: 'belle-ii', name: 'Belle II', fullName: 'The Belle II experiment',
    laboratory: 'KEK · SuperKEKB', place: 'Tsukuba, Japan', country: 'Japan',
    coordinates: [140.076, 36.149], topic: 'colliders', stage: 'Established',
    aliases: ['belle2', 'b factory', 'electron positron', 'flavour', 'flavor', 'antimatter'],
    question: 'Can rare decays reveal new physics?',
    summary: 'Belle II examines the decays of particles produced at the SuperKEKB electron–positron collider, testing the Standard Model through precision measurements.',
    method: 'Collisions of electrons and positrons provide a controlled environment for studying B mesons, charm particles, and tau leptons.',
    fact: ['e⁻ + e⁺', 'Electron–positron collisions'],
    sources: [{ label: 'Belle II · About the experiment', url: 'https://www.belle2.org/about_us/' }],
  },
  {
    id: 'super-k', name: 'Super-Kamiokande', fullName: 'Super-Kamiokande neutrino observatory',
    laboratory: 'Kamioka Observatory', place: 'Hida, Japan', country: 'Japan',
    coordinates: [137.31, 36.425], topic: 'neutrinos', stage: 'Established',
    aliases: ['SuperK', 'SK', 'oscillation', 'water', 'Cherenkov', 'T2K', 'solar', 'atmospheric'],
    question: 'How do neutrinos change identity?',
    summary: 'A huge underground water detector observes neutrinos from the atmosphere, the Sun, and accelerator beams. Its 1998 result provided compelling evidence for neutrino oscillations.',
    method: 'Light sensors watch for Cherenkov light from charged particles produced in neutrino interactions. Rock above the detector shields it from many unwanted particles.',
    fact: ['50,000 tonnes', 'Water in the detector tank'],
    sources: [{ label: 'Kamioka Observatory · Detector overview', url: 'https://www-sk.icrr.u-tokyo.ac.jp/en/sk/about/outline/' }, { label: 'Observatory chronology', url: 'https://www-sk.icrr.u-tokyo.ac.jp/en/about/history/' }],
  },
  {
    id: 'dune', name: 'DUNE', fullName: 'Deep Underground Neutrino Experiment',
    laboratory: 'Fermilab → Sanford Lab', place: 'Lead, South Dakota, USA', country: 'USA',
    coordinates: [-103.7512, 44.3516], topic: 'neutrinos', stage: 'In development',
    aliases: ['ELBNF', 'FNAL-E-1071', 'LBNF', 'liquid argon', 'neutrino', 'antineutrino'],
    question: 'Could neutrinos help explain our matter-filled universe?',
    summary: 'DUNE is being developed to compare neutrinos and antineutrinos over a long journey through Earth, and to study phenomena such as supernova neutrinos.',
    method: 'A planned beam from Fermilab will be measured near its source and again in liquid-argon detectors deep underground in South Dakota.',
    fact: ['1,300 km', 'Source-to-far-detector baseline'],
    locationNote: 'The pin marks the far-detector site. The planned beam source is at Fermilab, Illinois.',
    sources: [{ label: 'DUNE · Science and detector sites', url: 'https://www.dunescience.org/' }],
  },
  {
    id: 'padme', name: 'PADME', fullName: 'Positron Annihilation into Dark Matter Experiment',
    laboratory: 'INFN · Frascati', place: 'Frascati, Italy', country: 'Italy',
    coordinates: [12.6724, 41.8243], topic: 'dark', stage: 'Established',
    aliases: ['dark photon', 'positron', 'missing mass', 'Beam Test Facility', 'BTF'],
    question: 'Is there a portal to a hidden sector?',
    summary: 'PADME searches for a hypothetical dark photon, a possible connection between ordinary particles and a hidden sector.',
    method: 'Positrons strike a thin diamond target. Measuring an outgoing photon lets researchers look for missing mass that could signal an unseen particle.',
    fact: ['Missing mass', 'Searching through what is not detected'],
    sources: [{ label: 'INFN Frascati · PADME', url: 'https://w3.lnf.infn.it/ricerca/fisica-delle-particelle/padme/' }],
  },
  {
    id: 'ldmx', name: 'LDMX', fullName: 'Light Dark Matter eXperiment',
    laboratory: 'SLAC · End Station A', place: 'Menlo Park, California, USA', country: 'USA',
    coordinates: [-122.201, 37.4176], topic: 'dark', stage: 'Proposed',
    aliases: ['missing momentum', 'electron', 'fixed target', 'light dark matter'],
    question: 'Could dark matter be lighter than a proton?',
    summary: 'LDMX is designed to search for light dark matter using an electron beam and a careful accounting of the momentum that leaves a collision.',
    method: 'Measure an electron before and after it strikes a thin target, then check surrounding detectors for ordinary particles that could explain any missing momentum.',
    fact: ['8 GeV', 'Electron beam in the 2025 technical design'],
    locationNote: 'The pin marks the proposed host site; it does not imply an operating experiment.',
    sources: [{ label: 'LDMX collaboration · 2025 technical design', url: 'https://arxiv.org/abs/2508.11833' }],
  },
  {
    id: 'muon-g2', name: 'Muon g−2', fullName: 'Fermilab Muon g−2 experiment',
    laboratory: 'Fermilab', place: 'Batavia, Illinois, USA', country: 'USA',
    coordinates: [-88.2653, 41.8358], topic: 'precision', stage: 'Final result',
    aliases: ['FNAL-E-0989', 'g-2', 'g2', 'muon', 'magnetic moment', 'wobble'],
    question: 'How precisely can we measure a muon’s magnetism?',
    summary: 'Muon g−2 measured the muon magnetic anomaly with extraordinary precision. Its final measurement was announced in June 2025.',
    method: 'Muons circulate in a highly controlled magnetic field. Their spin precession reveals their magnetic properties, providing a precise quantity for comparison with theory.',
    fact: ['127 ppb', 'Precision of the final measurement'],
    sources: [{ label: 'US Department of Energy · Final result', url: 'https://www.energy.gov/science/articles/muon-g-2-announces-most-precise-measurement-magnetic-anomaly-muon' }],
  },
  {
    id: 'lz', name: 'LZ', fullName: 'LUX-ZEPLIN', laboratory: 'Sanford Underground Research Facility',
    place: 'Lead, South Dakota, USA', country: 'USA', coordinates: [-103.7512, 44.3516], topic: 'dark', stage: 'Established',
    aliases: ['LUX ZEPLIN', 'WIMP', 'xenon', 'SURF'], question: 'Does dark matter interact with ordinary matter?',
    summary: 'LZ searches for rare interactions of dark matter with xenon nuclei, deep underground at Sanford Lab.',
    method: 'A two-phase xenon time-projection chamber measures light and charge from interactions. Shielding and additional veto detectors help reject backgrounds.',
    fact: ['Liquid xenon', 'A target for direct dark-matter searches'],
    funFact: { text: 'The name LZ brings together two earlier dark-matter experiments: LUX and ZEPLIN.', sourceUrl: 'https://lz.lbl.gov/' },
    sources: [{ label: 'LZ collaboration · Detector and laboratory', url: 'https://lz.lbl.gov/' }],
    locationNote: 'Approximate shared Sanford Lab site location; this pin is not a surveyed cavern position.',
  },
  {
    id: 'xenonnt', name: 'XENONnT', fullName: 'XENONnT dark-matter experiment', laboratory: 'INFN · Gran Sasso',
    place: 'Gran Sasso, Italy', country: 'Italy', coordinates: [13.573, 42.454], topic: 'dark', stage: 'Established',
    aliases: ['XENON nT', 'LNGS', 'WIMP', 'liquid xenon'], question: 'Can we detect a dark-matter interaction?',
    summary: 'XENONnT looks for dark matter using highly purified liquid xenon in the underground halls of Gran Sasso.',
    method: 'A xenon time-projection chamber measures the light and charge produced by interactions, helping distinguish possible signals from backgrounds.',
    fact: ['Deep underground', 'Shielding helps suppress cosmic-ray backgrounds'],
    sources: [{ label: 'XENON collaboration', url: 'https://xenonexperiment.org/' }, { label: 'Gran Sasso · Research roster', url: 'https://www.lngs.infn.it/it/ricerca/' }],
    locationNote: 'Approximate Gran Sasso host-site location. Experiments sharing this site use the same map coordinates.',
  },
  {
    id: 'cuore', name: 'CUORE', fullName: 'Cryogenic Underground Observatory for Rare Events', laboratory: 'INFN · Gran Sasso',
    place: 'Gran Sasso, Italy', country: 'Italy', coordinates: [13.573, 42.454], topic: 'rare', stage: 'Established',
    aliases: ['LNGS', 'neutrinoless double beta decay', 'tellurium', 'bolometer', 'Majorana'], question: 'Could neutrinos be their own antiparticles?',
    summary: 'CUORE searches for neutrinoless double-beta decay of tellurium-130, a hypothetical process that would reveal a new property of neutrinos.',
    method: 'Very cold tellurium-dioxide crystals act as bolometers: a particle interaction causes a tiny temperature change. Low backgrounds are essential for this rare-decay search.',
    fact: ['988 crystals', 'Tellurium-dioxide bolometers'],
    sources: [{ label: 'Gran Sasso · CUORE research description', url: 'https://www.lngs.infn.it/it/ricerca/' }],
    locationNote: 'Approximate Gran Sasso host-site location; shared with other experiments at this laboratory.',
  },
  {
    id: 'sno-plus', name: 'SNO+', fullName: 'SNO+ neutrino experiment', laboratory: 'SNOLAB',
    place: 'Greater Sudbury, Canada', country: 'Canada', coordinates: [-81.187, 46.472], topic: 'neutrinos', stage: 'Established',
    aliases: ['SNO plus', 'scintillator', 'tellurium', 'double beta decay'], question: 'What can faint flashes tell us about neutrinos?',
    summary: 'SNO+ uses a liquid scintillator to study neutrinos. Its programme also includes a search for neutrinoless double-beta decay using tellurium.',
    method: 'Neutrino interactions produce charged particles that make the scintillator glow. Thousands of light sensors record those flashes.',
    fact: ['Liquid scintillator', 'Detecting particles through tiny flashes of light'],
    funFact: { text: 'SNO+ needs ropes to hold its vessel down. Its scintillator is lighter than water; the heavy water in the earlier SNO experiment needed support in the opposite direction.', sourceUrl: 'https://www.snolab.ca/experiment/sno/' },
    sources: [{ label: 'SNOLAB · SNO+', url: 'https://www.snolab.ca/experiment/sno/' }],
    locationNote: 'Approximate SNOLAB host-site location; SNO+ is a distinct experiment from the earlier SNO.',
  },
  {
    id: 'pico', name: 'PICO', fullName: 'PICO dark-matter programme', laboratory: 'SNOLAB',
    place: 'Greater Sudbury, Canada', country: 'Canada', coordinates: [-81.187, 46.472], topic: 'dark', stage: 'In development',
    aliases: ['bubble chamber', 'WIMP', 'PICO-40', 'PICO-60'], question: 'Could a dark-matter particle leave a bubble?',
    summary: 'PICO searches for dark matter with superheated-fluid bubble chambers. This record represents the programme rather than separate detector generations.',
    method: 'An interaction can trigger a bubble in a superheated liquid. Cameras and acoustic sensors help researchers characterise each event.',
    fact: ['Bubble chambers', 'Watching for rare interactions'],
    funFact: { text: '“Superheated” does not mean hot to the touch: PICO’s refrigerant can be slightly cooler than room temperature.', sourceUrl: 'https://www.snolab.ca/experiment/pico/' },
    sources: [{ label: 'SNOLAB · PICO (commissioning listing)', url: 'https://www.snolab.ca/experiment/pico/' }],
    locationNote: 'Approximate SNOLAB host-site location. Programme-level record; historical PICO phases are not separately mapped yet.',
  },
  {
    id: 'supercdms', name: 'SuperCDMS', fullName: 'Super Cryogenic Dark Matter Search at SNOLAB', laboratory: 'SNOLAB',
    place: 'Greater Sudbury, Canada', country: 'Canada', coordinates: [-81.187, 46.472], topic: 'dark', stage: 'In development',
    aliases: ['germanium', 'silicon', 'cryogenic', 'light dark matter'], question: 'How small a dark-matter signal can we hear?',
    summary: 'SuperCDMS uses very cold silicon and germanium crystals to search for the small energy deposits expected from light dark-matter interactions.',
    method: 'Sensitive sensors measure the energy deposited in cryogenic crystals. The low operating temperature reduces thermal noise.',
    fact: ['Cryogenic crystals', 'Silicon and germanium targets'],
    sources: [{ label: 'SNOLAB · SuperCDMS (commissioning listing)', url: 'https://www.snolab.ca/experiment/supercdms/' }],
    locationNote: 'Approximate SNOLAB host-site location. This record is the SNOLAB installation, not its predecessor at Soudan.',
  },
  {
    id: 'juno', name: 'JUNO', fullName: 'Jiangmen Underground Neutrino Observatory', laboratory: 'JUNO · IHEP',
    place: 'Kaiping, Guangdong, China', country: 'China', coordinates: [112.518, 22.119], topic: 'neutrinos', stage: 'Established',
    aliases: ['reactor', 'mass ordering', 'mass hierarchy', 'scintillator'], question: 'How are the neutrino masses ordered?',
    summary: 'JUNO studies neutrinos using a large underground liquid-scintillator detector, including antineutrinos from nearby nuclear power plants.',
    method: 'Light sensors collect the flashes produced by particle interactions. Precise energy measurements allow researchers to study neutrino oscillations.',
    fact: ['20,000 tonnes', 'Liquid-scintillator detector design'],
    sources: [{ label: 'JUNO collaboration · Introduction and results', url: 'https://juno.ihep.cas.cn/' }],
    locationNote: 'Approximate experiment-site location, not a surveyed cavern position.',
  },
  {
    id: 'pandax-4t', name: 'PandaX-4T', fullName: 'PandaX-4T xenon experiment', laboratory: 'China Jinping Underground Laboratory',
    place: 'Jinping, Sichuan, China', country: 'China', coordinates: [101.710, 28.153], topic: 'dark', stage: 'Established',
    aliases: ['CJPL', 'xenon', 'PandaX', 'dark matter', 'double beta decay'], question: 'What might a xenon detector reveal underground?',
    summary: 'PandaX-4T used xenon to search for dark matter and other rare processes at Jinping. The collaboration lists its operation from 2021 to 2026.',
    method: 'A two-phase xenon time-projection chamber measures interaction signals. Underground shielding helps reduce background particles from cosmic rays.',
    fact: ['2021–2026', 'Operation period listed by the collaboration'],
    sources: [{ label: 'PandaX collaboration · Experiment generations', url: 'https://pandax.sjtu.edu.cn/' }],
    locationNote: 'Approximate Jinping host-site location. PandaX-I, PandaX-II, and the planned PandaX-20T are separate phases, not included in this pin.',
  },
];

export const STAGES: Stage[] = ['Established', 'In development', 'Proposed', 'Final result', 'Historical'];
export const REVIEW_DATE = '6 November 2026';

export const MAP_VIEWS = {
  all: { label: 'All particle physics', description: 'Accelerators, neutrinos, dark matter, and rare-process searches.' },
  accelerator: { label: 'Accelerator experiments', description: 'Collider, fixed-target, precision-beam, and accelerator-neutrino experiments.' },
  nonaccelerator: { label: 'Non-accelerator experiments', description: 'Reactor, natural-source, precision, and low-background research without an accelerator beam.' },
  cosmic: { label: 'Cosmic & natural sources', description: 'Particle observatories using cosmic rays, ice, water, and natural particle sources.' },
  precision: { label: 'Precision & rare processes', description: 'Precision measurements and rare-process searches across different experimental approaches.' },
  underground: { label: 'Underground & rare events', description: 'Low-background neutrino, dark-matter, and rare-decay research. DUNE and Super-Kamiokande also use accelerator beams.' },
} as const;
export type MapView = keyof typeof MAP_VIEWS;
export interface ResearchMetadata {
  facility: string;
  views: ('accelerator' | 'underground' | 'cosmic' | 'precision' | 'nonaccelerator')[];
  setting: 'Underground' | 'Surface' | 'Host site' | 'Ice' | 'Underwater';
  recordKind: 'Experiment' | 'Programme' | 'Detector phase';
}
// Views are overlapping research approaches. Underground collider caverns alone
// do not make an experiment a low-background underground-search programme.
export const RESEARCH: Record<string, ResearchMetadata> = {
  cms: { facility: 'cern', views: ['accelerator'], setting: 'Underground', recordKind: 'Experiment' },
  atlas: { facility: 'cern', views: ['accelerator'], setting: 'Underground', recordKind: 'Experiment' },
  alice: { facility: 'cern', views: ['accelerator'], setting: 'Underground', recordKind: 'Experiment' },
  lhcb: { facility: 'cern', views: ['accelerator'], setting: 'Underground', recordKind: 'Experiment' },
  'belle-ii': { facility: 'kek', views: ['accelerator'], setting: 'Underground', recordKind: 'Experiment' },
  'super-k': { facility: 'kamioka', views: ['accelerator', 'underground'], setting: 'Underground', recordKind: 'Experiment' },
  dune: { facility: 'surf', views: ['accelerator', 'underground'], setting: 'Underground', recordKind: 'Experiment' },
  padme: { facility: 'frascati', views: ['accelerator'], setting: 'Surface', recordKind: 'Experiment' },
  ldmx: { facility: 'slac', views: ['accelerator'], setting: 'Surface', recordKind: 'Experiment' },
  'muon-g2': { facility: 'fermilab', views: ['accelerator'], setting: 'Surface', recordKind: 'Experiment' },
  lz: { facility: 'surf', views: ['underground'], setting: 'Underground', recordKind: 'Experiment' },
  xenonnt: { facility: 'lngs', views: ['underground'], setting: 'Underground', recordKind: 'Detector phase' },
  cuore: { facility: 'lngs', views: ['underground'], setting: 'Underground', recordKind: 'Experiment' },
  'sno-plus': { facility: 'snolab', views: ['underground'], setting: 'Underground', recordKind: 'Experiment' },
  pico: { facility: 'snolab', views: ['underground'], setting: 'Underground', recordKind: 'Programme' },
  supercdms: { facility: 'snolab', views: ['underground'], setting: 'Underground', recordKind: 'Experiment' },
  juno: { facility: 'juno', views: ['underground'], setting: 'Underground', recordKind: 'Experiment' },
  'pandax-4t': { facility: 'cjpl', views: ['underground'], setting: 'Underground', recordKind: 'Detector phase' },
};

// Additional records have concise source-backed descriptions. Detailed methods
// and quantitative facts are optional until independently curated.
for (const [id, name, siteId, topic, stage, summary, source, listedViews] of ADDITIONAL_RECORDS) {
  const site = SITES[siteId];
  const views: ResearchMetadata['views'] = [...listedViews];
  if ((topic === 'rare' || topic === 'precision') && !views.includes('precision')) views.push('precision');
  const question = { colliders: 'How do particles and strongly interacting matter behave?', neutrinos: 'What can this experiment tell us about neutrinos?', dark: 'What could dark matter be?', precision: 'Do precise measurements agree with our theories?', rare: 'Could a rare process reveal new physics?', cosmic: 'What can particles from the universe tell us?' }[topic];
  EXPERIMENTS.push({ id, name, fullName: name, laboratory: site.name, place: site.place, country: site.country,
    coordinates: [...site.coordinates], topic, stage, aliases: [id, siteId], question, summary, impact: HISTORICAL_IMPACTS[id],
    sources: [{ label: 'Official experiment / laboratory source', url: source }],
    locationNote: id === 'ams-02' ? 'The instrument orbits on the International Space Station and has no fixed Earth position. This marker identifies its ground control centre at CERN, as described in the source.' : siteId === 'pole' ? 'The observatory is at the South Pole (90° S). Its pin is projected at 84° S, the display edge of this Mercator map; that is not its physical location.' : 'Approximate host-site position, shared by co-located experiments. This is not a surveyed detector position.' });
  RESEARCH[id] = { facility: siteId, views, setting: site.setting, recordKind: ['darkside-50', 'darkside-20k', 'deap-1', 'pandax-i', 'pandax-ii', 'pandax-20t'].includes(id) ? 'Detector phase' : 'Experiment' };
}
for (const e of EXPERIMENTS) {
  if (!RESEARCH[e.id].views.includes('accelerator') || RESEARCH[e.id].views.includes('underground') || RESEARCH[e.id].views.includes('cosmic')) RESEARCH[e.id].views.push('nonaccelerator');
  if ((e.topic === 'rare' || e.topic === 'precision') && !RESEARCH[e.id].views.includes('precision')) RESEARCH[e.id].views.push('precision');
}

export function mapCoordinates(experiment: Experiment): [number, number] {
  return [experiment.coordinates[0], Math.max(-84, Math.min(84, experiment.coordinates[1]))];
}

export interface CoverageEntry { id: string; name: string; reason?: string; }
export interface CoverageSource {
  id: string; name: string; url: string;
  review: 'Roster reconciled' | 'Partial review';
  note: string;
  entries: CoverageEntry[];
}
// These are explicit source snapshots, NOT a denominator for all experiments.
// SNOLAB covers all 16 entries on the reviewed linked roster (including exclusions).
// Every other source is deliberately marked partial. Missing rows remain visible.
export const COVERAGE_SOURCES: CoverageSource[] = [
  { id: 'snolab', name: 'SNOLAB', url: 'https://www.snolab.ca/science/experiments/', review: 'Roster reconciled',
    note: 'All entries on this roster page reconciled, including completed experiments. Programme entries do not establish coverage of every historical detector phase.', entries: [
      { id: 'pico', name: 'PICO' }, { id: 'deap-3600', name: 'DEAP-3600' }, { id: 'damic', name: 'DAMIC' },
      { id: 'halo', name: 'HALO' }, { id: 'news-g', name: 'NEWS-G' }, { id: 'sno-plus', name: 'SNO+' },
      { id: 'flame', name: 'FLAME', reason: 'Biology; outside the particle-physics scope.' },
      { id: 'repair', name: 'REPAIR', reason: 'Biology; outside the particle-physics scope.' },
      { id: 'sensei', name: 'SENSEI' }, { id: 'supercdms', name: 'SuperCDMS' },
      { id: 'cute', name: 'CUTE', reason: 'Detector-test facility; track as infrastructure rather than an experiment.' },
      { id: 'miniclean', name: 'MiniCLEAN' }, { id: 'sno', name: 'SNO' }, { id: 'picasso', name: 'PICASSO' }, { id: 'deap-1', name: 'DEAP-1' },
      { id: 'pups', name: 'PUPS', reason: 'Engineering seismology; outside the particle-physics scope.' },
    ] },
  { id: 'lngs', name: 'Gran Sasso · research table', url: 'https://www.lngs.infn.it/it/ricerca/', review: 'Roster reconciled',
    note: 'Entries in the linked research table reconciled. Historical phases and separate navigation/archive listings still require review.', entries: [
      { id: 'xenonnt', name: 'XENONnT' }, { id: 'cuore', name: 'CUORE' }, { id: 'borexino', name: 'Borexino' },
      { id: 'cupid', name: 'CUPID' }, { id: 'cresst', name: 'CRESST' }, { id: 'legend-200', name: 'LEGEND-200' },
      { id: 'darkside-50', name: 'DarkSide-50' }, { id: 'darkside-20k', name: 'DarkSide-20k' },
      { id: 'cobra', name: 'COBRA' }, { id: 'cosinus', name: 'COSINUS' }, { id: 'dama-libra', name: 'DAMA/LIBRA' },
      { id: 'lime-cygnus', name: 'LIME/CYGNUS' }, { id: 'lvd', name: 'LVD' }, { id: 'newsdm', name: 'NEWSdm' }, { id: 'sabre', name: 'SABRE' }, { id: 'vip', name: 'VIP' },
      { id: 'cosmic-silence', name: 'COSMIC SILENCE', reason: 'Biology; outside the particle-physics scope.' },
      { id: 'ginger', name: 'GINGER', reason: 'Gravitational gyroscope measurement; outside the particle-experiment scope used here.' },
      { id: 'luna', name: 'LUNA', reason: 'Nuclear astrophysics; a related field outside the present particle-physics catalogue scope.' },
    ] },
  { id: 'fnal-neutrinos', name: 'Fermilab · neutrino roster', url: 'https://neutrinophysics.fnal.gov/experiments/', review: 'Roster reconciled',
    note: 'Named experiments on this neutrino roster only; this is not the full Fermilab experimental history or test-beam programme.', entries: [
      { id: 'nova', name: 'NOvA' }, { id: 'icarus', name: 'ICARUS' }, { id: 'annie', name: 'ANNIE' }, { id: 'dune', name: 'DUNE' },
      { id: 'sbnd', name: 'SBND' }, { id: 'argoneut', name: 'ArgoNeuT' }, { id: 'lariat', name: 'LArIAT' }, { id: 'microboone', name: 'MicroBooNE' },
      { id: 'minerva', name: 'MINERvA' }, { id: 'miniboone', name: 'MiniBooNE' }, { id: 'minos', name: 'MINOS / MINOS+' },
      { id: 'sbn-programme', name: 'SBN programme heading', reason: 'A grouping of detector experiments, not an additional detector identity.' },
    ] },
  { id: 'cern', name: 'CERN · named particle experiments', url: 'https://home.cern/science/experiments', review: 'Partial review',
    note: 'Named LHC, fixed-target, antimatter, and non-accelerator entries reviewed. Historic archives, instrument subprojects, and CERN-recognised experiments still need reconciliation.', entries: [
      ...['cms', 'atlas', 'alice', 'lhcb', 'totem', 'lhcf', 'moedal', 'faser', 'snd-lhc', 'na61', 'na62', 'na63', 'na64', 'na65', 'compass', 'amber', 'dirac', 'alpha', 'aegis', 'asacusa', 'base', 'gbar', 'puma', 'athena', 'atrap', 'ace', 'ams-02', 'cast', 'osqar'].map(id => ({ id, name: id.toUpperCase() })),
      { id: 'cloud', name: 'CLOUD', reason: 'Atmospheric/aerosol research; outside the particle-experiment scope used here.' },
      { id: 'ua9', name: 'UA9', reason: 'Beam-control R&D; infrastructure work outside the present catalogue scope.' },
    ] },
  { id: 'cjpl', name: 'Jinping · PandaX phases', url: 'https://pandax.sjtu.edu.cn/', review: 'Partial review',
    note: 'PandaX generations only; this is not a complete Jinping laboratory roster.', entries: [
      { id: 'pandax-i', name: 'PandaX-I' }, { id: 'pandax-ii', name: 'PandaX-II' }, { id: 'pandax-4t', name: 'PandaX-4T' },
      { id: 'pandax-20t', name: 'PandaX-20T' },
    ] },
];

export function coverageFor(source: CoverageSource) {
  const ids = new Set(EXPERIMENTS.map(e => e.id));
  return {
    mapped: source.entries.filter(e => !e.reason && ids.has(e.id)),
    missing: source.entries.filter(e => !e.reason && !ids.has(e.id)),
    excluded: source.entries.filter(e => Boolean(e.reason)),
  };
}

export const DISCOVERY_SOURCES = [
  { name: 'INSPIRE · Experiments', url: 'https://inspirehep.net/experiments', note: 'Metadata snapshot imported. Candidate identities, detector phases, and source-only records still need review.' },
  { name: 'Underground laboratory directory · Gran Sasso', url: 'https://www.lngs.infn.it/it/altri-laboratori-sotterranei', note: 'Find additional facilities; verify each laboratory and its roster independently.' },
  { name: 'CERN · Experiments', url: 'https://home.cern/science/experiments', note: 'Complete roster audit pending; the map currently includes a selection.' },
];
export const COVERAGE_GAPS = 'Global and historical completeness remains unverified. Additional facilities, reactor experiments, detector phases, and space-based particle detectors still need source reconciliation.';

export const CONNECTION_KINDS = { facility: 'Shared laboratory', technology: 'Shared technology', question: 'Related physics', discovery: 'Shared discovery' } as const;
export interface ExperimentConnection {
  from: string; to: string; kind: keyof typeof CONNECTION_KINDS; label: string; note: string; sourceUrls: string[];
}
// Editorial relationships supported by the linked sources. These do not imply
// a formal collaboration, a beamline, or a physical route between locations.
export const CONNECTIONS: ExperimentConnection[] = [
  { from: 'sno', to: 'sno-plus', kind: 'technology', label: 'A new experiment in a familiar vessel', note: 'SNO+ reuses the earlier SNO detector with a different detection medium.', sourceUrls: ['https://www.snolab.ca/experiment/sno/'] },
  { from: 'cms', to: 'atlas', kind: 'discovery', label: 'Two independent Higgs detectors', note: 'Both collaborations announced a Higgs-like particle on 4 July 2012.', sourceUrls: ['https://home.cern/science/physics/higgs-boson'] },
  { from: 'cms', to: 'alice', kind: 'facility', label: 'Different questions at the LHC', note: 'General-purpose collision physics and heavy-ion physics share the same collider.', sourceUrls: ['https://home.cern/science/experiments/cms', 'https://home.cern/science/experiments/alice'] },
  { from: 'cms', to: 'lhcb', kind: 'facility', label: 'Another view of LHC collisions', note: 'CMS and LHCb use different detector designs for their physics programmes.', sourceUrls: ['https://home.cern/science/experiments/cms', 'https://home.cern/science/experiments/lhcb'] },
  { from: 'lz', to: 'dune', kind: 'facility', label: 'Neighbours at Sanford Lab', note: 'Dark-matter and neutrino research share an underground host laboratory.', sourceUrls: ['https://lz.lbl.gov/', 'https://www.dunescience.org/'] },
  { from: 'xenonnt', to: 'cuore', kind: 'facility', label: 'Under the same mountain', note: 'These experiments use different techniques in Gran Sasso’s underground laboratory.', sourceUrls: ['https://www.lngs.infn.it/it/ricerca/'] },
  { from: 'sno-plus', to: 'pico', kind: 'facility', label: 'Two searches at SNOLAB', note: 'Scintillator and bubble-chamber techniques investigate different particle questions.', sourceUrls: ['https://www.snolab.ca/experiment/sno/', 'https://www.snolab.ca/experiment/pico/'] },
  { from: 'pico', to: 'supercdms', kind: 'facility', label: 'Different dark-matter detectors', note: 'Bubble chambers and cryogenic crystals share the SNOLAB setting.', sourceUrls: ['https://www.snolab.ca/experiment/pico/', 'https://www.snolab.ca/experiment/supercdms/'] },
  { from: 'lz', to: 'xenonnt', kind: 'technology', label: 'Liquid xenon, different laboratories', note: 'Both use xenon time-projection chambers to search for rare interactions.', sourceUrls: ['https://lz.lbl.gov/', 'https://xenonexperiment.org/'] },
  { from: 'xenonnt', to: 'pandax-4t', kind: 'technology', label: 'Following the xenon approach', note: 'Xenon-based dark-matter searches extend from Italy to China.', sourceUrls: ['https://xenonexperiment.org/', 'https://pandax.sjtu.edu.cn/'] },
  { from: 'cuore', to: 'sno-plus', kind: 'question', label: 'Are neutrinos their own antiparticles?', note: 'Both programmes include neutrinoless double-beta-decay searches, using different detector media.', sourceUrls: ['https://www.lngs.infn.it/it/ricerca/', 'https://www.snolab.ca/experiment/sno/'] },
  { from: 'ldmx', to: 'supercdms', kind: 'question', label: 'Two approaches to light dark matter', note: 'Accelerator production and underground scattering offer complementary ways to search.', sourceUrls: ['https://arxiv.org/abs/2508.11833', 'https://www.snolab.ca/experiment/supercdms/'] },
  { from: 'dune', to: 'super-k', kind: 'question', label: 'The changing neutrino', note: 'Both investigate neutrino properties, using different detector technologies and baselines.', sourceUrls: ['https://www.dunescience.org/', 'https://www-sk.icrr.u-tokyo.ac.jp/en/sk/about/outline/'] },
  { from: 'padme', to: 'ldmx', kind: 'question', label: 'Searching through what is missing', note: 'Missing mass and missing momentum provide different handles on hidden-sector particles.', sourceUrls: ['https://w3.lnf.infn.it/ricerca/fisica-delle-particelle/padme/', 'https://arxiv.org/abs/2508.11833'] },
  { from: 'juno', to: 'super-k', kind: 'question', label: 'Different windows on neutrinos', note: 'Scintillator and water-Cherenkov detectors offer different measurements of neutrino behaviour.', sourceUrls: ['https://juno.ihep.cas.cn/', 'https://www-sk.icrr.u-tokyo.ac.jp/en/sk/about/outline/'] },
];

export function connectionsFor(id: string) {
  const current = EXPERIMENTS.find(e => e.id === id);
  if (!current) return [];
  const curated = CONNECTIONS.filter(c => c.from === id || c.to === id).map(connection => ({
    ...connection, experiment: EXPERIMENTS.find(e => e.id === (connection.from === id ? connection.to : connection.from))!,
  }));
  const used = new Set([id, ...curated.map(c => c.experiment.id)]);
  const grouped: (ExperimentConnection & { experiment: Experiment })[] = [];
  for (const candidate of EXPERIMENTS) {
    if (used.has(candidate.id)) continue;
    if (RESEARCH[candidate.id].facility !== RESEARCH[id].facility) continue;
    grouped.push({ from: id, to: candidate.id, kind: 'facility', label: 'Explore the same host site', note: 'Grouped by the catalogued host laboratory; this does not imply a formal collaboration.', sourceUrls: Array.from(new Set([...current.sources.map(s => s.url), ...candidate.sources.map(s => s.url)])), experiment: candidate });
    used.add(candidate.id);
    if (grouped.length >= 2) break;
  }
  for (const candidate of EXPERIMENTS) {
    if (used.has(candidate.id) || candidate.topic !== current.topic) continue;
    grouped.push({ from: id, to: candidate.id, kind: 'question', label: 'Explore related physics', note: 'An editorial link by research topic, not a claim of a joint project.', sourceUrls: Array.from(new Set([...current.sources.map(s => s.url), ...candidate.sources.map(s => s.url)])), experiment: candidate });
    used.add(candidate.id);
    if (curated.length + grouped.length >= 4) break;
  }
  return [...curated, ...grouped];
}

export interface DiscoveryStop { experiment: string; title: string; text: string; date?: string; source?: string; }
export interface DiscoveryStory { id: string; title: string; subtitle: string; topic: Topic; stops: DiscoveryStop[]; }
export const STORIES: DiscoveryStory[] = [
  { id: 'neutrino-discovery', title: 'How neutrinos changed physics', subtitle: 'From a reactor signal to the mystery of changing flavours.', topic: 'neutrinos', stops: [
    { experiment: 'reines-cowan', date: '1956', title: 'Catch the almost invisible', text: 'At Savannah River, reactor antineutrinos produced a characteristic pair of signals. A particle once introduced to explain beta decay could finally be detected.', source: 'https://www.fnal.gov/pub/science/particle-physics-101/worldwide-discoveries.html' },
    { experiment: 'bnl-two-neutrino', date: '1962', title: 'One neutrino is not enough', text: 'A neutrino beam at Brookhaven produced muons rather than electrons. The result established that the muon neutrino differs from the electron neutrino.', source: 'https://www.bnl.gov/science/neutrinos.php' },
    { experiment: 'homestake', date: 'From 1968', title: 'The Sun leaves a puzzle', text: 'Deep in the Homestake mine, a chlorine detector measured fewer solar electron neutrinos than expected. Was the solar model wrong, or were neutrinos doing something unexpected?', source: 'https://www.bnl.gov/science/neutrinos.php' },
    { experiment: 'super-k', date: '1998', title: 'Distance makes a difference', text: 'Atmospheric muon neutrinos showed a dependence on their travel distance through Earth. This was compelling evidence for neutrino oscillations: flavour changes during flight.', source: 'https://www-sk.icrr.u-tokyo.ac.jp/en/about/history/' },
    { experiment: 'sno', date: '2001–2002', title: 'The missing flavours turn up', text: 'Heavy water let SNO compare electron-neutrino interactions with reactions sensitive to all active flavours. The solar deficit reflected flavour change rather than a failure of the Sun to produce neutrinos.', source: 'https://arxiv.org/abs/nucl-ex/0204008' },
  ] },
  { id: 'quark-discovery', title: 'Following the quarks', subtitle: 'Scattering clues, unexpected resonances, and the final quark.', topic: 'colliders', stops: [
    { experiment: 'slac-dis', date: '1968–1969', title: 'Look inside the proton', text: 'Electron scattering at SLAC revealed point-like constituents inside nucleons. These observations helped turn the quark picture into an experimental description of matter.', source: 'https://cern-courier.web.cern.ch/a/back-to-the-future/' },
    { experiment: 'mark-i', date: '1974', title: 'A resonance changes the picture', text: 'SLAC’s Mark I and Brookhaven’s E598 independently observed the J/ψ. Its interpretation as charm–anticharm bound matter brought a new quark flavour into focus.', source: 'https://www.fnal.gov/pub/science/historical-results/' },
    { experiment: 'e288', date: '1977', title: 'Evidence for bottom', text: 'Fermilab’s E288 found the upsilon resonance in muon pairs. The new bound state supplied evidence for the bottom quark and another generation of matter.', source: 'https://www.fnal.gov/pub/science/historical-results/' },
    { experiment: 'cdf', date: '1995', title: 'Complete the quark family', text: 'CDF and DØ independently established the top quark at the Tevatron. The result completed the six-quark family of the Standard Model.', source: 'https://www.fnal.gov/pub/science/historical-results/' },
  ] },
  { id: 'higgs', title: 'Two views of the Higgs', subtitle: 'One discovery. Two independent detectors.', topic: 'colliders' as Topic, stops: [
    { experiment: 'cms', title: 'A solenoid and a question', text: 'At CMS, layers of detectors reconstruct the products of proton collisions. The Higgs search relied on recognising rare decay patterns among an enormous background.' },
    { experiment: 'atlas', title: 'Independent evidence', text: 'Across the LHC ring, ATLAS uses a different detector design. On 4 July 2012, the two collaborations announced a new particle consistent with the Higgs boson.' },
  ] },
  { id: 'neutrinos', title: 'The changing neutrino', subtitle: 'From a mountain in Japan to a journey through Earth.', topic: 'neutrinos' as Topic, stops: [
    { experiment: 'super-k', title: 'A clue beneath a mountain', text: 'In 1998, Super-Kamiokande found that atmospheric muon neutrinos behaved differently depending on the distance they travelled: compelling evidence for oscillations.' },
    { experiment: 'dune', title: 'The next long journey', text: 'DUNE will compare neutrinos and antineutrinos across a 1,300 km baseline. Show the planned beam connection to see how its near and far sites fit together.' },
  ] },
  { id: 'invisible', title: 'Looking for the invisible', subtitle: 'Two ways to search for a hidden sector.', topic: 'dark' as Topic, stops: [
    { experiment: 'padme', title: 'Account for the missing mass', text: 'PADME uses positrons and a thin target to search for dark photons. The key is to measure what is visible well enough to infer what might be missing.' },
    { experiment: 'ldmx', title: 'Account for the missing momentum', text: 'The proposed LDMX experiment takes a different approach with electrons. A momentum imbalance could flag an invisible interaction, provided ordinary explanations can be excluded.' },
  ] },
];

const RECENT_MILESTONES = [
  { year: 1996, date: '1 April 1996', experiment: 'super-k', title: 'A new eye on neutrinos', text: 'Super-Kamiokande begins observations beneath a mountain in Japan.', url: 'https://www-sk.icrr.u-tokyo.ac.jp/en/about/history/' },
  { year: 1998, date: 'June 1998', experiment: 'super-k', title: 'Neutrinos change identity', text: 'Atmospheric neutrino observations provide evidence for neutrino oscillations.', url: 'https://www-sk.icrr.u-tokyo.ac.jp/en/about/history/' },
  { year: 2012, date: '4 July 2012', experiment: 'cms', title: 'A Higgs-like particle', text: 'CMS and ATLAS announce a new particle consistent with the long-sought Higgs boson.', url: 'https://home.cern/science/physics/higgs-boson' },
  { year: 2017, date: '21 July 2017', experiment: 'dune', title: 'Building a longer baseline', text: 'Groundbreaking at Sanford Lab marks a milestone for LBNF/DUNE construction.', url: 'https://www.dunescience.org/' },
  { year: 2025, date: '3 June 2025', experiment: 'muon-g2', title: 'A very precise wobble', text: 'Fermilab Muon g−2 announces its final measurement of the muon magnetic anomaly.', url: 'https://www.energy.gov/science/articles/muon-g-2-announces-most-precise-measurement-magnetic-anomaly-muon' },
];

export const MILESTONES = [...LANDMARK_EVENTS, ...RECENT_MILESTONES].sort((a, b) => a.year - b.year);
export function milestoneKey(milestone: typeof MILESTONES[number]) { return `${milestone.year}-${milestone.experiment}`; }

export interface Filters { query: string; topic: string; stage: string; mode?: MapView; }
const normalize = (value: string) => value.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/[−–]/g, '-').toLowerCase();
export function filterExperiments(filters: Filters): Experiment[] {
  const terms = normalize(filters.query).trim().split(/\s+/).filter(Boolean);
  const exact = (e: Experiment) => [e.name, ...e.aliases].some(name => normalize(name) === normalize(filters.query).trim());
  return EXPERIMENTS.filter(e => {
    const text = normalize([e.name, e.fullName, e.laboratory, e.place, e.country, TOPICS[e.topic].label, e.question, e.summary, e.method || '', RESEARCH[e.id].setting, ...e.aliases].join(' '));
    return (filters.topic === 'all' || e.topic === filters.topic) &&
      (filters.stage === 'all' || e.stage === filters.stage) &&
      (!filters.mode || filters.mode === 'all' || RESEARCH[e.id].views.includes(filters.mode)) && terms.every(term => text.includes(term));
  }).sort((a, b) => Number(exact(b)) - Number(exact(a)));
}

export interface SharedView extends Filters { particle?: string | null; experiment: string | null; story: string | null; stop: number; milestone: number | null; }
export function readSharedView(search: string): SharedView {
  const params = new URLSearchParams(search);
  const topic = params.get('topic') || 'all';
  const stage = params.get('stage') || 'all';
  const mode = params.get('mode') || 'all';
  const particle = PARTICLES.find(p => p.id === params.get('particle'));
  const story = particle ? undefined : STORIES.find(s => s.id === params.get('story'));
  const particleSites = particle?.history.flatMap(moment => moment.experiments) || [];
  const particleSite = particleSites.includes(params.get('experiment') || '') ? params.get('experiment') : particleSites[0] || null;
  const rawStop = Number(params.get('stop') || 0);
  const stop = story && Number.isInteger(rawStop) ? Math.max(0, Math.min(story.stops.length - 1, rawStop)) : 0;
  const rawMilestone = params.get('milestone');
  const eventKey = params.get('event');
  const eventIndex = eventKey ? MILESTONES.findIndex(event => milestoneKey(event) === eventKey) : -1;
  const legacy = rawMilestone !== null && /^\d+$/.test(rawMilestone) ? RECENT_MILESTONES[Number(rawMilestone)] : null;
  const milestone = eventIndex >= 0 ? eventIndex : legacy ? MILESTONES.findIndex(event => milestoneKey(event) === milestoneKey(legacy)) : null;
  return {
    query: story || particle ? '' : (params.get('q') || '').slice(0, 200),
    topic: story || particle ? 'all' : (topic in TOPICS && Object.hasOwn(TOPICS, topic) ? topic : 'all'),
    stage: story || particle ? 'all' : (STAGES.includes(stage as Stage) ? stage : 'all'),
    mode: story || particle ? 'all' : (Object.hasOwn(MAP_VIEWS, mode) ? mode as MapView : 'all'),
    particle: particle?.id || null,
    experiment: particle ? particleSite : story ? story.stops[stop].experiment : EXPERIMENTS.find(e => e.id === params.get('experiment'))?.id || null,
    story: story?.id || null, stop, milestone: story ? null : milestone,
  };
}

export function writeSharedView(view: SharedView): string {
  const params = new URLSearchParams();
  if (view.particle) params.set('particle', view.particle);
  if (view.query) params.set('q', view.query);
  if (view.topic !== 'all') params.set('topic', view.topic);
  if (view.stage !== 'all') params.set('stage', view.stage);
  if (view.mode && view.mode !== 'all') params.set('mode', view.mode);
  if (view.experiment) params.set('experiment', view.experiment);
  if (view.story) { params.set('story', view.story); params.set('stop', String(view.stop)); }
  if (view.milestone !== null && MILESTONES[view.milestone]) params.set('event', milestoneKey(MILESTONES[view.milestone]));
  return params.toString() ? `?${params}` : '';
}
