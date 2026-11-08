import audit from '../../data/inspire/catalogue-links.json';

export const INSPIRE_AUDIT = audit;
export function inspireLinks(localId: string) {
  const entry = audit.entries.find(entry => entry.localId === localId);
  return entry?.status === 'linked' ? entry.candidates : [];
}
