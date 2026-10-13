/* =====================================================================
   384 POST · COLORFUL CHARACTERS — EVERYTHING EDITABLE LIVES HERE
   ---------------------------------------------------------------------
   Change text, pairings, hunt spots, quiz questions or settings in
   this one file. Save, push to GitHub, done. No other file needs to
   change for content updates.
   ===================================================================== */

window.CONFIG = {

  /* ---------- General settings ---------- */
  settings: {
    title: "Colorful Characters of San Francisco",
    artist: "demit omphroy",                 // ← confirm exact spelling/casing with demit
    hashtag: "#384Post",

    // ---- Social sharing (result page) ----
    // In the text, {name} {archetype} {element} {trait} {artist} are filled in automatically.
    share: {
      hashtags: ["384Post", "ColorfulCharacters", "UnionSquare"],   // no "#", no spaces
      // Facebook (copied for pasting), LinkedIn, Instagram & TikTok captions:
      text: "I'm {name}, {archetype}! ✨ {artist}'s new mural at 384 Post in Union Square brings 13 Colorful Characters of San Francisco to life. Take the quiz to find yours, then hunt for the giants around the city.",
      // X and Bluesky (short posts):
      shortText: "I'm {name}, {archetype}! ✨ Which of {artist}'s Colorful Characters of San Francisco are you? Find yours at 384 Post in Union Square.",
      imageHashtag: "#384Post"   // printed on the share image
    },
    siteUrl: "https://384post.github.io/demit/",
    // The main 384 Post page (Ceros). Shared links land here; the site links back to it.
    cerosUrl: "https://view.ceros.com/cbre-strike-team/384-post",

    // ---- Footer ----
    contacts: [
      { name: "Alex Sagues", license: "Lic. 02055525", phone: "+1 415 772 0306", email: "Alex.Sagues@cbre.com" },
      { name: "Madeline Redmond", license: "Lic. 02186119", phone: "+1 703 732 8553", email: "Madeline.Redmond@cbre.com" }
    ],
    artworkNotice: "All Colorful Characters artwork, characters, names and descriptions © 2026 demit omphroy. All rights reserved. Used with permission; may not be copied or reused without the artist's written consent.",
    cbreNotice: "© 2026 CBRE, Inc. This information has been obtained from sources believed reliable. We have not verified it and make no guarantee, warranty or representation about it. Any projections, opinions, assumptions or estimates used are for example only and do not represent the current or future performance of the property. You and your advisors should conduct a careful, independent investigation of the property to determine to your satisfaction the suitability of the property for your needs.",
    privacyPolicyUrl: "https://www.cbre.com/about-us/global-web-privacy-and-cookie-policy",
    californiaPrivacyUrl: "https://www.cbre.com/about-us/california-consumer-privacy-policy",   // ← your GitHub Pages URL (used in share text)

    unlockRadiusMeters: 100,     // how close someone must be to "find" a character

    // Secret reward once all 13 are found. Use an UNLISTED YouTube/Vimeo
    // EMBED link, e.g. "https://www.youtube.com/embed/VIDEO_ID".
    // Leave empty to show the placeholder card.
    secretVideoUrl: "",

    // Google Analytics 4 measurement ID, e.g. "G-ABC123XYZ". Leave empty
    // while testing so test clicks don't pollute the real numbers.
    gaMeasurementId: "G-T55WBWZXNS",

    // Mapbox map (optional). Paste a URL-restricted PUBLIC token (starts with "pk.").
    // Leave empty to fall back to basic OpenStreetMap tiles (emergency/testing only).
    mapboxToken: "pk.eyJ1IjoibGh1ZmZtYW5jYnJlIiwiYSI6ImNtdjZlN3J5ejAxa3gyeHBxN3FjejdqbHEifQ.rmqGXEF9O1lin0F_VPlLdw",
    // Map look: any Mapbox style URL, e.g. one you design in Mapbox Studio
    // ("mapbox://styles/your-account/your-style-id").
    mapboxStyle: "mapbox://styles/mapbox/light-v11",

    // ---- demit's links (footer + Characters page) ----
    artistInstagram: "https://www.instagram.com/demit/",
    artistWebsite: "https://www.demitomphroy.com/",
    // ---- "Stay in touch" sign-up (Microsoft Forms) ----
    // Paste the form's share link here. Leave empty to hide the "Stay in touch" links.
    contactFormUrl: "",
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
    { id: "shield", name: "Shield", size: 89 },
    { id: "leaf", name: "Leaf", size: 54 },
    { id: "basket", name: "Basket", size: 97 },
    { id: "skull", name: "Skull", size: 68 },
    { id: "flame", name: "Flame", size: 69 },
    { id: "waves", name: "Wavy Lines", size: 76 },
    { id: "sage", name: "Sage", size: 69 },
    { id: "sword", name: "Sword", size: 93 },
    { id: "ducky", name: "Rubber Ducky", size: 57 },
    { id: "helmet", name: "Knight's Helmet", size: 97 },
    { id: "architectTool", name: "Architect's Tool", size: 79 },
    { id: "ruler", name: "Ruler", size: 74 },
    { id: "cigarette", name: "Cigarette", size: 64 },
    { id: "key", name: "Key", size: 61 },
    { id: "binoculars", name: "Binoculars", size: 105 },
    { id: "balloon", name: "Balloon", size: 72 },
    { id: "calendar", name: "Calendar", size: 75 },
    { id: "saw", name: "Saw", size: 70 },
    { id: "mushroom", name: "Mushroom", size: 71 },
    { id: "house", name: "House", size: 105 },
    { id: "sneaker", name: "Sneaker", size: 77 },
    { id: "doubleWave", name: "Double Wave", size: 60 },
    { id: "candle", name: "Candle", size: 64 },
    { id: "sword_1", name: "Dagger", size: 84 },
    { id: "flashlight", name: "Flashlight", size: 68 },
    { id: "glasses", name: "Glasses", size: 65 },
    { id: "snails", name: "Snails", size: 115 },
    { id: "hammer", name: "Hammer", size: 84 },
    { id: "throne", name: "Throne", size: 129 },
    { id: "boat", name: "Boat", size: 105 },
    { id: "flowerpot", name: "Flower Pot", size: 67 },
    { id: "rose", name: "Rose in a Dome", size: 66 },
    { id: "caterpillar", name: "Caterpillar", size: 102 },
    { id: "cutlery", name: "Spoon, Fork & Knife", size: 103 },
    { id: "dancingCouple", name: "Dancing Couple", size: 98 },
    { id: "mirror", name: "Hand Mirror", size: 79 },
    { id: "lotus", name: "Lotus", size: 68 },
    { id: "notebook", name: "Spiral Notebook", size: 80 },
    { id: "nails", name: "Nails", size: 61 },
    { id: "yinYang", name: "Yin-Yang", size: 66 },
    { id: "tripleWaves", name: "Triple Waves", size: 60 },
    { id: "sailboat", name: "Sailboat", size: 102 },
    { id: "globe", name: "Globe", size: 92 },
    { id: "musicNote", name: "Music Notes", size: 64 },
    { id: "typewriter", name: "Typewriter", size: 93 },
    { id: "paddle", name: "Paddle", size: 75 },
    { id: "puzzle", name: "Puzzle Piece", size: 68 },
    { id: "mase", name: "Mace", size: 97 },
    { id: "notebook_1", name: "Notebook", size: 82 },
    { id: "tombstone", name: "Tombstone", size: 102 },
    { id: "carrot", name: "Carrot", size: 76 },
    { id: "goldfish", name: "Goldfish", size: 53 },
    { id: "genieLamp", name: "Genie Lamp", size: 86 },
    { id: "calculator", name: "Calculator", size: 82 },
    { id: "wateringCan", name: "Watering Can", size: 118 },
    { id: "dog", name: "Dog", size: 133 },
    { id: "gem", name: "Gem", size: 70 },
    { id: "compass", name: "Compass", size: 78 },
    { id: "lighteningBolt", name: "Lightning Bolt", size: 80 },
    { id: "octobus", name: "Octopus", size: 105 },
    { id: "butterfly", name: "Butterfly", size: 81 },
    { id: "crown", name: "Crown", size: 68 },
    { id: "siren", name: "Siren", size: 72 },
    { id: "horse", name: "Horse", size: 140 },
    { id: "pencil2", name: "Pencil", size: 61 },
    { id: "baton", name: "Baton", size: 80 },
    { id: "bunny", name: "Bunny", size: 91 },
    { id: "rainbow", name: "Rainbow", size: 91 }
  ],

  /* ---------- The 13 characters ----------
     id      – short code used everywhere (don't change once live)
     art     – stand-in cutouts for now; swap in demit's clean PNGs
     spot    – hunt location. lat/lng are APPROXIMATE — confirm on site.
               giantFeet = how tall the giant AR version is at that spot (bigger at
               wide-open spots, smaller in tight ones). Changing it needs the giant
               model rebuilt: node tools/make_giants.mjs (see README). */
  characters: [
    {
      id: "sol", number: 1, archetype: "The Catalyst / The Spark", name: "Sol",
      element: "Fire", trait: "Enthusiasm", color: "Orange", colorHex: "#E3923B", object: "Speaker",
      description: "Considered to be a ray of light. The moment they arrive, the slow energy shifts. They ignite conversation and can get a room to start dancing. They are the character who gathers all the other Colorful Characters together when a new idea or adventure pops up.",
      signature: "A spontaneous dance break on the sidewalk.",
      power: "Confidence",
      struggles: "Impulsive, fast energy burner. Can overwhelm others who aren't as outgoing.",
      antidote: "Some music, and a recharge with a coffee.",
      pairings: ["ash", "ocean"],
      spot: { name: "384 Post · Union Square", lat: 37.78862, lng: -122.40778, bonus: false, giantFeet: 20,
        why: "Sol gathers everyone — so the hunt starts at home base." }
    },
    {
      id: "rebel", number: 2, archetype: "The Independent", name: "Rebel",
      element: "Fire", trait: "Autonomy", color: "Burgundy", colorHex: "#8C2B3A", object: "Bandanna",
      description: "Rebel is bold, unconventional, breaks the mold. Goes their own way and forges their own path—unafraid of risk, completely unapologetic, and comfortable living outside the lines. They cut through the bureaucracy. The Rebel re-shifts the entire process and takes the leap no one else dared to attempt. It's more of a “like them or love them” situation, and they aren't spending energy explaining their decisions.",
      power: "Integrity",
      struggles: "Impatience with slow consensus-building or over-explaining.",
      antidote: "A long walk outside. A home-cooked meal.",
      pairings: ["compass", "rascal"],
      spot: { name: "Clarion Alley murals · Mission", lat: 37.76305, lng: -122.42185, bonus: true, giantFeet: 15,
        why: "Fellow rule-breaking artists, painting outside the lines." }
    },
    {
      id: "captain", number: 3, archetype: "The Leader", name: "Captain",
      element: "Fire", trait: "Leadership", color: "Crimson Red", colorHex: "#C8323C", object: "Scepter",
      description: "Drive, Ambition, fiercely competitive, natural leader. Wearing a crown with confidence, they roar like a lion with their large mane. A Pioneer. A leader, by every definition. Fiercely competitive, ambitious, with a drive to conquer. Fearless. They will lead their team to success, even if it means stepping through failure to get there. They have no time for sorrows, and no time to dwell on the negative. Forward thinkers whose core motto is “We must overcome.”",
      power: "Honesty",
      struggles: "Blunt and difficult to pin down.",
      antidote: "Adventure and Exploration.",
      pairings: ["sol", "flora"],
      spot: { name: "City Hall · Civic Center", lat: 37.77927, lng: -122.41924, bonus: false, giantFeet: 30,
        why: "A throne-sitter under the grandest dome in town." }
    },
    {
      id: "sequoia", number: 4, archetype: "The Builder", name: "Sequoia",
      element: "Earth", trait: "Resourceful", color: "Leaf Green", colorHex: "#3F9150", object: "Hammer",
      description: "Sequoia is the maker—sharp minds and two steps ahead of the blueprint. Practical, grounded, and very hands-on, they turn things imaginations into physical creations. The Builder possesses a rare, resourceful magic that finds total contentment in the present moment. Down-to-earth, deeply understanding, and built on a foundation of grit. They are the backbone. The ones who talk less, roll up their sleeves, and get it done.",
      power: "Loyal",
      struggles: "Stubborn, once their mind is made up.",
      antidote: "Curiosity and Perspective-Shifting. Going to a museum, watching a new movie.",
      pairings: ["captain", "sol"],
      spot: { name: "Salesforce Park", lat: 37.78960, lng: -122.39620, bonus: false, giantFeet: 20,
        why: "A whole park built on top of a transit hub — peak maker energy." }
    },
    {
      id: "rascal", number: 5, archetype: "The Child, The Dreamer", name: "Rascal",
      element: "Air", trait: "Imagination", color: "Sky Blue", colorHex: "#6FA8DC", object: "Conductor's Baton",
      description: "Imaginative, Whimsical, idealistic. A dreamer with their head in the clouds. In some ways, they live in their own world of wonder. You say jump, they say “What color?” Weird but eccentric. They can get caught up in the story and spin it in their own beautiful way. You may not understand them, but how could you? They don't always understand themselves. The doors are constantly opening to another beautiful story—this is the beauty of their imaginative mind. Anything goes. With their conductor's baton in hand, they orchestrate vibrant worlds out of thin air.",
      power: "Endless Wonder",
      struggles: "Unpredictability",
      antidote: "Structure. Puzzle, writing, exercise.",
      pairings: ["sequoia", "compass"],
      spot: { name: "Hyde Street Pier tall ships", lat: 37.80860, lng: -122.42160, bonus: true, giantFeet: 25,
        why: "Pirate hat on, ships in the harbor — and you arrive by cable car." }
    },
    {
      id: "ocean", number: 6, archetype: "The Guardian", name: "Ocean",
      element: "Water", trait: "Empathy", color: "Cerulean", colorHex: "#2A7AB0", object: "Shield",
      description: "Lots of empathy, feels safe to be around. A protector and also very intuitive. Doesn't need to say much but will safely be by your side. To have a Guardian is to have a protector. Secure in their own right, strong for both. Their presence provides an immediate sense of calm and security. To the wailing child, they provide a soothing shelter. To the chaotic life, they ease the overworking mind. Despite their imposing physical presence, their eyes radiate deep warmth and quiet understanding.",
      power: "Protection",
      struggles: "Emotional Fatigue",
      antidote: "Self-Compassion and Boundaries. Self care, massage, relaxation.",
      pairings: ["rascal", "sol"],
      spot: { name: "Golden Gate Bridge overlook", lat: 37.80770, lng: -122.47500, bonus: true, giantFeet: 30,
        why: "The guardian of the bay, standing watch at the Gate." }
    },
    {
      id: "atlas", number: 7, archetype: "The Thinker", name: "Atlas",
      element: "Air", trait: "Knowledge", color: "Cobalt", colorHex: "#2F4FA3", object: "Notebook",
      description: "Curiosity, Analytical, quiet observer, solves the puzzle. Asks a lot of questions. Doesn't always talk too much. In their head, quietly observing. Learning. A knowledge-hungry learner who understands the true power of listening before speaking. They take in the world through keen, watchful eyes, constantly asking the right questions and collecting pieces of the grand human puzzle.",
      power: "Listening (The ability to listen past the noise, connect hidden patterns, and uncover the simple truth inside complex problems.)",
      struggles: "Paralysis by Analysis",
      antidote: "Spontaneous Action and Vocal Expression, Singing in the shower.",
      pairings: ["rascal", "sol"],
      spot: { name: "Exploratorium · Pier 15", lat: 37.80170, lng: -122.39730, bonus: false, giantFeet: 20,
        why: "Notebook out, asking questions at the museum of curiosity." }
    },
    {
      id: "compass", number: 8, archetype: "The Architect", name: "Compass",
      element: "Earth", trait: "Precision", color: "Emerald", colorHex: "#1F8A5B", object: "Ruler",
      description: "Clarity, Precise, organized, loves systems and symmetry. Understands numbers, patterns, and structural symmetry where nature and science meet. The ultimate Type A character: organized, concise, and masterfully efficient. Picture a spider weaving a mathematically flawless web at dawn, or a Queen Bee engineering an intricate, perfectly geometric hive—Precision sees the invisible grid underlying the entire world. They don't just exist in space; they balance it.",
      power: "Clarity",
      struggles: "Perfectionism, can become fixated on micro-details.",
      antidote: "Spontaneity and Flow. Art, Cooking, swimming in the ocean.",
      pairings: ["sequoia", "sol"],
      spot: { name: "Transamerica Pyramid", lat: 37.79520, lng: -122.40280, bonus: false, giantFeet: 15,
        why: "Pure geometry and precision, right on the skyline." }
    },
    {
      id: "flora", number: 9, archetype: "The Caretaker", name: "Flora",
      element: "Earth", trait: "Nurture", color: "Terracotta", colorHex: "#C4663F", object: "Harvesting Basket",
      description: "The Caretaker—Nurturing. A secure, grounded, patient figure. They have a green thumb, understand the rhythms of the seasons, and carry an effortless, deep-rooted wisdom about how life unfolds. They possess the rare ability to listen to others' deepest problems with true empathy without letting that heavy energy cloud their own peace. Because they know exactly who they are, they listen without judgment or influence.",
      power: "Empathy",
      struggles: "Detachment or Over-patience",
      antidote: "Urgency and Action. Dancing in the rain.",
      pairings: ["captain", "compass"],
      spot: { name: "Ferry Building farmers market", lat: 37.79555, lng: -122.39365, bonus: false, giantFeet: 25,
        why: "Basket in hand, meeting the farmers." }
    },
    {
      id: "lorey", number: 10, archetype: "The Storyteller", name: "Lorey",
      element: "Air", trait: "Expression", color: "Turquoise", colorHex: "#2BB3B1", object: "Book",
      description: "Expression, Witty, loves sharing ideas. Ideas are their fuel; stories are their magic. They will have you completely wrapped up in their words through a majestic, poetic rhythm. They are the people who are never boring to be around. They open their mouth and effortlessly captivate an entire room.",
      power: "Captivating Attention",
      struggles: "Hogging the Spotlight",
      antidote: "Active Listening and Quiet Reflection, Reading a book, listening to music.",
      pairings: ["atlas", "sol"],
      spot: { name: "Jack Kerouac Alley · North Beach", lat: 37.79755, lng: -122.40660, bonus: false, giantFeet: 15,
        why: "A public alley named for a writer, poetry set in the pavement." }
    },
    {
      id: "pixie", number: 11, archetype: "The Clairvoyant", name: "Pixie",
      element: "Water", trait: "Understanding", color: "Indigo", colorHex: "#4B3F8F", object: "Mirror",
      description: "This character has an unmatched depth and understanding; they have a beautifully deep soul—one that sees far beyond just what is in front of you. They see the hidden energy flowing beneath reality. They understand the lives that have been here before and how all energy connects to the present in ways regular folks can't see with the naked eye. They hold a deep interest in mystery, life, and death, yet they never feel scared or nervous—for they know there is profound magic in it all.",
      power: "Unseen Sight",
      struggles: "Isolation and Being Misunderstood",
      antidote: "Human Connection and Shared Experience. Being one with Nature.",
      pairings: ["ocean", "atlas"],
      spot: { name: "Palace of Fine Arts lagoon", lat: 37.80290, lng: -122.44840, bonus: true, giantFeet: 30,
        why: "A mirror-still lagoon full of history and reflections." }
    },
    {
      id: "flow", number: 12, archetype: "The Adaptable", name: "Flow",
      element: "Water / Air", trait: "Adaptability", color: "Aquamarine", colorHex: "#4FC3B5", object: "Wave",
      description: "Adaptable, flexible, resilient, strong, understanding, and completely free-flowing. They roll with whatever life throws their way, yet they never fall into people-pleasing—their flexibility is born from pure inner strength, not submission. They are a tall, bendy figure with long, limber limbs that look as though they move like liquid in wind. With a free-forming silhouette shifts smoothly around obstacles, proving that true power doesn't crash against walls—it gracefully flows around them and carves its own path.",
      power: "Resilience",
      struggles: "Directionless at times.",
      antidote: "Purposeful Intent and Anchoring, dinners with family. Classes. Going on a planned vacation.",
      pairings: ["compass", "sol"],
      spot: { name: "Pier 14 · Embarcadero", lat: 37.79300, lng: -122.38870, bonus: false, giantFeet: 25,
        why: "Bending out over the bay where the waves roll in." }
    },
    {
      id: "ash", number: 13, archetype: "The Elder", name: "Ash",
      element: "Earth / Water", trait: "Wisdom", color: "Amber", colorHex: "#D99A2B", object: "Wooden Staff",
      description: "Providing, perspective, peace, understanding, emotional intelligence, sound judgment. Empathy, Humility, Composure. They are the quiet anchor of the entire character universe—an iconic mentor carrying a timeless spirit. Where others react with noise and impulse, they operate with a deep, immovable stillness.",
      power: "Perspective",
      struggles: "Heavy Solitude",
      antidote: "Playful Presence and Joy. Seeing family, watching comedy, hanging with friends.",
      pairings: ["rascal", "captain"],
      spot: { name: "Coit Tower · Telegraph Hill", lat: 37.80239, lng: -122.40582, bonus: false, giantFeet: 25,
        why: "Wisdom as perspective — the whole city from above." }
    }
  ],

  /* ---------- Quiz ----------
     Each answer: main = the character it most points to (3 pts),
     also = a secondary character (1 pt). The winner is the character
     with the highest % of their possible points (so characters that
     appear in fewer answers aren't disadvantaged). Ties → higher raw
     score, then whoever scored most recently. Current mapping gives
     each character a 7–8.5% chance across all answer combinations.
     Questions 1–7 are from the Ceros sample; 8–9 were added by Claude. */
  quiz: [
    { q: "What first brought you to San Francisco?", answers: [
      { text: "A dream I couldn't chase anywhere else.", main: "rascal", also: "captain" },
      { text: "Family — to set down roots and build a home.", main: "flora", also: "ocean" },
      { text: "The freedom to become someone new.", main: "flow", also: "pixie" },
      { text: "A chance to build something that lasts.", main: "sequoia", also: "captain" } ] },

    { q: "When you picture your future here, you see…", answers: [
      { text: "Time to wander, think, and figure it out.", main: "atlas", also: "flow" },
      { text: "Sharing what I've learned with others.", main: "ash", also: "atlas" },
      { text: "Doing it my own way, rules aside.", main: "rebel", also: "rascal" },
      { text: "A community that knows me by name.", main: "sol", also: "flora" } ] },

    { q: "The Bay Area feels most like home when…", answers: [
      { text: "I'm showing someone their new favorite spot.", main: "sol", also: "lorey" },
      { text: "I've got a quiet moment to take it all in.", main: "pixie", also: "atlas" },
      { text: "The people I love are gathered close.", main: "ocean", also: "ash" },
      { text: "Anything still feels possible.", main: "captain", also: "flow" } ] },

    { q: "Your kind of fresh start looks like…", answers: [
      { text: "A steady, caring home base.", main: "flora", also: "ocean" },
      { text: "Learning something completely new.", main: "atlas", also: "lorey" },
      { text: "Tearing up the old rulebook.", main: "rebel", also: "sol" },
      { text: "A bold goal and people rallied to it.", main: "captain", also: "compass" } ] },

    { q: "A newcomer asks you about the city. You…", answers: [
      { text: "Walk them through your favorite corners.", main: "sol", also: "ocean" },
      { text: "Tell them what this place really means.", main: "ash", also: "pixie" },
      { text: "Show them the side guidebooks miss.", main: "lorey", also: "rebel" },
      { text: "Spin them a vision of all it could be.", main: "rascal", also: "captain" } ] },

    { q: "What do you hope to leave behind here?", answers: [
      { text: "A perspective that makes people pause.", main: "pixie", also: "atlas" },
      { text: "Something I built that outlasts me.", main: "sequoia", also: "compass" },
      { text: "Knowledge passed to the next generation.", main: "ash", also: "atlas" },
      { text: "A community that feels cared for.", main: "ocean", also: "flora" } ] },

    { q: "What does San Francisco represent to you?", answers: [
      { text: "The freedom to become whoever I want.", main: "flow", also: "rascal" },
      { text: "A place where everyone belongs.", main: "flora", also: "sol" },
      { text: "The courage to challenge and reinvent.", main: "rebel", also: "captain" },
      { text: "A future worth building for others.", main: "compass", also: "sequoia" } ] },

    { q: "Your friends call you when they need…", answers: [
      { text: "A plan that actually works.", main: "sequoia", also: "compass" },
      { text: "Someone to really listen.", main: "ocean", also: "atlas" },
      { text: "The best story at dinner.", main: "lorey", also: "sol" },
      { text: "Honest advice, no sugarcoating.", main: "captain", also: "rebel" } ] },

    { q: "Pick something to carry through the city.", answers: [
      { text: "A hand mirror", main: "pixie", also: "ash" },
      { text: "A ruler", main: "compass", also: "sequoia" },
      { text: "A wave", main: "flow", also: "rascal" },
      { text: "A well-worn book", main: "lorey", also: "atlas" } ] }
  ]
};
