# Particle Map

A particle physics explorer based on [Andre Frankenthal’s HEP Map](https://github.com/afrankenthal/hep-map-v2). Built with Next.js, React, and MapLibre; no map API token or database is required.

## Run locally

Use Node.js 22.14 or newer (the tests use Node’s built-in TypeScript support).

```sh
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
- Follow three guided journeys, or open the historical milestone timeline. Milestones are selected events, not a complete historical reconstruction.
- Copy a link from an experiment panel to share its selection, filters, or journey stop. Back/forward navigation restores supported URL parameters.
- For DUNE, optionally show the planned source-to-detector connection. This is a schematic surface projection, not surveyed beam geometry.
- On a keyboard, press `/` or `Ctrl/Cmd+K` to search, and `Esc` to close the selection. The list provides an alternative to map interaction. Reduced-motion preferences are respected.

## Research scope and coverage

Particle Map covers accelerator experiments, neutrino studies, dark-matter searches, rare processes, and particle astrophysics. The research-view switch supports all particle physics, accelerator experiments, underground/rare-event research, cosmic/natural sources, and precision/rare processes. The last two overlap: DUNE and Super-Kamiokande belong to both. An underground collider cavern does not by itself classify an experiment as a low-background underground search.

**Global completeness has not been established.** The visible Coverage panel exposes dated source snapshots, known omissions, exclusions, and pending audits. SNOLAB’s linked roster has been reconciled entry by entry: twelve mapped and four excluded (biology, test infrastructure, or engineering seismology). The linked Gran Sasso research table and Fermilab neutrino roster are also reconciled; other source reviews remain explicitly partial. Roster-level reconciliation does not establish coverage of every historical detector phase or every experiment at a laboratory.

Run `npm run coverage:catalogue` for the same source dispositions as JSON. This report does not invent a global denominator or percentage. To expand coverage, reconcile INSPIRE and laboratory rosters, retain stable identities, record duplicate/phase relationships and exclusion reasons, and leave unresolved records visible. Source snapshots belong in version control. Only claim completeness against a named, dated inventory with an explicit scope.

Programmes and detector phases are labelled separately. PICO is currently a programme record; PandaX-4T is a particular phase. SNO and SNO+ remain distinct identities. Shared host-site coordinates are not artificially separated. Use the list to select co-located experiments.

Research connections identify shared laboratories, detector technologies, related questions, or discoveries. Their dashed map links are schematic relationships, not beamlines, physical routes, or claims of formal collaboration. Each relationship links its supporting sources. Optional fun facts also carry a source.

## Content and sources

The displayed catalogue lives in `src/lib/catalogue.ts` and `src/lib/additional-catalogue.ts`. It contains 127 mapped experiment/programme/phase records, primary-source links, occasional attributed fun facts, typed research connections, three journeys, 25 historical milestones, and all 17 Standard Model particle types with sourced discovery histories. The original raw INSPIRE snapshots and importer remain in `src/app/` as reference material; they are not automatically published into the curated catalogue.

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

Develop on a separate branch and open a PR into the maintainer’s intended deployment branch. Confirm the Vercel production branch before merging; merging may automatically deploy the site. Review a Vercel preview deployment when available. Local development does not update the published website.

## Show the design to a collaborator

A localhost URL is only reachable on your own computer. For an interactive review, import your GitHub fork into your own Vercel project and deploy the `codex/hep-map` branch. If the fork is already connected to Vercel, check the branch commit’s deployment/check links for a preview URL. Review the preview’s sharing/access settings before sending the link. The original maintainer’s production site is a separate deployment.

This branch needs no map API token or database credentials. Vercel’s Next.js framework preset, `npm run build`, and automatic output-directory detection are sufficient. See [Vercel Git deployments](https://vercel.com/docs/git). Use a pull request into the original repository when the maintainer is ready to review the implementation.

MapLibre’s matching module worker and shared module are copied from the locked dependency into `public/maplibre/` by `predev`/`prebuild`. These generated files are ignored by Git and served from the same origin.

Foundational historical experiments (including the nuclear atom and neutron) are included because of their impact on particle physics; this does not extend the catalogue to all nuclear-science experiments. Historical impact summaries live in `src/lib/history.ts`. Particle discovery records live in `src/lib/particles.ts`; proposals and evidence are distinguished, and several discoveries have multiple experimental sites. Timeline URLs use stable event keys while preserving the original five numeric milestone links.
