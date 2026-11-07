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

## v1 release scope

HEPMAP v1 is a curated educational map: find an experiment, understand its purpose, and follow its sources and discovery history. The release baseline is 127 experiment/programme/phase records, 17 Standard Model particle types, five journeys (15 sourced stops), and 25 selected milestones. Global completeness is not a release claim.

Feature development is frozen for v1. Comparison views, quizzes, accounts, automatic AI publication, and a photograph for every record are outside scope. Existing fun facts and connections stay optional. Future catalogue corrections and source refreshes are maintenance.

The release is finished when the map and search are immediately usable on desktop and mobile; the baseline content and unresolved identity notes have been reviewed; navigation and shared links pass the checks below; the maintainer accepts the PR; and the resulting upstream commit is verified live in **afrankenthal’s projects**. A successful local build or GitHub CI run is a release candidate, not proof of deployment. Vercel authorization is the final external gate after implementation and review.

## Explore

Search and the experiment list are the default view. **Filters** expands research views (including underground), physics topics, and programme stages. **Discover** groups particle discoveries, guided journeys, Through time, and Surprise me; **Browse experiments** returns to the directory. Coverage contains the detailed source audits.

- Search names, aliases, laboratories, places, countries, and physics questions. Combine searches with topic and programme-stage filters.
- Choose an experiment from the list or map. Nearby experiments form numbered clusters; click a cluster to zoom in.
- Switch between all particle physics, accelerator research, and underground/rare-event views. Open Coverage to inspect known missing records and exclusions.
- Follow sourced research connections between experiments and optionally display their schematic map links.
- Explore the 17-cell Standard Model table and follow proposal/evidence/discovery histories to their experimental sites.
- Choose **Surprise me** for an experiment, a sourced fun fact, or a discovery milestone from the whole catalogue. It clears filters and skips the currently selected experiment. Shared links preserve the chosen record or milestone.
- Follow five guided journeys, including neutrino and quark discovery trails, with a dedicated source at every stop across all five journeys, or use **Through time**: a keyboard-accessible slider through 25 sourced milestones, with sites appearing cumulatively. The timeline shows selected events, not historical operating status. Milestones are selected events, not a complete historical reconstruction.
- Copy a link from an experiment panel to share its selection, filters, or journey stop. Back/forward navigation restores supported URL parameters.
- For DUNE, optionally show the planned source-to-detector connection. This is a schematic surface projection, not surveyed beam geometry.
- On a keyboard, press `/` or `Ctrl/Cmd+K` to search, and `Esc` to close the selection. The list provides an alternative to map interaction. Reduced-motion preferences are respected.

## Research scope and coverage

HEPMAP covers accelerator experiments, neutrino studies, dark-matter searches, rare processes, and particle astrophysics. Research views cover accelerator and non-accelerator experiments, underground/rare-event research, cosmic/natural sources, and precision/rare processes. These views overlap: DUNE and Super-Kamiokande are both accelerator and underground experiments. An underground collider cavern does not by itself classify an experiment as a low-background underground search.

**Global completeness has not been established.** The visible Coverage panel exposes dated source snapshots, known omissions, exclusions, and pending audits. SNOLAB’s linked roster has been reconciled entry by entry: twelve mapped and four excluded (biology, test infrastructure, or engineering seismology). The linked Gran Sasso research table and Fermilab neutrino roster are also reconciled; other source reviews remain explicitly partial. Roster-level reconciliation does not establish coverage of every historical detector phase or every experiment at a laboratory.

Run `npm run coverage:catalogue` for the same source dispositions as JSON. This report does not invent a global denominator or percentage. To expand coverage, review the INSPIRE reconciliation report and laboratory rosters, retain stable identities, record duplicate/phase relationships and exclusion reasons, and leave unresolved records visible. Source snapshots belong in version control. Only claim completeness against a named, dated inventory with an explicit scope.

Programmes and detector phases are labelled separately. PICO is currently a programme record; PandaX-4T is a particular phase. SNO and SNO+ remain distinct identities. Shared host-site coordinates are not artificially separated. Use the list to select co-located experiments.

Research connections identify shared laboratories, detector technologies, related questions, or discoveries. Their dashed map links are schematic relationships, not beamlines, physical routes, or claims of formal collaboration. Each relationship links its supporting sources. Optional fun facts also carry a source.

## Content and sources

The displayed catalogue lives in `src/lib/catalogue.ts` and `src/lib/additional-catalogue.ts`. It contains 127 mapped experiment/programme/phase records, primary-source links, occasional attributed fun facts, typed research connections, five journeys, 25 historical milestones, and all 17 Standard Model particle types with sourced discovery histories. The original raw INSPIRE snapshots and legacy importer remain in `src/app/` as reference material. The maintained INSPIRE pipeline is described below. Imported scientific summaries and coordinates never replace reviewed content automatically.

Programme stages describe maturity and do not indicate live beam or detector status. The catalogue’s editorial review date is 6 November 2026. The v1 finishing pass on 7 November 2026 added explicit sources to all journey stops and corrected the SLAC scattering, Compton, Gargamelle, and KamLAND citations. These targeted checks do not constitute a new independent human review of every catalogue claim. Coordinates are approximate detector/host-site locations, not surveyed boundaries. The original six coordinates come from the upstream catalogue; subsequent entries use approximate experimental or host-site positions. DUNE marks its far-detector site and LDMX its proposed host site. Future schedules are not inferred from elapsed dates.

When adding an experiment, give it a stable ID, coordinates, topic, programme stage, aliases, plain-language question and summary, method, explanatory fact, and primary sources. Verify all factual changes against those sources and update the review date. Do not overwrite reviewed text with raw imported descriptions. Extend the catalogue validation tests for new fields or relationships.

## INSPIRE import and identity review

INSPIRE supplies the catalogue backbone. Reviewed local descriptions, locations, discoveries, and methods remain a separate layer. The website uses checked-in data and does not call INSPIRE at runtime or during deployment.

```sh
npm run inspire:sync   # network: fetch the complete experiments endpoint
npm run inspire:report # offline: reconcile the snapshot against the local catalogue
```

The importer follows pagination until it reaches the API’s exact reported total. It retries transient transport/server failures and honors rate limits, including a minimum five-second pause after HTTP 429. Duplicate IDs, changed totals, truncated pagination, and malformed responses abort the import before replacing the previous snapshot. Review the Git diff before committing a refresh.

Files:

- `data/inspire/snapshot.json`: dated, field-selected source metadata with original record IDs and update timestamps. Descriptions, contact emails, and institution coordinates are not requested. This file is not bundled into the website.
- `data/inspire/links.json`: explicit local-to-INSPIRE identities with a reason. The initial six retain IDs from the original project’s catalogue. Later links carry an explicit AI-assisted source-comparison method, date, rationale, and evidence URLs. These labels do not imply independent human review.
- `data/inspire/review-notes.json`: typed unresolved decisions: programme/scope differences, conflicting metadata, or no identity selected after bounded name-field searches. Related records are not identity links; search terms and result counts remain visible.
- `data/inspire/reconciliation.json`: full offline report, including candidate matches, ambiguous identities, unresolved local entries, conflicting explicit links, source dates, and all source records not explicitly linked.
- `data/inspire/catalogue-links.json`: compact generated audit used by Coverage. Only explicit links appear as INSPIRE sources in experiment details.

A unique normalized name match is a **candidate**, never an approved identity. The matcher uses experiment names and full names, not research-keyword aliases or generic local slugs. It preserves `+` in identities such as SNO+ and avoids matching names shorter than three normalized characters. Manual review must distinguish programmes, detector phases, similarly named projects, and multiple historical sites. “No exact match” does not mean a record is absent from INSPIRE. “Unlinked source record” does not mean an in-scope experiment is missing from HEPMAP.

To approve a candidate, compare its INSPIRE record with primary sources. Add its ID, rationale, origin, review method, date, and evidence URLs to `links.json`, regenerate the report, and review the diff. For a scope mismatch, record a note and related records in `review-notes.json` instead of forcing an identity. The LEGEND programme/LEGEND-200 distinction remains an unresolved scope note. BESIII has a metadata-conflict note because the candidate’s 1991 start date disagrees with IHEP’s BEPCII/BESIII history. No source date is copied into the discovery chronology automatically. MiniBooNE modes, MINOS/MINOS+, and the CDF and DØ detector configurations have explicit aggregate mappings. For an aggregate mapping, set `scope: "aggregate"` and provide `records` with an INSPIRE ID, a label, and a relationship (`operating-mode`, `detector-run`, or `constituent-experiment`) for each constituent. At least two distinct records and source-comparison evidence are required. Each record retains its own dates; the website shows all labelled links rather than picking the first one. An aggregate does not assert that its constituents are interchangeable or that every historic subproject is represented.

Duplicate explicit assignments, including reuse of any aggregate member by another local entry, fail the report command and CI so that a shared programme record cannot silently collapse detector phases. Source dates remain raw in the snapshot; `9999` is treated as unknown for display, without inferring that a detector is currently operating. Year-only and month-only dates retain their precision.

A `no-match-in-snapshot` note must include the searched names and primary-source evidence. Its search results cover the selected name fields in this dated snapshot, not literature records, omitted metadata fields, or the live service. The report records hit counts and up to twenty examples per term. Generic hits (such as Compton or parity violation) are not identity matches. A written disposition for each local entry does not establish that every identity is resolved or that the global catalogue is complete.

GitHub Actions regenerates both report files offline and checks that they match the committed snapshot and links. A normal build never downloads a new inventory. The live snapshot is a paginated collection, not a transactional export; review source changes even when count checks pass.

AI enrichment is **not enabled**. A future enrichment layer should retain its evidence, generation provenance, and review state, and must not overwrite source metadata or reviewed scientific content.

API reference: [INSPIRE REST API](https://github.com/inspirehep/rest-api-doc). Most metadata is CC0, with exceptions described in [INSPIRE’s terms](https://help.inspirehep.net/knowledge-base/terms-of-use/); preserve source attribution and review licensing before adding other fields. API citation: Micha Moskovic, *The INSPIRE REST API* (2021), [doi:10.5281/zenodo.5788550](https://doi.org/10.5281/zenodo.5788550).

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
