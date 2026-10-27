/* =====================================================================
   384 POST · CHARACTERS OF SAN FRANCISCO — EVERYTHING EDITABLE LIVES HERE
   ---------------------------------------------------------------------
   Change text, pairings, hunt spots, quiz questions or settings in
   this one file. Save, push to GitHub, done. No other file needs to
   change for content updates.
   ===================================================================== */

window.CONFIG = {

  /* ---------- General settings ---------- */
  settings: {
    title: "Characters of San Francisco",
    artist: "Demit Omphroy",                 // confirmed by demit (Oct 18)
    hashtag: "#384Post",

    // ---- Social sharing (result page) ----
    // In the text, {name} {archetype} {element} {trait} {artist} are filled in automatically.
    share: {
      hashtags: ["384Post", "demitomphroy", "UnionSquare"],   // no "#", no spaces
      // Instagram handles to @-tag in the Instagram caption (other platforms use the hashtags only)
      instagramTags: ["demit"],
      // Facebook (copied for pasting), LinkedIn, Instagram & TikTok captions:
      text: "I'm {name}, {archetype}! ✨ {artist}'s new mural at 384 Post in Union Square brings 13 Characters of San Francisco to life. Take the quiz to find yours, then hunt for the giants around the city.",
      // X and Bluesky (short posts):
      shortText: "I'm {name}, {archetype}! ✨ Which of {artist}'s Characters of San Francisco are you? Find yours at 384 Post in Union Square.",
      imageHashtag: "#384Post"   // printed on the share image
    },
    siteUrl: "https://384post.github.io/demit/",
    // The 384 Post leasing page (Ceros). The footer's "Explore 384 Post" button goes here.
    cerosUrl: "https://cbre-strike-team.ceros.site/384-post-demit/page-1",
    // Where links shared on social land (share/<id>.html forwards here, and it's in the
    // Instagram/TikTok caption). Leave empty to use cerosUrl.
    shareLandingUrl: "https://cbre-strike-team.ceros.site/384-post-demit",

    // ---- Footer ----
    contacts: [
      { name: "Alex Sagues", license: "Lic. 02055525", phone: "+1 415 772 0306", email: "Alex.Sagues@cbre.com" },
      { name: "Madeline Redmond", license: "Lic. 02186119", phone: "+1 703 732 8553", email: "Madeline.Redmond@cbre.com" }
    ],
    artworkNotice: "All Characters of San Francisco artwork, characters, names and descriptions © 2026 Demit Omphroy. All rights reserved. Used with permission; may not be copied or reused without the artist's written consent.",
    cbreNotice: "© 2026 CBRE, Inc. This information has been obtained from sources believed reliable. We have not verified it and make no guarantee, warranty or representation about it. Any projections, opinions, assumptions or estimates used are for example only and do not represent the current or future performance of the property. You and your advisors should conduct a careful, independent investigation of the property to determine to your satisfaction the suitability of the property for your needs.",
    // "Contact us" link at the bottom of the Terms & privacy page
    termsContactEmail: "bianca.koutsakos@cbre.com",
    privacyPolicyUrl: "https://www.cbre.com/about-us/global-web-privacy-and-cookie-policy",
    californiaPrivacyUrl: "https://www.cbre.com/about-us/california-consumer-privacy-policy",   // ← your GitHub Pages URL (used in share text)

    unlockRadiusMeters: 200,     // how close someone must be to "find" a character

    // Secret reward once all 13 are found. Use an UNLISTED YouTube/Vimeo
    // EMBED link, e.g. "https://www.youtube.com/embed/VIDEO_ID".
    // Leave empty to show the placeholder card.
    secretVideoUrl: "",
    // Shown on the reward page (all characters found). Stays even after a video is added.
    artistNote: {
          "title": "The Characters of San Francisco",
          "paragraphs": [
                "Step into the mind of Bay Area-born artist Demit Omphroy with his latest series: The Characters of San Francisco.",
                "Every person carries a distinct narrative of how they arrived in San Francisco—each path uniquely different, bound by similar rhythms of life. These trajectories intersect across the City's iconic hills, cultural landmarks, and storied neighborhoods.",
                "With The Characters of San Francisco, explore the human experience through a magical and colorful universe. Placed across the different parts of SF, these abstracted giants serve as elemental embodiments of the character traits, energies, and forces that shape us.",
                "From the Fiery personalities who ignite San Francisco's energy, to the Earthly grounded builders, the Airy whimsical dreamers, and Water-like fluid thinkers. Together, these figures celebrate our individual powers, our collective struggles, and the vibrant pairings that unify our existence.",
                "We become these Characters of San Francisco—the diverse souls and intersecting journeys that add to the undeniable beauty of San Francisco."
          ],
          "thanks": "Thank you for taking the time to explore, play, and discover San Francisco with this art series."
    },

    // Google Analytics 4 measurement ID, e.g. "G-ABC123XYZ". Leave empty
    // while testing so test clicks don't pollute the real numbers.
    gaMeasurementId: "G-T55WBWZXNS",

    // Mapbox map (optional). Paste a URL-restricted PUBLIC token (starts with "pk.").
    // Leave empty to fall back to basic OpenStreetMap tiles (emergency/testing only).
    // Hunt map: a free grey map (OpenFreeMap "Positron"): no account, key, card or usage limits.
    mapProvider: "openfreemap",
    mapStyleUrl: "https://tiles.openfreemap.org/styles/positron",
    // Mapbox is switched off. To use it again, set mapProvider: "mapbox" and paste a token here.
    mapboxToken: "",
    mapboxStyle: "mapbox://styles/mapbox/light-v11",

    // ---- demit's links (footer + Characters page) ----
    artistInstagram: "https://www.instagram.com/demit/",
    artistWebsite: "https://www.demitomphroy.com/",
    artistEmail: "team@demitomphroy.com",
    // Reward for spotting all hidden objects (demit approved). Leave "" to hide the button.
    iconPackUrl: "assets/downloads/demit-omphroy-icon-pack.zip",
    // ---- "Stay in touch" sign-up (Microsoft Forms) ----
    // Paste the form's share link here. Leave empty to hide the "Stay in touch" links.
    contactFormUrl: "https://forms.cloud.microsoft/Pages/ResponsePage.aspx?id=0OlZAaAJ306WuqPe6jY8KLkod2voSL9OnNT039ADIHZUQ1I1NUpMSENWVVRPTjQ2NzFJSVNWWlNWVS4u",

    // ---- Gift Tickets: reward for finding all 13 characters ----
    // Finishers get a claim code and a button to this form. Leave "" to hide the whole Gift Ticket card.
    giftClaimUrl: "https://forms.cloud.microsoft/Pages/ResponsePage.aspx?id=0OlZAaAJ306WuqPe6jY8KLkod2voSL9OnNT039ADIHZUQldaVDVBUVpFUUZaTEZBQjExUFBBQlU0RC4u",
    // The form's "Claim code" question id, from Microsoft Forms' pre-filled link. The site fills each
    // person's code in for them. Leave "" if the form changes; people can still paste the code.
    giftClaimCodeField: "r6458d1028c1b48269cc21e208d4987fe",
    giftTotal: 100,
    // The "Gift Tickets left" counter updates itself hourly from Google Analytics (finishers so far).
    // To set it by hand instead, put a number here, e.g. giftsLeft: 42. Put 0 when all are claimed.
    giftsLeft: null,
    // Where the results page reads popularity counts from. The GitHub Action in
    // .github/workflows refreshes data/results.json from Google Analytics hourly.
    // The first address reads it straight from the repo (updates within minutes);
    // the second is the copy published with the site, used as a backup.
    // A starting "seed" of 100 picks added to the counts shown on the Results page, so it
    // isn't empty at launch. It's display-only: Google Analytics numbers are never seeded.
    // Set all to 0 (or delete this) to show real numbers only.
    resultsSeed: { sol: 14, rebel: 10, captain: 7, sequoia: 6, rascal: 12, ocean: 8, atlas: 4,
                   compass: 3, flora: 7, lorey: 10, pixie: 6, flow: 9, ash: 4 },

    resultsDataUrls: [
      "https://raw.githubusercontent.com/384post/demit/main/data/results.json",
      "data/results.json"
    ],

    // Scoring: an answer gives 3 points to its main character and
    // 1 point to its secondary character.
    primaryPoints: 3,
    secondaryPoints: 1
  },

  /* ---------- Hidden in the Mural ----------
     demit's objects hidden in the mural at 384 Post. People spot them at the building
     and tap them here. Art: assets/objects/<id>.svg (keep the id = the file name).
     name – shown to screen readers and on the "found" pop-up
     size – icon size in pixels on a computer (phones scale it down); roughly
            matches how big each one is in the mural
     The order here is the order of the cloud on the page. */
  muralObjects: [
    { id: "butterfly", name: "Butterfly", size: 81 },
    { id: "crown", name: "Crown", size: 68 },
    { id: "fork", name: "Fork", size: 74 },
    { id: "pencil", name: "Pencil", size: 59 },
    { id: "notebook_1", name: "Diary", size: 82 },
    { id: "puzzle", name: "Puzzle Piece", size: 68 },
    { id: "flame", name: "Fire", size: 69 },
    { id: "architectTool", name: "Drawing Compass", size: 79 },
    { id: "caterpillar", name: "Caterpillar", size: 102 },
    { id: "sword", name: "Scepter", size: 93 },
    { id: "binoculars", name: "Binoculars", size: 105 },
    { id: "calculator", name: "Calculator", size: 82 },
    { id: "throne", name: "Throne", size: 129 },
    { id: "wateringCan", name: "Watering Can", size: 118 },
    { id: "genieLamp", name: "Genie Lamp", size: 86 },
    { id: "globe", name: "Globe", size: 92 },
    { id: "musicNote", name: "Music Note", size: 64 },
    { id: "sneaker", name: "Shoe", size: 77 },
    { id: "saw", name: "Saw", size: 70 },
    { id: "bunny", name: "Bunny", size: 91 },
    { id: "snail", name: "Snail", size: 75 },
    { id: "compass", name: "Directional Compass", size: 78 },
    { id: "lighteningBolt", name: "Lightning Bolt", size: 80 },
    { id: "rainbow", name: "Rainbow", size: 91 }
  ],

  /* ---------- The 13 characters ----------
     id         – short code used everywhere (keep it even when a name changes: saved
                  results, analytics and art files all use it)
     name / archetype – what people see (e.g. "Sunny", "The Spark")
     elements   – used by the quiz; "element" is the label shown on the page
     mural      – where the character is on the mural (shown on their page)
     objects    – their hidden objects in the mural (ids from muralObjects)
     challenge  – the AR challenge shown when they're unlocked
     spot       – hunt location. lat/lng are APPROXIMATE — confirm on site.
                  giantFeet = how tall the giant AR version is there. Changing it needs the
                  giant models rebuilt: node tools/make_giants.mjs (see README). */
  characters: [
    {
      id: "sol", number: 1, name: "Sunny", archetype: "The Spark",
      element: "Fire", elements: ["Fire"], trait: "Optimism", color: "Marigold Yellow", colorHex: "#F0B429", object: "Bolt of Electricity",
      mural: "Window 1, Powell St", objects: ["flame", "musicNote", "lighteningBolt"],
      description: "Sunny the Spark is a ray of light for others.\nThe moment they arrive, the energy shifts. They ignite conversation and can get a room to start dancing in a matter of minutes. They are the personality who gathers all the other Characters of San Francisco together when a new idea or adventure pops up.",
      powers: "Confidence, Spontaneity, Enthusiasm",
      struggles: "Impulsive, Fast Energy Burner",
      recharge: ["Listening to music", "Dancing", "A nice cup of coffee"],
      challenge: "Show off your best dance move with Sunny!",
      pairings: ["ash", "ocean"],
      spot: { name: "Fisherman's Wharf · Pier 39", lat: 37.809734, lng: -122.409246, bonus: false, giantFeet: 25 }
    },
    {
      id: "rebel", number: 2, name: "Rebel", archetype: "The Explorer",
      element: "Fire", elements: ["Fire"], trait: "Independence", color: "Burgundy", colorHex: "#8C2B3A", object: "Binoculars",
      mural: "Window 2, Powell St", objects: ["sneaker", "fork", "binoculars"],
      description: "Rebel is bold and unconventional. They break the mold and forge their own path, unafraid of risk and completely unapologetic. Their drive is unbreakable once they set their mind to something.\nRebel takes the leap that no one else dared to attempt and isn't spending energy explaining that decision.",
      powers: "Honest, Fearless",
      struggles: "Impatience, Impulsive",
      recharge: ["A long walk outside", "Some sightseeing", "A home-cooked meal"],
      challenge: "Do that thing you have been wanting to do for a while, and snap a photo with Rebel!",
      pairings: ["compass", "rascal"],
      spot: { name: "Painted Ladies · Alamo Square", lat: 37.7762, lng: -122.433, bonus: false, giantFeet: 20 }
    },
    {
      id: "captain", number: 3, name: "Monarch", archetype: "The Leader",
      element: "Fire", elements: ["Fire"], trait: "Leadership", color: "Crimson Red", colorHex: "#C8323C", object: "Scepter",
      mural: "Window 3, Powell St", objects: ["throne", "sword", "crown"],
      description: "Monarch is a natural leader with drive, ambition, and a fierce competitive side. They will lead their team to success, even if it means stepping through failure to get there. They have no time for sorrows, and no time to dwell on the negative. The Leader is a great listener and role model for those who are seeking out guidance.",
      powers: "Honest, Loyal, Trustworthy",
      struggles: "Misunderstood, Tendency to Withhold Feelings",
      recharge: ["Take yourself on a date", "Explore somewhere you have never been", "Share a lesson you have learned"],
      challenge: "Sit in a throne-like chair and pose next to Monarch the Leader!",
      pairings: ["sol", "flora"],
      spot: { name: "Union Square", lat: 37.78795, lng: -122.4075, bonus: false, giantFeet: 25 }
    },
    {
      id: "sequoia", number: 4, name: "Timber", archetype: "The Builder",
      element: "Earth", elements: ["Earth"], trait: "Resourceful", color: "Olive Green", colorHex: "#7A8B3A", object: "Hammer",
      mural: "Window 4, Powell St", objects: ["pencil", "saw", "snail"],
      description: "Timber is sharp-minded, practical and works with their hands to turn imaginations into physical creations.\nThe Builder possesses a rare, resourceful magic that finds total happiness in the present moment. They are a down-to-earth person, who is deeply understanding, but still has a solid foundation of grit.\nA Builder talks less, rolls up their sleeves, and gets it done.",
      powers: "Curiosity, Strength, Heart",
      struggles: "Stubborn, Anti-Social",
      recharge: ["Slow your day down", "Go to a museum", "Browse vintage items"],
      challenge: "Build anything and take a photo next to it with you and Timber!",
      pairings: ["captain", "sol"],
      spot: { name: "Haight & Ashbury", lat: 37.770272, lng: -122.446823, bonus: false, giantFeet: 15 }
    },
    {
      id: "rascal", number: 5, name: "Rascal", archetype: "The Dreamer",
      element: "Air", elements: ["Air"], trait: "Imagination", color: "Sky Blue", colorHex: "#6FA8DC", object: "Baton",
      mural: "Window 5, left corner, Powell St", objects: [],
      description: "The Dreamer is imaginative and whimsical, usually with their head in the clouds, living in their own world of wonder. Beautifully weird and eccentric, with the Dreamer… anything goes.\nYou ask them how they are doing, they respond with the color they are feeling.\nWith their conductor's baton in hand, they orchestrate vibrant worlds out of thin air.",
      powers: "Endless Wonder, Child-like Spirit",
      struggles: "Unpredictability, Discipline",
      recharge: ["Do a puzzle", "Work on some writing", "Exercise"],
      challenge: "Jump in the air and capture a photo of you flying with Rascal!",
      pairings: ["sequoia", "compass"],
      spot: { name: "Golden Gate Bridge · Torpedo Wharf", lat: 37.809275, lng: -122.469793, bonus: true, giantFeet: 30 }
    },
    {
      id: "ocean", number: 6, name: "Valor", archetype: "The Guardian",
      element: "Water", elements: ["Water"], trait: "Empathy", color: "Cerulean", colorHex: "#2A7AB0", object: "Shield",
      mural: "Window 6, corner of Powell St and Post St", objects: [],
      description: "Valor the Guardian is an intuitive protector. They don't always have much to say in social settings, but will be safely by your side. Secure in their own right, but also strong for both of you.\nTheir presence provides an immediate sense of calm and security.\nTo the wailing child, they provide a soothing shelter. To the chaotic life, they ease the overworking mind.\nBeyond their protective shell, they radiate sensitive depth and quiet understanding.",
      powers: "Protection, Strength",
      struggles: "Emotional Fatigue",
      recharge: ["Self-care day", "Yoga", "Calming cup of tea"],
      challenge: "Take a photo with your shields next to Valor!",
      pairings: ["rascal", "sol"],
      spot: { name: "Palace of Fine Arts", lat: 37.80294, lng: -122.44844, bonus: false, giantFeet: 25 }
    },
    {
      id: "atlas", number: 7, name: "Atlas", archetype: "The Thinker",
      element: "Air", elements: ["Air"], trait: "Knowledge", color: "Cobalt Blue", colorHex: "#2F4FA3", object: "Notebook",
      mural: "Window 7, right corner, Post St", objects: [],
      description: "Atlas is curious, analytical, a quiet observer and a total solver of puzzles.\nThey are philosophers, so naturally they may ask a lot of questions.\nUltimately, they are knowledge-hungry learners who understand the true power of listening before speaking.\nThey take in the world through watchful eyes, constantly asking the right questions and collecting pieces to the larger puzzle.",
      powers: "Listening, Solving",
      struggles: "Paralysis by Analysis",
      recharge: ["Spontaneity", "Singing in the shower", "Watch something that makes you laugh"],
      challenge: "Do your best thinking pose and think with Atlas!",
      pairings: ["rascal", "sol"],
      spot: { name: "Legion of Honor", lat: 37.785189, lng: -122.499879, bonus: true, giantFeet: 20 }
    },
    {
      id: "compass", number: 8, name: "Abacus", archetype: "The Architect",
      element: "Earth", elements: ["Earth"], trait: "Precision", color: "Emerald", colorHex: "#1F8A5B", object: "Ruler",
      mural: "Window 8, Post St", objects: ["compass", "architectTool", "calculator"],
      description: "Clarity. Precise, organized, loves systems and symmetry. Understands numbers, patterns, and structural symmetry where nature and science meet. The ultimate Type A character: organized, concise, and masterfully efficient.\nPicture a spider weaving a mathematically flawless web at dawn, or a Queen Bee engineering an intricate, perfectly geometric hive. Precision sees the invisible grid underlying the entire world. They don't just exist in space; they balance it.",
      powers: "Analytical, Finding Clarity",
      struggles: "Perfectionism",
      recharge: ["Sculpt with clay", "Color outside the lines", "Swim in the ocean"],
      challenge: "Grab something mathematical and take a photo with Abacus!",
      pairings: ["sequoia", "sol"],
      spot: { name: "San Francisco City Hall", lat: 37.7793, lng: -122.4193, bonus: false, giantFeet: 30 }
    },
    {
      id: "flora", number: 9, name: "Fleur", archetype: "The Gardener",
      element: "Earth", elements: ["Earth"], trait: "Nurture", color: "Terracotta", colorHex: "#C4663F", object: "Basket",
      mural: "Window 9, Post St · shared with Mangrove", objects: ["bunny", "caterpillar", "wateringCan"],
      description: "Fleur the Gardener is a natural nurturer. A secure, grounded, patient figure. They have a green thumb, understand the rhythms of the seasons, and carry an effortless, deep-rooted wisdom about how life unfolds.\nThey possess the rare ability to listen to others' deepest problems with true empathy without letting that heavy energy cloud their own peace. Because they know exactly who they are, they listen without judgment or influence.",
      powers: "Empathy, Kindness, Understanding",
      struggles: "Detachment, Over-patience",
      recharge: ["Finish a to-do list", "Meditation", "Dance in the rain"],
      challenge: "Grab a flower and take a photo together with Fleur the Gardener!",
      pairings: ["captain", "compass"],
      spot: { name: "San Francisco Zoo · entrance", lat: 37.735365, lng: -122.505409, bonus: true, giantFeet: 25 }
    },
    {
      id: "lorey", number: 10, name: "Poet", archetype: "The Storyteller",
      element: "Air", elements: ["Air"], trait: "Expression", color: "Turquoise", colorHex: "#2BB3B1", object: "Book",
      mural: "Window 10, Post St", objects: ["rainbow", "butterfly", "genieLamp"],
      description: "The Storyteller is all about expression, wit, and idea sharing.\nTheir ideas are their fuel; the stories they tell are their magic. The Storyteller will have you completely wrapped up in their magnificently poetic words. They are the personalities who are never boring to be around. Poet the Storyteller can open their mouth and effortlessly captivate an entire room.",
      powers: "Sharing Fantasy and Imagination",
      struggles: "Hogging the Spotlight",
      recharge: ["Ask someone about their day", "Read a book", "Write a short story"],
      challenge: "Take a photo with your favorite book together with Poet!",
      pairings: ["atlas", "sol"],
      spot: { name: "Dolores Park", lat: 37.759913, lng: -122.426088, bonus: false, giantFeet: 30 }
    },
    {
      id: "pixie", number: 11, name: "Willow", archetype: "The Psychic",
      element: "Water", elements: ["Water"], trait: "Intuition", color: "Indigo", colorHex: "#4B3F8F", object: "Mirror",
      mural: "Window 11, Post St", objects: [],
      description: "Willow the Psychic is a gentle soul with unmatched depth and understanding. Seeing far beyond what meets the eye, Willow senses the hidden energy flowing softly beneath reality. They understand the stories of those who came before and how every thread of energy connects to the present moment. Drawn to the mysteries of life, death, and everything in between, Willow feels no fear, only wonder, knowing there is profound magic in it all.",
      powers: "Intuition, Understanding, Sees things before they happen",
      struggles: "Isolation, Being Misunderstood",
      recharge: ["Social interactions", "Nature", "Walking with a friend"],
      challenge: "Light a candle with Willow, and capture a photo together!",
      pairings: ["ocean", "atlas"],
      spot: { name: "Cole Valley", lat: 37.765845, lng: -122.449587, bonus: false, giantFeet: 15 }
    },
    {
      id: "flow", number: 12, name: "Fog", archetype: "The Weightless",
      element: "Water & Air", elements: ["Water", "Air"], trait: "Adaptability", color: "Gray Cloud", colorHex: "#A9AEB4", object: "Globe",
      mural: "Window 12, Post St", objects: ["puzzle", "notebook_1", "globe"],
      description: "Fog is adaptable, resilient, strong and completely free-flowing. The Weightless Fog rolls with whatever life throws their way, yet they never fall into people-pleasing. Their flexibility is born from pure inner strength, not submission.\nFog is a very tall, bendy figure with long, whimsical limbs that appear weightless in the wind.\nThe Weightless Fog has a free-forming silhouette that shifts smoothly around obstacles, a testament to their graceful flow that carves their true path.",
      powers: "Resilience, Adaptability, Independence",
      struggles: "Directionless at times",
      recharge: ["Dinner with family", "Take a class", "Go on a vacation"],
      challenge: "Do your best flexing pose and stretch those limbs! Take a photo with Fog and flow it out!",
      pairings: ["compass", "sol"],
      spot: { name: "Rincon Park · Embarcadero", lat: 37.791504, lng: -122.390221, bonus: false, giantFeet: 30 }
    },
    {
      id: "ash", number: 13, name: "Mangrove", archetype: "The Guru",
      element: "Earth & Water", elements: ["Earth", "Water"], trait: "Wisdom", color: "Amber", colorHex: "#D99A2B", object: "Feather",
      mural: "Window 9, Post St · shared with Fleur", objects: ["bunny", "caterpillar", "wateringCan"],
      description: "The Guru provides perspective, peace, understanding, and sound judgment.\nThey are the quiet anchors of the entire Character universe. An iconic mentor carrying a timeless spirit.\nWhere others react with noise and impulse, Mangrove the Guru operates with a deep, immovable stillness.",
      powers: "Empathy, Humility, Composure",
      struggles: "Heavy Solitude",
      recharge: ["Do something playful", "Be around family", "Hang out with friends"],
      challenge: "Find your meditative pose together with Mangrove the Guru.",
      pairings: ["rascal", "captain"],
      spot: { name: "Japantown · Peace Pagoda", lat: 37.7852, lng: -122.4297, bonus: false, giantFeet: 20 }
    }
  ],

  /* ---------- Quiz ----------
     demit's questions. Each answer has an ELEMENT (never shown on the site) plus the two
     characters of that element it leans toward: "main" (3 points) and "also" (1 point).
     How a result is picked:
       1. The element picked most often wins (a tie goes to the one picked most recently).
       2. Among that element's characters, the most lean points wins (tie: most recent).
     So your character always matches your strongest element. Fog counts as Water and Air,
     Mangrove as Earth and Water. With these leans, each of the 13 characters comes up
     7.2–8.6% of the time across every possible set of answers. If you change the leans,
     ask Claude to re-check the balance. */
  quiz: [
    { q: "What brought you to San Francisco?", answers: [
      { text: "Chasing my dream!", element: "Fire", main: "sol", also: "captain" },
      { text: "I'm here for family, to set down roots.", element: "Earth", main: "flora", also: "sequoia" },
      { text: "I'm just in town exploring!", element: "Air", main: "flow", also: "atlas" },
      { text: "The Bay Area is my home!", element: "Water", main: "ocean", also: "ash" } ] },

    { q: "What do you hope your time in San Francisco will be like?", answers: [
      { text: "Time to wander, think, and figure it all out as it comes.", element: "Air", main: "flow", also: "rascal" },
      { text: "Building and sharing what I've learned with others.", element: "Water", main: "pixie", also: "flow" },
      { text: "Doing it my own way, by my own rules.", element: "Fire", main: "rebel", also: "captain" },
      { text: "Finding a local café that knows my morning order.", element: "Earth", main: "sequoia", also: "flora" } ] },

    { q: "Finish this sentence: “A special day in San Francisco is when…”", answers: [
      { text: "I'm showing someone my new favorite spot.", element: "Water", main: "ash", also: "flow" },
      { text: "I find quiet moments to take life in.", element: "Air", main: "lorey", also: "rascal" },
      { text: "The people I love are around me.", element: "Earth", main: "compass", also: "sequoia" },
      { text: "All of my goals are within reach.", element: "Fire", main: "captain", also: "sol" } ] },

    { q: "What's your favorite dining experience in San Francisco?", answers: [
      { text: "A meal at my favorite restaurant.", element: "Water", main: "flow", also: "ocean" },
      { text: "Finding a place I've never been.", element: "Air", main: "rascal", also: "flow" },
      { text: "A yummy home-cooked meal.", element: "Earth", main: "flora", also: "sequoia" },
      { text: "Eating at a park with something I brought.", element: "Fire", main: "sol", also: "rebel" } ] },

    { q: "What's the best thing about SF?", answers: [
      { text: "The nature, the views, the sightseeing!", element: "Earth", main: "compass", also: "ash" },
      { text: "You've gotta try all of the different cuisines!", element: "Fire", main: "captain", also: "rebel" },
      { text: "The art, the creativity, the innovation!", element: "Water", main: "ocean", also: "pixie" },
      { text: "There are just too many things to pick one!", element: "Air", main: "lorey", also: "atlas" } ] },

    { q: "What's the most important thing you'll remember about your time in San Francisco?", answers: [
      { text: "Perspective: a greater understanding of why I was meant to be here.", element: "Fire", main: "sol", also: "rebel" },
      { text: "Career: my time here was meant to better the future generation.", element: "Air", main: "atlas", also: "rascal" },
      { text: "Calm: a slower pace, mental peace, an understanding of myself.", element: "Water", main: "ocean", also: "flow" },
      { text: "Connection: my community of friends and family.", element: "Earth", main: "compass", also: "sequoia" } ] },

    { q: "What does San Francisco represent to you?", answers: [
      { text: "The freedom to become whomever you desire.", element: "Water", main: "flow", also: "pixie" },
      { text: "A diverse community where everyone belongs.", element: "Earth", main: "ash", also: "sequoia" },
      { text: "Courage to challenge the norm and push your creative boundaries.", element: "Fire", main: "rebel", also: "captain" },
      { text: "A place that looks to nurture the future of our world.", element: "Air", main: "atlas", also: "rascal" } ] },

    { q: "Finish this sentence: “My friends and family usually come to me because…”", answers: [
      { text: "They need a plan that actually works.", element: "Water", main: "pixie", also: "ocean" },
      { text: "We love to gossip.", element: "Air", main: "rascal", also: "flow" },
      { text: "I'm an awesome listener.", element: "Earth", main: "ash", also: "sequoia" },
      { text: "I give honest advice, even if it's tough.", element: "Fire", main: "rebel", also: "captain" } ] },

    { q: "Pick one item that best describes your personality:", answers: [
      { text: "Jewelry", element: "Water", main: "pixie", also: "ocean" },
      { text: "Measuring tape", element: "Earth", main: "sequoia", also: "compass" },
      { text: "A book: sketchbook, journal or something to read", element: "Air", main: "atlas", also: "rascal" },
      { text: "Cell phone", element: "Fire", main: "sol", also: "rebel" } ] },

    { q: "What color best describes you?", answers: [
      { text: "Cobalt Blue", element: "Water", main: "ash", also: "flow" },
      { text: "Crimson Red", element: "Fire", main: "captain", also: "rebel" },
      { text: "Sunflower Yellow", element: "Air", main: "lorey", also: "rascal" },
      { text: "Sage Green", element: "Earth", main: "flora", also: "sequoia" } ] }
  ]
};
