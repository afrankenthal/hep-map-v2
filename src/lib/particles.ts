export type ParticleFamily = 'quark' | 'lepton' | 'gauge' | 'higgs';
export interface DiscoveryMoment {
  date: string;
  kind: 'Proposal' | 'Evidence' | 'Discovery';
  title: string;
  explanation: string;
  experiments: string[];
  source: string;
}
export interface Particle {
  id: string; symbol: string; name: string; family: ParticleFamily;
  charge: string; row: number; column: number; role: string; history: DiscoveryMoment[];
}
export const PARTICLE_FAMILIES = { quark: 'Quarks', lepton: 'Leptons', gauge: 'Gauge bosons', higgs: 'Higgs boson' } as const;
export const STANDARD_MODEL_SOURCE = 'https://home.web.cern.ch/science/physics/standard-model/';
const model: DiscoveryMoment = { date: '1964', kind: 'Proposal', title: 'A model for hadrons', explanation: 'Gell-Mann and Zweig independently proposed up, down, and strange constituents to organise hadrons. This was a theoretical proposal, not the isolation of free quarks.', experiments: [], source: 'https://home.cern/who-invented-quarks/' };
const scattering: DiscoveryMoment = { date: '1968–69', kind: 'Evidence', title: 'Structure inside the proton', explanation: 'SLAC–MIT electron-scattering measurements revealed point-like constituents in nucleons. Together with other evidence, they helped establish the quark picture; they were not separate sightings of each light-quark flavour.', experiments: ['slac-dis'], source: 'https://cern-courier.web.cern.ch/a/back-to-the-future/' };
const heavy = 'https://www.fnal.gov/pub/science/historical-results/';
const electroweak = 'https://home.cern/science/physics/z-boson';
const history: Record<string, DiscoveryMoment[]> = {
  up: [model, scattering], down: [model, scattering],
  strange: [model, { date: '1960s onward', kind: 'Evidence', title: 'Making sense of strange hadrons', explanation: 'The strange quark explained patterns in kaons and hyperons. Hadron spectroscopy and scattering built the case for quarks. There is no single free-strange-quark discovery event.', experiments: ['slac-dis'], source: 'https://www.fnal.gov/pub/science/inquiring/matter/ww_discoveries/index.html' }],
  charm: [{ date: '1974', kind: 'Discovery', title: 'The November revolution', explanation: 'Teams at Brookhaven and SLAC independently observed the J/ψ, understood as charm–anticharm bound matter. The two experimental discoveries belong together in this history.', experiments: ['bnl-e598', 'mark-i'], source: heavy }],
  bottom: [{ date: '1977', kind: 'Discovery', title: 'A new resonance: the upsilon', explanation: 'Fermilab’s E288 fixed-target experiment observed the upsilon resonance, evidence for a bottom quark bound to an antibottom quark.', experiments: ['e288'], source: heavy }],
  top: [{ date: '1995', kind: 'Discovery', title: 'The last quark', explanation: 'CDF and DØ announced the top quark at Fermilab’s Tevatron on 2 March 1995, identifying collision patterns consistent with top production and decay.', experiments: ['cdf', 'd0'], source: heavy }],
  electron: [{ date: '1897', kind: 'Discovery', title: 'Cathode rays reveal a particle', explanation: 'J. J. Thomson studied the deflection of cathode rays and established that they contained negatively charged particles much lighter than atoms.', experiments: ['thomson-electron'], source: 'https://www.nobelprize.org/prizes/physics/1906/thomson/facts/' }],
  muon: [{ date: '1936–37', kind: 'Discovery', title: 'An unexpected cosmic-ray particle', explanation: 'Anderson and Neddermeyer found a penetrating charged particle in cosmic-ray studies. The observation and publication chronology spans 1936–37; it was later identified as a lepton.', experiments: ['muon-discovery'], source: 'https://muoncollider.web.cern.ch/history-muon-0' }],
  tau: [{ date: '1975', kind: 'Evidence', title: 'Unexplained electron–muon events', explanation: 'Perl and colleagues reported unusual electron–muon events at the SPEAR collider using the SLAC–LBL detector. These established evidence for a third charged lepton.', experiments: ['mark-i'], source: 'https://www.slac.stanford.edu/pubs/beamline/25/4/25-4-perl.pdf' }],
  'electron-neutrino': [{ date: '1956', kind: 'Discovery', title: 'Catching reactor antineutrinos', explanation: 'Cowan and Reines detected reactor electron antineutrinos at Savannah River using correlated interaction signals. The original observation was of the antineutrino member of this flavour.', experiments: ['reines-cowan'], source: 'https://www.fnal.gov/pub/science/particle-physics-101/worldwide-discoveries.html' }],
  'muon-neutrino': [{ date: '1962', kind: 'Discovery', title: 'A second neutrino flavour', explanation: 'At Brookhaven’s AGS, Lederman, Schwartz, Steinberger, and colleagues used a neutrino beam to establish a neutrino associated with muons, distinct from the electron neutrino.', experiments: ['bnl-two-neutrino'], source: 'https://www.bnl.gov/science/neutrinos.php' }],
  'tau-neutrino': [{ date: '2000', kind: 'Evidence', title: 'The DONUT tracks', explanation: 'DONUT at Fermilab announced the first direct evidence for tau-neutrino interactions, using nuclear emulsions to identify the short-lived tau produced in an interaction.', experiments: ['donut'], source: 'https://news.fnal.gov/2025/07/how-an-experiment-at-fermilab-fixed-a-hole-in-the-standard-model/' }],
  photon: [
    { date: '1905', kind: 'Proposal', title: 'Light in quanta', explanation: 'Einstein proposed light quanta in explaining the photoelectric effect. A proposal is different from a detector discovery.', experiments: [], source: 'https://www.nobelprize.org/prizes/physics/1921/einstein/facts/' },
    { date: '1923', kind: 'Evidence', title: 'X-rays exchange momentum', explanation: 'Compton’s X-ray scattering measurements supported the particle-like energy and momentum of light. Photon history developed through multiple experiments rather than one discovery event.', experiments: ['compton-scattering'], source: 'https://www.iucr.org/what-we-do/awards-and-prizes/nobel-prize/compton' },
  ],
  gluon: [{ date: '1979', kind: 'Evidence', title: 'A third jet at PETRA', explanation: 'Three-jet events at DESY’s PETRA collider revealed gluon radiation. TASSO presented an early event; JADE, MARK J, and PLUTO also contributed evidence.', experiments: ['tasso', 'jade', 'mark-j', 'pluto'], source: 'https://www.desy.de/news/news_search/index_eng.html?openDirectAnchor=1643&two_columns=0' }],
  w: [{ date: '1983', kind: 'Discovery', title: 'A carrier of the weak force', explanation: 'UA1 and UA2 at CERN’s proton–antiproton collider discovered the charged W boson through its decay products, including events with missing momentum.', experiments: ['ua1', 'ua2'], source: 'https://www.fnal.gov/pub/science/inquiring/matter/ww_discoveries/index.html' }],
  z: [{ date: '1983', kind: 'Discovery', title: 'The neutral weak boson', explanation: 'CERN’s UA1 and UA2 experiments observed the Z boson, the neutral partner of the W in electroweak theory.', experiments: ['ua1', 'ua2'], source: electroweak }],
  higgs: [{ date: '2012', kind: 'Discovery', title: 'Two detectors, one new boson', explanation: 'ATLAS and CMS announced a new particle consistent with the Higgs boson on 4 July 2012. Later measurements established its Higgs-like properties.', experiments: ['cms', 'atlas'], source: 'https://home.cern/science/physics/higgs-boson' }],
};

type ParticleSeed = [string, string, string, ParticleFamily, string, number, number, string];
const seeds: ParticleSeed[] = [
  ['up','u','Up','quark','+⅔',1,1,'A constituent of protons and neutrons.'],
  ['charm','c','Charm','quark','+⅔',1,2,'A heavier quark revealed through charmed particles.'],
  ['top','t','Top','quark','+⅔',1,3,'The heaviest known quark.'],
  ['down','d','Down','quark','−⅓',2,1,'A constituent of protons and neutrons.'],
  ['strange','s','Strange','quark','−⅓',2,2,'A quark found in kaons and other strange hadrons.'],
  ['bottom','b','Bottom','quark','−⅓',2,3,'A heavy quark found in bottom hadrons.'],
  ['electron-neutrino','νₑ','Electron neutrino','lepton','0',3,1,'The neutrino flavour associated with electrons.'],
  ['muon-neutrino','νμ','Muon neutrino','lepton','0',3,2,'The neutrino flavour associated with muons.'],
  ['tau-neutrino','ντ','Tau neutrino','lepton','0',3,3,'The neutrino flavour associated with taus.'],
  ['electron','e','Electron','lepton','−1',4,1,'The charged lepton familiar from atoms.'],
  ['muon','μ','Muon','lepton','−1',4,2,'A heavier charged relative of the electron.'],
  ['tau','τ','Tau','lepton','−1',4,3,'The third-generation charged lepton.'],
  ['gluon','g','Gluon','gauge','0',1,4,'A carrier of the strong interaction.'],
  ['photon','γ','Photon','gauge','0',2,4,'The quantum of the electromagnetic field.'],
  ['z','Z','Z boson','gauge','0',3,4,'A neutral carrier of the weak interaction.'],
  ['w','W','W boson','gauge','±1',4,4,'The charged carriers of the weak interaction.'],
  ['higgs','H','Higgs boson','higgs','0',1,5,'An excitation of the Higgs field associated with electroweak symmetry breaking.'],
];
export const PARTICLES: Particle[] = seeds.map(([id,symbol,name,family,charge,row,column,role]) => ({ id,symbol,name,family,charge,row,column,role,history:history[id] }));
