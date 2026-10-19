# Characters of San Francisco · 384 Post

**All character artwork © Demit Omphroy. All rights reserved. Not for reuse.** The artwork, character names and descriptions in this repository are not open source and may not be copied or reused without permission.

A working concept for the 384 Post mural campaign with Demit Omphroy:

- **Quiz** → "Which character are you?" with a shareable result image
- **Results** → the city's characters sized by popularity
- **Hunt** → a map of 13 giant characters around SF; walk within ~100 m to unlock each
- **Hidden in the Mural** → a second hunt tab: demit's objects hidden in the mural. People spot them at the building and tap them; found ones collect in a tray, with a flower celebration when all are found
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
| Footer contacts, artwork & CBRE notices, privacy links | `settings.contacts`, `artworkNotice`, `cbreNotice`, `privacyPolicyUrl` |
| Where the footer's "Explore 384 Post" goes | `settings.cerosUrl` |
| Where shared social links land | `settings.shareLandingUrl` (then run `python3 tools/make_share_pages.py`) |
| demit's Instagram / website links | `settings.artistInstagram`, `artistWebsite` |
| "Stay in touch" sign-up link (Microsoft Forms) | `settings.contactFormUrl` (empty = hidden) |
| Hidden-in-the-mural objects, names, sizes, order | the `muralObjects` list (art in `assets/objects/<id>.svg`) |

**Getting coordinates:** in Google Maps, right-click the exact spot → click the numbers at the top to copy `lat, lng`. The current coordinates are approximate — check each one on site.

### How the quiz decides

demit's questions each have four answers, one per element (Fire, Earth, Air, Water). The elements are never shown on the site.
1. The element someone picks most often wins (a tie goes to the element they picked most recently).
2. Each answer also leans toward two characters of its element: `main` (3 points) and `also` (1 point). Among the winning element's characters, the one with the most lean points from that element's answers wins.

So a result always matches the person's strongest element. Fog counts as both Water and Air, and Mangrove as both Earth and Water. With the current leans, every character comes up 7.2–8.6% of the time across all 1,048,576 possible sets of answers. If you change questions or leans, ask Claude to re-check the balance.

## Character art

The page art uses demit's SVGs in `assets/characters/<id>.svg`, with matching PNGs (`<id>.png`) used to draw the share images. To update one, replace both files (PNG about 900 px tall, transparent background), then rebuild the share previews (see Social sharing). File ids: `sol`, `rebel`, `captain`, `sequoia`, `rascal`, `ocean`, `atlas`, `compass`, `flora`, `lorey`, `pixie`, `flow`, `ash`.

## 3D characters (Spline) and AR

Every character comes in **two sizes**, both built from the Spline models:
- **Life-size** (`assets/models/<id>.glb`): about human height, 5'10"–6'2" standing (Ash, seated, is about 4'9"; Flora is the tallest at about 6'9").
- **Giant** (`assets/models/giant/<id>.glb`): sized for its hunt spot, set by `giantFeet` in `data/config.js`: 15 ft in tight spots (Haight & Ashbury, Cole Valley), 20 ft at medium ones (the Painted Ladies, UCSF, the Peace Pagoda), 25 ft at open ones (Fisherman's Wharf, Union Square, the Legion of Honor, the Zoo) and 30 ft at the wide-open ones (City Hall, the Golden Gate Bridge, Dolores Park, the Bay Bridge). After changing a `giantFeet`, rebuild with `node tools/make_giants.mjs` (setup notes at the top of that file), or ask Claude.

The AR page has a **Life-size / Giant** switch. When someone finds a character on the hunt, the "found" pop-up opens it giant-size first; everywhere else it opens life-size.

**Who can see what in AR:** everyone can see **their own quiz character** in AR anytime, right from their result page. Other characters unlock once found on the hunt (or all of them in test mode).

**Updating a model:** export from Spline as GLB or GLTF (no background, ground plane or extra lights needed), then convert with the same settings as the others:

`node tools/convert_model.mjs rebel.glb assets/models/rebel.glb 0.373 0.001` (life-size), then rebuild the giants with `node tools/make_giants.mjs`

(setup notes are at the top of that file; or send the export to Claude and get the converted model back). The exact scales (including Flora's and Flow's adjustments) are at the top of that file.

### The finale: everyone together in AR

People who find all 13 characters get the group scene (`assets/models/group/`): `everyone.glb` (life-size, ~17 ft tall and ~33 ft wide) and `everyone-tabletop.glb` (~2 ft tall). iPhones use the matching `.usdz` files, which are made ahead of time because converting a scene this big on the phone is too slow. If the Spline scene changes, send the new export to Claude to rebuild all four files.

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
`quiz_complete` (with `character`), `share_result` (with `character` and `platform`), `character_found` (with `character`), `hunt_complete`, `ar_open`, `secret_video_view`, `mural_object_found` (with `object`), `mural_complete`. A custom dimension `Object` (parameter `object`) is set up in GA, so you can see which objects people find most.

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

- **Progress is stored in the visitor's browser.** Switching phones or apps (e.g. Instagram's built-in browser → Safari) starts fresh, and iPhones can clear it after ~7 days without a visit. The **Save my progress** button (on both hunt tabs) makes one link that carries the quiz result, giant-hunt finds and mural finds. Don't rename object ids once live: save links use them.
- **GPS downtown is rough** (often ±10–30 m, worse between tall buildings). That's why the unlock radius is generous.
- **AR**: iPhone uses Apple's built-in AR viewer (Quick Look), Android uses Google's Scene Viewer. Figures are placed in front of the person rather than pinned to exact coordinates, which keeps them steady.
- **The secret video isn't truly secret** — someone determined could find the link in the page. Host it as *unlisted*.
- **Map:** with `mapboxToken` set in `data/config.js`, the hunt map uses Mapbox (free up to 50,000 map loads a month). Each visitor counts as one map load per visit, even if they leave the Hunt page and come back. With the token left empty, the map falls back to basic OpenStreetMap tiles, which are fine for an emergency or testing but aren't meant for heavy public traffic. Mapbox has no hard spending cap: watch the usage page in your Mapbox account (it also emails you if you go over the free tier), and if you ever need to stop usage instantly, empty `mapboxToken` and push (or delete the token in Mapbox).
- **Mapbox token setup:** create a new public token (not the "Default public token", which can't be restricted) with only the default public scopes, and add the URL restriction `https://384post.github.io` (no path; browsers only send the site's origin with map requests). The token is visible in the code, which is normal for public tokens; the URL restriction is what stops others using it.
- Libraries (Leaflet for the map, Google's model-viewer for AR) are bundled in `vendor/`, so nothing depends on outside script CDNs.

## Open items for the team

- [ ] demit is picking exact hunt spots (he offered); then confirm coordinates on site
- [ ] GA property + IT sign-off on the service account
- [ ] Approve share text + hashtags (#384Post #demitomphroy #UnionSquare, plus @demit on Instagram)
- [ ] CBRE legal/marketing review of the Terms & privacy page (`#/terms`) and footer notices
- [ ] Social wall approach (curated vs. share-only)
- [ ] Confirm the new hunt spot coordinates on site (they're approximate)
- [x] Mangrove shares Window 9 and its 3 objects with Fleur (confirmed by demit)
- [x] Reward for all mural objects: demit's flower + downloadable icon pack (`assets/downloads/`, `settings.iconPackUrl`)
- [ ] Reward for all 13 characters: video vs. "You are #N" + a gift from demit (decide)
- [ ] Group AR scene is too wide: demit may adjust after launch
- [ ] Microsoft Forms link for "Stay in touch" + legal review of the form wording
