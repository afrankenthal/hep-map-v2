export const CONTRIBUTION_REPOSITORY = 'afrankenthal/hep-map-v2';

export interface ContributionContext {
  id: string;
  name: string;
  sources: { label: string; url: string }[];
}

export function contributionDraft(kind: 'suggestion' | 'correction', name: string, description: string, sources: string, context?: ContributionContext) {
  const title = `${kind === 'correction' ? 'Correction' : 'Experiment suggestion'}: ${name.trim() || context?.name || 'New experiment'}`;
  const body = [
    '## Particle Map contribution',
    ...(context ? [`Record: ${context.name} (\`${context.id}\`)`, '', 'Current references:', ...context.sources.map(source => `- ${source.url}`)] : []),
    '', `## ${kind === 'correction' ? 'Suggested correction and reason' : 'Experiment and why it belongs'}`,
    description.trim(), '', '## Supporting sources', sources.trim(),
    '', 'Please verify the evidence before updating the catalogue.',
  ].join('\n');
  const params = new URLSearchParams({ title, body });
  return { title, body, url: `https://github.com/${CONTRIBUTION_REPOSITORY}/issues/new?${params}` };
}

export function hasSupportingSource(value: string) {
  return value.trim().split(/\s+/).some(token => {
    try { return new URL(token).protocol === 'https:'; } catch { return false; }
  });
}
