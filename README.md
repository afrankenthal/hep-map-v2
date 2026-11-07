# HEPMAP

An interactive map of particle physics experiments, their methods, and their discoveries. The upstream repository is [afrankenthal/hep-map-v2](https://github.com/afrankenthal/hep-map-v2); the production site is [hep-map-v2.vercel.app](https://hep-map-v2.vercel.app). Built with Next.js, React, and MapLibre. No map API token or database is required.

## Run locally

Use Node.js 22 (22.14 or newer within that major version). `.nvmrc` selects Node 22; `package.json` selects the same major version for Vercel. The tests use Node’s built-in TypeScript support.

```sh
nvm use # if you use nvm
npm ci
npm run dev
```

Open http://localhost:3000. For a production preview, run `npm run build` followed by `npm run start`.

## Explore

- Search names, aliases, laboratories, places, countries, and physics questions. Combine searches with topic and programme-stage filters.
- Choose an experiment from the list or map. Nearby experiments form numbered clusters; click a cluster to zoom in.
- Switch between all particle physics, accelerator research, and underground/rare-event views. Open Coverage to inspect known missing records and exclusions.
- Follow sourced research connections between experiments and optionally display their schematic map links.
- Explore the 17-cell Standard Model table and follow proposal/evidence/discovery histories to their experimental sites.
- Follow five guided journeys, including dated neutrino and quark discovery trails with supporting evidence at each stop, or open the historical milestone timeline. Milestones are selected events, not a complete historical reconstruction.
- Copy a link from an experiment panel to share its selection, filters, or journey stop. Back/forward navigation restores supported URL parameters.
- For DUNE, optionally show the planned source-to-detector connection. This is a schematic surface projection, not surveyed beam geometry.
- On a keyboard, press `/` or `Ctrl/Cmd+K` to search, and `Esc` to close the selection. The list provides an alternative to map interaction. Reduced-motion preferences are respected.

## Research scope and coverage

HEPMAP covers accelerator experiments, neutrino studies, dark-matter searches, rare processes, and particle astrophysics. Research views cover accelerator and non-accelerator experiments, underground/rare-event research, cosmic/natural sources, and precision/rare processes. These views overlap: DUNE and Super-Kamiokande are both accelerator and underground experiments. An underground collider cavern does not by itself classify an experiment as a low-background underground search.

**Global completeness has not been established.** The visible Coverage panel exposes dated source snapshots, known omissions, exclusions, and pending audits. SNOLAB’s linked roster has been reconciled entry by entry: twelve mapped and four excluded (biology, test infrastructure, or engineering seismology). The linked Gran Sasso research table and Fermilab neutrino roster are also reconciled; other source reviews remain explicitly partial. Roster-level reconciliation does not establish coverage of every historical detector phase or every experiment at a laboratory.

Run `npm run coverage:catalogue` for the same source dispositions as JSON. This report does not invent a global denominator or percentage. To expand coverage, reconcile INSPIRE and laboratory rosters, retain stable identities, record duplicate/phase relationships and exclusion reasons, and leave unresolved records visible. Source snapshots belong in version control. Only claim completeness against a named, dated inventory with an explicit scope.

Programmes and detector phases are labelled separately. PICO is currently a programme record; PandaX-4T is a particular phase. SNO and SNO+ remain distinct identities. Shared host-site coordinates are not artificially separated. Use the list to select co-located experiments.

Research connections identify shared laboratories, detector technologies, related questions, or discoveries. Their dashed map links are schematic relationships, not beamlines, physical routes, or claims of formal collaboration. Each relationship links its supporting sources. Optional fun facts also carry a source.

## Content and sources

The displayed catalogue lives in `src/lib/catalogue.ts` and `src/lib/additional-catalogue.ts`. It contains 127 mapped experiment/programme/phase records, primary-source links, occasional attributed fun facts, typed research connections, five journeys, 25 historical milestones, and all 17 Standard Model particle types with sourced discovery histories. The original raw INSPIRE snapshots and importer remain in `src/app/` as reference material; they are not automatically published into the curated catalogue.

Programme stages describe maturity and do not indicate live beam or detector status. Dates and summaries were reviewed on 6 November 2026. Coordinates are approximate detector/host-site locations, not surveyed boundaries. The original six coordinates come from the upstream catalogue; subsequent entries use approximate experimental or host-site positions. DUNE marks its far-detector site and LDMX its proposed host site. Future schedules are not inferred from elapsed dates.

When adding an experiment, give it a stable ID, coordinates, topic, programme stage, aliases, plain-language question and summary, method, explanatory fact, and primary sources. Verify all factual changes against those sources and update the review date. Do not overwrite reviewed text with raw imported descriptions. Extend the catalogue validation tests for new fields or relationships.

## Basemap

The renderer uses OpenStreetMap’s public raster tiles with visible attribution and standard browser caching/referrers. Follow the [tile usage policy](https://operations.osmfoundation.org/policies/tiles/): do not add bulk downloads, offline prefetching, or automated map sweeps. The interface supports light and dark themes; the basemap retains the same cartography. Review tile hosting before a high-traffic launch: the public service has no availability guarantee.

## Checks and pull requests

```sh
npm test
npm run typecheck
npm run build
```

Before opening a PR, review the desktop and mobile layouts, search/filter combinations, clustered markers, experiment details, journey navigation, milestone selection, DUNE’s beam overlay, direct shared links, keyboard controls, and sources/credits dialog. Review dependency audit findings separately before publishing.

The `Validate HEPMAP` GitHub Actions workflow runs a clean `npm ci`, the tests, and the production build on pushes and pull requests. The build includes lint and TypeScript checks. A green build verifies the code; Vercel deployment authorization is a separate check.

## Production deployment: afrankenthal’s projects

Deploy the upstream repository into the existing **afrankenthal’s projects** Vercel team (`afrankenthals-projects`). Contributor forks are development copies; they do not replace or transfer the production project.

The intended production configuration is:

- Git repository: `afrankenthal/hep-map-v2`.
- Production branch: `main` (confirm this in the existing Vercel project’s Git settings).
- Root directory: repository root.
- Framework: Next.js.
- Node.js: `22.x`, selected by `package.json`.
- Install command: `npm ci`.
- Build command: `npm run build`.
- Output directory: Next.js default; leave any custom override unset.
- Environment variables: none required by the current map.

`vercel.json` declares the framework, install, and build commands. The public map worker assets are generated during `prebuild`; do not replace the build command with a command that skips that step. Do not commit `.vercel/` project links or team credentials.

### Fork pull requests and authorization

Vercel can require a team member to authorize a deployment from a fork. At the 6 November 2026 review, [PR #8](https://github.com/afrankenthal/hep-map-v2/pull/8) reported **“Authorization required to deploy.”** This was an authorization gate, not evidence of a failed build.

Andre or an authorized member of **afrankenthal’s projects** should open the current Vercel check’s Details link and approve the reviewed deployment. For a commit-author access error, follow [Vercel’s collaboration troubleshooting](https://vercel.com/docs/deployments/troubleshoot-project-collaboration) and check the author’s linked GitHub identity and legitimate project/team access. Keep the actual contributor identity on commits.

### Verify a release

1. Review the PR’s GitHub Actions result and authorize its Vercel preview when requested.
2. Wait for the preview to report **Ready**. Check the map, a particle history, mobile navigation, and source links there.
3. Have Andre or an authorized maintainer merge the reviewed changes into upstream `main` using their own account.
4. In the existing team project, confirm the production deployment uses the resulting merge commit and reports **Ready**. If no deployment starts, check the connected repository, production branch, authorization status, and any ignored-build settings.
5. Open [the production site](https://hep-map-v2.vercel.app), reload it, and verify the map tiles, markers, and discovery trails. Local build success alone does not verify this deployment.

A localhost URL is only reachable on the developer’s computer. Share the Vercel preview linked from the PR for remote review, subject to the team’s preview-access settings. See [Vercel Git deployments](https://vercel.com/docs/git) and [supported Node versions](https://vercel.com/docs/functions/runtimes/node-js/node-js-versions).

MapLibre’s matching module worker and shared module are copied from the locked dependency into `public/maplibre/` by `predev`/`prebuild`. These generated files are ignored by Git and served from the same origin.

Foundational historical experiments (including the nuclear atom and neutron) are included because of their impact on particle physics; this does not extend the catalogue to all nuclear-science experiments. Historical impact summaries live in `src/lib/history.ts`. Particle discovery records live in `src/lib/particles.ts`; proposals and evidence are distinguished, and several discoveries have multiple experimental sites. Timeline URLs use stable event keys while preserving the original five numeric milestone links.

## Contributions

Use **Suggest an experiment** in the explorer footer or About dialog, or **Suggest a correction** in an experiment’s details. Add an explanation and an HTTPS source to prepare an editable GitHub issue draft; correction drafts preserve the stable record ID and current references. The destination is the original project’s issue tracker (`afrankenthal/hep-map-v2`), where project contributions are reviewed. The dialog names the destination before opening it. No issue is submitted automatically. A copy-draft option also supports sharing directly with a maintainer. Change `CONTRIBUTION_REPOSITORY` in `src/lib/contributions.ts` if issue handling moves.
