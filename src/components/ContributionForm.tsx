'use client';

import { useState } from 'react';
import { Copy, ExternalLink } from 'lucide-react';
import { contributionDraft, hasSupportingSource, type ContributionContext } from '@/lib/contributions.ts';

export default function ContributionForm({ context }: { context?: ContributionContext }) {
  const [name, setName] = useState(context?.name || '');
  const [description, setDescription] = useState('');
  const [sources, setSources] = useState('');
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);
  const draft = contributionDraft(context ? 'correction' : 'suggestion', name, description, sources, context);
  const ready = name.trim() && description.trim() && hasSupportingSource(sources);
  return <>
    <span className="eyebrow">HELP THE MAP GROW</span>
    <h2 id="contribution-title">{context ? 'Improve this record.' : 'Put an experiment on the map.'}</h2>
    <p>{context ? `Suggest a correction to ${context.name}. Tell us what should change and why.` : 'Missing an experiment? Share its name, location, scientific purpose, and historical impact.'} Include an official experiment page, laboratory source, or research paper.</p>
    <div className="contribution-fields">
      <label>Experiment name<input value={name} maxLength={140} onChange={event => { setName(event.target.value); setCopied(false); }} /></label>
      <label>{context ? 'Correction and reason' : 'Why it belongs'}<textarea rows={4} maxLength={2400} value={description} onChange={event => { setDescription(event.target.value); setCopied(false); }} /></label>
      <label>Supporting sources<textarea rows={2} maxLength={1200} placeholder="https://… (one source per line)" value={sources} onChange={event => { setSources(event.target.value); setCopied(false); }} /></label>
    </div>
    <p className="contribution-destination">The GitHub draft opens in <strong>Andre’s original HEP Map repository</strong>. Review it there before submitting; a GitHub account is required. You can also copy the draft to share with a maintainer.</p>
    <div className="contribution-actions">
      {ready ? <a className="primary-button" href={draft.url} target="_blank" rel="noreferrer">Review draft on GitHub <ExternalLink size={14} /></a> : <button className="primary-button" disabled>Review draft on GitHub <ExternalLink size={14} /></button>}
      <button className="text-button" disabled={!ready} onClick={async () => { try { await navigator.clipboard.writeText(`${draft.title}\n\n${draft.body}`); setCopied(true); setCopyError(false); } catch { setCopyError(true); } }}><Copy size={14} />{copied ? 'Draft copied' : 'Copy draft'}</button>
    </div>
    <p className="contribution-hint" role="status">{copyError ? 'Clipboard unavailable. Open the GitHub draft to copy its text.' : !ready ? 'Add a name, an explanation, and at least one HTTPS source to prepare your draft.' : 'Your draft is ready. Nothing has been submitted.'}</p>
  </>;
}
