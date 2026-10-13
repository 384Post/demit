# Colorful Characters · 384 Post

**All character artwork © demit omphroy. All rights reserved. Not for reuse.** The artwork, character names and descriptions in this repository are not open source and may not be copied or reused without permission.

A working concept for the 384 Post mural campaign with demit omphroy:

- **Quiz** → "Which Colorful Character are you?" with a shareable result image
- **Results** → the city's characters sized by popularity
- **Hunt** → a map of 13 giant characters around SF; walk within ~100 m to unlock each
- **AR** → see each found character ~20 ft tall through the phone camera (iPhone & Android, no app)
- **Secret** → a video from demit once all 13 are found
- **Test mode** → try everything from your desk

It's a plain static website — no build step, no server, no paid services.

---

## Put it online (GitHub Pages)

1. Create a new GitHub repo (e.g. `384post`) and upload everything in this folder, keeping the folder structure (including the hidden `.github` folder).
2. Repo → **Settings → Pages** → Source: *Deploy from a branch* → Branch: `main`, folder `/ (root)` → Save.
3. After a minute your site is at `https://YOUR-USERNAME.github.io/384post/`.
4. Put that URL in `data/config.js` → `siteUrl`, and point the window QR code at it.

**Location and AR only work on `https://`** (GitHub Pages is), not when opening the file from your computer.

## Try it without walking around SF

Open `…/384post/#/test` (or add `?test=1` to the URL). A yellow "TEST MODE" bar appears and the Hunt page gets **Teleport** buttons, **Unlock all**, and reset tools. Test progress is kept separate from real progress and is never sent to analytics. Visit `#/test` again to turn it off.

## Editing content — everything is in `data/config.js`

| To change… | Edit in `config.js` |
|---|---|
| Character text, pairings, colors | the `characters` list |
| Hunt locations | each character's `spot` (`name`, `lat`, `lng`, `why`, `bonus`) |
| How close people must get | `settings.unlockRadiusMeters` (default 100) |
| Quiz questions / answers | the `quiz` list |
| Secret video | `settings.secretVideoUrl` |
| Hashtag, artist name | `settings` |

**Getting coordinates:** in Google Maps, right-click the exact spot → click the numbers at the top to copy `lat, lng`. The current coordinates are approximate — check each one on site.

### How the quiz decides

Every answer points to a **main** character (3 points) and an **also** character (1 point). The winner is whoever earned the highest *percentage* of the points they could possibly have gotten, so characters that appear in fewer answers aren't disadvantaged. With the current mapping, each of the 13 characters has a roughly equal chance (7–8.5%) across every possible combination of answers. If you rewrite questions, keep each character as a `main` 2–3 times and as an `also` 2–4 times to stay balanced.

Questions 1–7 are from the Ceros sample; 8–9 are new drafts (shown with a "DRAFT" tag — delete `draft: true` to hide it).

## Character art

The page art uses demit's SVGs in `assets/characters/<id>.svg`, with matching PNGs (`<id>.png`) used to draw the share images. To update one, replace both files (PNG about 900 px tall, transparent background), then rebuild the share previews (see Social sharing). File ids: `sol`, `rebel`, `captain`, `sequoia`, `rascal`, `ocean`, `atlas`, `compass`, `flora`, `lorey`, `pixie`, `flow`, `ash`.

## 3D characters (Spline) and AR

Every character comes in **two sizes**, both built from the Spline models:
- **Life-size** (`assets/models/<id>.glb`): about human height, 5'10"–6'2" standing (Ash, seated, is about 4'9"; Flora is the tallest at about 6'9").
- **Giant** (`assets/models/giant/<id>.glb`): sized for its hunt spot, set by `giantFeet` in `data/config.js`: 15 ft in tight spots (Clarion Alley, Jack Kerouac Alley, the Transamerica sidewalk), 20 ft at medium ones (384 Post, Salesforce Park, the Exploratorium), 25 ft at open ones (Ferry Building, Pier 14, Hyde Street Pier, Coit Tower) and 30 ft at the wide-open ones (City Hall, the Golden Gate overlook, the Palace of Fine Arts). After changing a `giantFeet`, rebuild with `node tools/make_giants.mjs` (setup notes at the top of that file), or ask Claude.

The AR page has a **Life-size / Giant** switch. When someone finds a character on the hunt, the "found" pop-up opens it giant-size first; everywhere else it opens life-size.

**Who can see what in AR:** everyone can see **their own quiz character** in AR anytime, right from their result page. Other characters unlock once found on the hunt (or all of them in test mode).

**Updating a model:** export from Spline as GLB or GLTF (no background, ground plane or extra lights needed), then convert with the same settings as the others:

`node tools/convert_model.mjs rebel.glb assets/models/rebel.glb 0.373 0.001` (life-size), then rebuild the giants with `node tools/make_giants.mjs`

(setup notes are at the top of that file; or send the export to Claude and get the converted model back). The exact scales (including Flora's and Flow's adjustments) are at the top of that file.

## Social sharing

The result page has share buttons for **X, Facebook, Instagram, TikTok, Bluesky and LinkedIn**. The wording and hashtags live in `data/config.js` → `settings.share`.

| Platform | What happens |
|---|---|
| X, Bluesky | Opens a new post with the text, hashtags and link filled in |
| LinkedIn | Opens a new post with the text and link filled in |
| Facebook | Opens a share with the link + #384Post (Facebook doesn't allow pre-written text, so the caption is copied for pasting) |
| Instagram, TikTok | Neither allows sharing from a website, so on phones the share image goes to the phone's share menu (pick the app) and the caption is copied to paste. On a computer, the image downloads with the caption ready to copy. |

**The image in link previews** (X, Facebook, LinkedIn, Bluesky) comes from the files in `share/` and `assets/share/`. Social sites need the site's full web address in those files, so **after you set `siteUrl`** in `data/config.js` (and any time names or art change), run:

`python3 tools/make_share_pages.py`

(or send Claude the URL and get the updated files back). To check a preview before launch, paste a share link such as `https://YOUR-USERNAME.github.io/384post/share/sol.html` into a new X/LinkedIn post, or use Facebook's Sharing Debugger.

## Real results with Google Analytics (optional, free)

The site already sends these GA4 events (only when a measurement ID is set, never in test mode):
`quiz_complete` (with `character`), `share_result` (with `character` and `platform`), `character_found` (with `character`), `hunt_complete`, `ar_open`, `secret_video_view`.

**Step 1 — tracking**
1. In GA4, create a property + web data stream for the site URL; copy the **Measurement ID** (`G-…`) into `settings.gaMeasurementId`.
2. GA Admin → **Custom definitions** → create a custom dimension: name `Character`, scope **Event**, event parameter `character`.

**Step 2 — feed the live results page** (this is the part that may need IT's OK)
1. In Google Cloud, create a **service account** and download its JSON key. Enable the "Google Analytics Data API" for that project.
2. In GA Admin → Property access management, add the service account's email as **Viewer**.
3. In the GitHub repo → Settings → Secrets and variables → Actions, add secrets
   `GA_PROPERTY_ID` (the numeric property ID) and `GA_SA_KEY` (paste the whole JSON key).
   Optionally add a variable `GA_START_DATE` (launch day, `YYYY-MM-DD`).
4. Actions tab → "Update quiz results" → **Run workflow** to test. After that it runs hourly and updates `data/results.json`; the results page reads that file.

Until this is connected, the results page shows clearly-labeled **sample numbers**.

## Good to know

- **Progress is stored in the visitor's browser.** Switching phones or apps (e.g. Instagram's built-in browser → Safari) starts fresh, and iPhones can clear it after ~7 days without a visit. The **Save my progress** button makes a link people can text themselves to carry it over.
- **GPS downtown is rough** (often ±10–30 m, worse between tall buildings). That's why the unlock radius is generous.
- **AR**: iPhone uses Apple's built-in AR viewer (Quick Look), Android uses Google's Scene Viewer. Figures are placed in front of the person rather than pinned to exact coordinates, which keeps them steady.
- **The secret video isn't truly secret** — someone determined could find the link in the page. Host it as *unlisted*.
- **Map tiles** come from CARTO/OpenStreetMap's free service, which is fine for a concept. For a big public launch, consider a free-tier key from MapTiler or Stadia Maps for guaranteed capacity.
- Libraries (Leaflet for the map, Google's model-viewer for AR) are bundled in `vendor/`, so nothing depends on outside script CDNs.

## Open items for the team

- [ ] Confirm hunt locations with demit and the team (and coordinates on site)
- [ ] City Lights → currently using the public Jack Kerouac Alley next door
- [ ] Final quiz questions (demit is drafting)
- [ ] Character numbering: deck has two "Character 8"s (Thinker set to 7 here)
- [ ] Proofread character copy (e.g. "Septor" → set to "Scepter"; Sequoia's "turn things imaginations")
- [ ] demit's secret video (unlisted link)
- [ ] GA property + IT sign-off on the service account
- [ ] Set `siteUrl`, then rebuild share previews (`tools/make_share_pages.py`)
- [ ] Approve share text + hashtags (#384Post #ColorfulCharacters #UnionSquare)
- [ ] Social wall approach (curated vs. share-only)
