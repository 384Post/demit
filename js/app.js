/* 384 Post · Colorful Characters — app logic
   Content lives in data/config.js. This file shouldn't need edits for copy changes. */
(function () {
  "use strict";

  const C = window.CONFIG, S = C.settings;
  const chars = C.characters;
  const byId = {};
  chars.forEach((c, i) => { byId[c.id] = c; c.index = i; });
  const TOTAL = chars.length;
  const app = document.getElementById("app");
  const ART = id => `assets/characters/${id}.svg`;      // crisp art for the pages
  const ART_PNG = id => `assets/characters/${id}.png`;  // same art as PNG, for drawing share images
  // Two sizes of every 3D model: life-size (~6 ft) and giant (15–30 ft, set per spot by giantFeet)
  const MODEL = (id, giant) => `assets/models/${giant ? "giant/" : ""}${id}.glb`;
  const MODEL_VIEWER = "vendor/model-viewer/model-viewer.min.js";
  const esc = s => String(s == null ? "" : s).replace(/[&<>"']/g, m => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m]));
  const pick = arr => arr[Math.floor(Math.random() * arr.length)];

  document.getElementById("artistName").textContent = S.artist;
  document.getElementById("hashtag").textContent = S.hashtag;

  /* ---------------- Storage (browser-only; survives refresh, not device switches) ---------------- */
  const mem = {};
  const store = {
    get(k, d) {
      try { const v = localStorage.getItem("c384." + k); if (v != null) return JSON.parse(v); } catch (e) {}
      return k in mem ? mem[k] : d;
    },
    set(k, v) { mem[k] = v; try { localStorage.setItem("c384." + k, JSON.stringify(v)); } catch (e) {} },
    del(k) { delete mem[k]; try { localStorage.removeItem("c384." + k); } catch (e) {} }
  };
  if (/[?&]test=1/.test(location.search)) store.set("test", true);
  const isTest = () => !!store.get("test", false);
  const foundKey = () => (isTest() ? "testFound" : "found");
  const getFound = () => store.get(foundKey(), {});
  const isFound = id => !!getFound()[id];
  const foundCount = () => Object.keys(getFound()).filter(id => byId[id]).length;
  const myResult = () => (byId[store.get("result")] ? store.get("result") : null);
  // AR is open for: characters you've found, your own quiz character (anytime), and everything in test mode
  const canAR = id => isFound(id) || myResult() === id || isTest();

  /* ---------------- Google Analytics (only when an ID is set; never in test mode) ---------------- */
  if (S.gaMeasurementId) {
    const s = document.createElement("script");
    s.async = true; s.src = "https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(S.gaMeasurementId);
    document.head.appendChild(s);
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag("js", new Date());
    window.gtag("config", S.gaMeasurementId, { send_page_view: false });
  }
  function track(name, params) {
    if (isTest() || !window.gtag) return;
    window.gtag("event", name, params || {});
  }

  /* ---------------- Little helpers ---------------- */
  const toastEl = document.getElementById("toast");
  let toastTimer;
  function toast(msg) {
    toastEl.textContent = msg; toastEl.hidden = false;
    clearTimeout(toastTimer); toastTimer = setTimeout(() => (toastEl.hidden = true), 2800);
  }
  const modalEl = document.getElementById("modal");
  const modalCard = modalEl.querySelector(".modal-card");
  const modalQueue = [];
  function openModal(html) {
    if (!modalEl.hidden) { modalQueue.push(html); return; }
    modalCard.innerHTML = html; modalEl.hidden = false;
    modalCard.querySelectorAll("[data-close]").forEach(b => b.addEventListener("click", closeModal));
    modalCard.querySelectorAll("a[href^='#']").forEach(a => a.addEventListener("click", closeModal));
  }
  function closeModal() {
    modalEl.hidden = true; modalCard.innerHTML = "";
    if (modalQueue.length) setTimeout(() => openModal(modalQueue.shift()), 150);
  }
  modalEl.addEventListener("click", e => { if (e.target === modalEl) closeModal(); });
  document.addEventListener("keydown", e => { if (e.key === "Escape" && !modalEl.hidden) closeModal(); });

  function confetti() {
    const box = document.createElement("div"); box.className = "confetti";
    const cols = ["#DC4A4E", "#4D7FC1", "#F6E54E", "#3F9150", "#E3923B", "#fff"];
    for (let i = 0; i < 70; i++) {
      const p = document.createElement("i");
      p.style.left = Math.random() * 100 + "vw";
      p.style.background = pick(cols);
      p.style.animationDuration = 2 + Math.random() * 2.5 + "s";
      p.style.animationDelay = Math.random() * .6 + "s";
      box.appendChild(p);
    }
    document.body.appendChild(box); setTimeout(() => box.remove(), 5500);
  }

  function distanceM(a, b) {
    const R = 6371000, rad = x => x * Math.PI / 180;
    const dLat = rad(b.lat - a.lat), dLng = rad(b.lng - a.lng);
    const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(h));
  }
  function fmtDist(m) {
    if (m < 1000) return Math.round(m / 10) * 10 + " m away";
    const mi = m / 1609.34; return (mi < 10 ? mi.toFixed(1) : Math.round(mi)) + " mi away";
  }
  const directions = c => `https://www.google.com/maps/dir/?api=1&destination=${c.spot.lat},${c.spot.lng}&travelmode=walking`;

  /* ---------------- Quiz scoring ---------------- */
  // Max points each character could earn, so characters in fewer answers aren't disadvantaged.
  const maxPts = (() => {
    const m = {}; chars.forEach(c => (m[c.id] = 0));
    C.quiz.forEach(q => {
      const best = {};
      q.answers.forEach(a => {
        best[a.main] = Math.max(best[a.main] || 0, S.primaryPoints);
        best[a.also] = Math.max(best[a.also] || 0, S.secondaryPoints);
      });
      Object.keys(best).forEach(k => { if (k in m) m[k] += best[k]; });
    });
    return m;
  })();
  function scoreQuiz(answerIdx) {
    const pts = {}, last = {};
    chars.forEach(c => { pts[c.id] = 0; last[c.id] = -1; });
    answerIdx.forEach((ai, qi) => {
      const a = C.quiz[qi].answers[ai];
      if (!a) return;
      if (a.main in pts) { pts[a.main] += S.primaryPoints; last[a.main] = qi * 2 + 1; }
      if (a.also in pts) { pts[a.also] += S.secondaryPoints; if (last[a.also] < qi * 2) last[a.also] = qi * 2; }
    });
    const ratio = id => (maxPts[id] ? pts[id] / maxPts[id] : 0);
    return chars.map(c => c.id).sort((a, b) => ratio(b) - ratio(a) || pts[b] - pts[a] || last[b] - last[a])[0];
  }
  window.__scoreQuiz = scoreQuiz; // handy for testing in the console

  /* ---------------- Shared bits of markup ---------------- */
  function chipsHTML(c) {
    return `<div class="chips">
      <span class="chip"><b>Element</b>${esc(c.element)}</span>
      <span class="chip"><b>Core trait</b>${esc(c.trait)}</span>
      <span class="chip"><span class="swatch" style="background:${esc(c.colorHex)}"></span>${esc(c.color)}</span>
      <span class="chip"><b>Carries</b>${esc(c.object)}</span>
    </div>`;
  }
  function pairingsHTML(c) {
    return `<h3>Colorful Pairings</h3><div class="pair-grid">${c.pairings.filter(id => byId[id]).map(id => {
      const p = byId[id];
      return `<a class="mini" href="#/c/${p.id}"><img src="${ART(p.id)}" alt=""><span><strong>${esc(p.name)}</strong><small>${esc(p.archetype)}</small></span></a>`;
    }).join("")}</div>`;
  }
  function spotHTML(c) {
    const f = isFound(c.id);
    return `<div class="spot-card">
      <div class="eyebrow">${c.spot.bonus ? "Bonus hunt spot" : "Hunt spot"} ${f ? '<span class="badge found">Found</span>' : ""}</div>
      <h3>${esc(c.spot.name)}</h3>
      <p class="muted">${esc(c.spot.why)}</p>
      <div class="btn-row">
        <a class="btn small" href="#/hunt/${c.id}">Show on map</a>
        ${canAR(c.id) ? `<a class="btn small red" href="#/ar/${c.id}">View in AR</a>` : `<a class="btn small ghost" href="${directions(c)}" target="_blank" rel="noopener">Walking directions</a>`}
      </div>
    </div>`;
  }
  function profileHTML(c, you) {
    return `<section class="profile">
      <div class="art-stage" style="--c:${esc(c.colorHex)}"><img src="${ART(c.id)}" alt="${esc(c.name)}, ${esc(c.archetype)}, by ${esc(S.artist)}"></div>
      <div>
        ${you ? `<div class="youare">You're…</div>` : `<div class="eyebrow">Character ${c.number}</div>`}
        <h1 style="margin-bottom:.1em">${esc(c.name)}</h1>
        <div class="eyebrow" style="font-size:15px">${esc(c.archetype)}</div>
        ${chipsHTML(c)}
        <p>${esc(c.description)}</p>
        <div class="facts" style="--c:${esc(c.colorHex)}">
          ${c.signature ? `<div class="fact"><b>Signature move</b>${esc(c.signature)}</div>` : ""}
          <div class="fact"><b>Power</b>${esc(c.power)}</div>
          <div class="fact"><b>Struggles</b>${esc(c.struggles)}</div>
          <div class="fact"><b>Antidote</b>${esc(c.antidote)}</div>
        </div>
        ${pairingsHTML(c)}
        ${spotHTML(c)}
        ${you ? `<div class="btn-row">
            <a class="btn red" href="#/ar/${c.id}">See ${esc(c.name)} in AR</a>
            <a class="btn" href="#/hunt">Start the hunt</a>
            <a class="btn ghost" href="#/quiz">Retake quiz</a>
          </div>` : `<div class="callout"><b>Which Colorful Character are you?</b> Nine quick questions to find out.<div class="btn-row" style="margin-top:10px"><a class="btn red small" href="#/quiz">Take the quiz</a></div></div>`}
      </div>
    </section>`;
  }

  /* ================= PAGES ================= */

  function pageHome() {
    const r = myResult();
    const order = ["rascal", "flora", "captain", "lorey", "sol", "ocean", "pixie", "sequoia", "flow", "atlas", "rebel", "ash", "compass"];
    const parade = order.map((id, i) => {
      const x = 4 + i * (92 / (order.length - 1));
      const h = [70, 82, 92, 78, 100, 86, 80, 74, 88, 76, 94, 72, 68][i];
      const rot = ((i % 3) - 1) * 4;
      return `<img src="${ART(id)}" alt="" style="--x:${x}%;--h:${h}%;--r:${rot}deg;--d:${(i * .27).toFixed(2)}s;z-index:${i % 2 ? 1 : 2}">`;
    }).join("");
    app.innerHTML = `
      <section class="hero">
        <div class="eyebrow">384 Post · Union Square · a mural by ${esc(S.artist)}</div>
        <h1>Which <em>Colorful Character</em> are you?</h1>
        <p>Every one of us arrives in San Francisco with a distinct story. Find the character who shares yours.</p>
        <div class="btn-row center">
          <a class="btn red" href="#/quiz">${r ? "Retake the quiz" : "Take the quiz"}</a>
          ${r ? `<a class="btn ghost" href="#/result/${r}">I'm ${esc(byId[r].name)} →</a>` : ""}
        </div>
      </section>
      <div class="parade" aria-hidden="true">${parade}</div>
      <section class="cards3">
        <a class="tile" href="#/quiz"><h3>1 · Find yours</h3><p>Nine quick questions match you with one of 13 characters.</p></a>
        <a class="tile" href="#/hunt"><h3>2 · Hunt the city</h3><p>Giant characters are hiding around SF. Get close to unlock them in AR. ${foundCount() ? `<b>${foundCount()} of ${TOTAL} found.</b>` : ""}</p></a>
        <a class="tile" href="#/results"><h3>3 · Who is SF?</h3><p>See which characters the city is made of, live.</p></a>
      </section>
      <section class="statement">
        <p>"Though each of us arrive with a distinct story, our paths have a unique way of intersecting. Together, our stories become a celebration of shared journeys that add to the beauty of San Francisco."</p>
        <p class="sig">— ${esc(S.artist)}</p>
      </section>`;
  }

  let quizAnswers = [];
  function pageQuiz() {
    quizAnswers = [];
    renderQuestion(0);
  }
  function renderQuestion(i) {
    const q = C.quiz[i];
    app.innerHTML = `<section class="quiz">
      <div class="quiz-progress">${C.quiz.map((_, k) => `<span class="${k < i ? "done" : k === i ? "now" : ""}"></span>`).join("")}</div>
      <div class="eyebrow">Question ${i + 1} of ${C.quiz.length}</div>
      ${q.draft ? `<div class="draft-tag">DRAFT QUESTION</div>` : ""}
      <h2>${esc(q.q)}</h2>
      <div class="answers">${q.answers.map((a, k) => `<button class="answer${quizAnswers[i] === k ? " picked" : ""}" data-k="${k}">${esc(a.text)}</button>`).join("")}</div>
      <div class="quiz-nav">
        ${i > 0 ? `<button class="linkish" id="back">← Back</button>` : "<span></span>"}
        <span class="muted">${i === 0 ? "No wrong answers." : ""}</span>
      </div>
    </section>`;
    app.querySelectorAll(".answer").forEach(b => b.addEventListener("click", () => {
      app.querySelectorAll(".answer").forEach(x => (x.disabled = true));
      b.classList.add("picked");
      quizAnswers[i] = +b.dataset.k;
      setTimeout(() => (i + 1 < C.quiz.length ? renderQuestion(i + 1) : finishQuiz()), 260);
    }));
    const back = document.getElementById("back");
    if (back) back.addEventListener("click", () => renderQuestion(i - 1));
  }
  function finishQuiz() {
    app.innerHTML = `<section class="reveal"><div class="spin"></div><h2>Finding your character…</h2></section>`;
    const id = scoreQuiz(quizAnswers);
    store.set("result", id);
    track("quiz_complete", { character: id });
    setTimeout(() => { location.hash = "#/result/" + id; }, 1300);
  }

  function pageResult(id) {
    const c = byId[id]; if (!c) return notFound();
    app.innerHTML = profileHTML(c, true) + shareHTML(c) + `
      <div class="callout blue">
        <b>Your hunt starts with your Colorful Pairings:</b> ${c.pairings.filter(p => byId[p]).map(p => `${esc(byId[p].name)} at ${esc(byId[p].spot.name)}`).join(" and ")}. Find them first, then collect all ${TOTAL}.
      </div>`;
    bindShare(c);
  }

  function pageCharacter(id) {
    const c = byId[id]; if (!c) return notFound();
    app.innerHTML = profileHTML(c, false);
  }

  function pageGallery() {
    const r = myResult();
    app.innerHTML = `<section style="padding-top:28px">
      <div class="eyebrow">The cast</div>
      <h2>Meet all ${TOTAL} Colorful Characters</h2>
      <p class="muted">Each embodies the elemental forces and personalities that shape us.</p>
      <div class="gallery">${chars.map(c => `
        <a class="g-item" href="#/c/${c.id}">
          <div class="pic" style="--c:${esc(c.colorHex)}"><img src="${ART(c.id)}" alt="" loading="lazy"></div>
          <strong>${esc(c.name)}</strong><small>${esc(c.archetype)}</small>
          ${r === c.id ? `<div><span class="badge mine">You</span></div>` : isFound(c.id) ? `<div><span class="badge found">Found</span></div>` : ""}
        </a>`).join("")}</div>
    </section>`;
  }

  /* ---------------- Sharing ----------------
     X, Facebook, LinkedIn, Bluesky: open the platform's own "compose" page with the
     text filled in. The picture comes from the link preview (share/<id>.html → assets/share/<id>.png).
     Instagram & TikTok have no web share links, so on phones we hand the image to the
     phone's share menu (pick Instagram/TikTok) and copy the caption to paste. */
  const SH = C.settings.share || {};
  const ICONS = {
    x: '<path d="M14.234 10.162 22.977 0h-2.072l-7.591 8.824L7.251 0H.258l9.168 13.343L.258 24H2.33l8.016-9.318L16.749 24h6.993zm-2.837 3.299-.929-1.329L3.076 1.56h3.182l5.965 8.532.929 1.329 7.754 11.09h-3.182z"/>',
    facebook: '<path d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036 26.805 26.805 0 0 0-.733-.009c-.707 0-1.259.096-1.675.309a1.686 1.686 0 0 0-.679.622c-.258.42-.374.995-.374 1.752v1.297h3.919l-.386 2.103-.287 1.564h-3.246v8.245C19.396 23.238 24 18.179 24 12.044c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.628 3.874 10.35 9.101 11.647Z"/>',
    instagram: '<path d="M7.0301.084c-1.2768.0602-2.1487.264-2.911.5634-.7888.3075-1.4575.72-2.1228 1.3877-.6652.6677-1.075 1.3368-1.3802 2.127-.2954.7638-.4956 1.6365-.552 2.914-.0564 1.2775-.0689 1.6882-.0626 4.947.0062 3.2586.0206 3.6671.0825 4.9473.061 1.2765.264 2.1482.5635 2.9107.308.7889.72 1.4573 1.388 2.1228.6679.6655 1.3365 1.0743 2.1285 1.38.7632.295 1.6361.4961 2.9134.552 1.2773.056 1.6884.069 4.9462.0627 3.2578-.0062 3.668-.0207 4.9478-.0814 1.28-.0607 2.147-.2652 2.9098-.5633.7889-.3086 1.4578-.72 2.1228-1.3881.665-.6682 1.0745-1.3378 1.3795-2.1284.2957-.7632.4966-1.636.552-2.9124.056-1.2809.0692-1.6898.063-4.948-.0063-3.2583-.021-3.6668-.0817-4.9465-.0607-1.2797-.264-2.1487-.5633-2.9117-.3084-.7889-.72-1.4568-1.3876-2.1228C21.2982 1.33 20.628.9208 19.8378.6165 19.074.321 18.2017.1197 16.9244.0645 15.6471.0093 15.236-.005 11.977.0014 8.718.0076 8.31.0215 7.0301.0839m.1402 21.6932c-1.17-.0509-1.8053-.2453-2.2287-.408-.5606-.216-.96-.4771-1.3819-.895-.422-.4178-.6811-.8186-.9-1.378-.1644-.4234-.3624-1.058-.4171-2.228-.0595-1.2645-.072-1.6442-.079-4.848-.007-3.2037.0053-3.583.0607-4.848.05-1.169.2456-1.805.408-2.2282.216-.5613.4762-.96.895-1.3816.4188-.4217.8184-.6814 1.3783-.9003.423-.1651 1.0575-.3614 2.227-.4171 1.2655-.06 1.6447-.072 4.848-.079 3.2033-.007 3.5835.005 4.8495.0608 1.169.0508 1.8053.2445 2.228.408.5608.216.96.4754 1.3816.895.4217.4194.6816.8176.9005 1.3787.1653.4217.3617 1.056.4169 2.2263.0602 1.2655.0739 1.645.0796 4.848.0058 3.203-.0055 3.5834-.061 4.848-.051 1.17-.245 1.8055-.408 2.2294-.216.5604-.4763.96-.8954 1.3814-.419.4215-.8181.6811-1.3783.9-.4224.1649-1.0577.3617-2.2262.4174-1.2656.0595-1.6448.072-4.8493.079-3.2045.007-3.5825-.006-4.848-.0608M16.953 5.5864A1.44 1.44 0 1 0 18.39 4.144a1.44 1.44 0 0 0-1.437 1.4424M5.8385 12.012c.0067 3.4032 2.7706 6.1557 6.173 6.1493 3.4026-.0065 6.157-2.7701 6.1506-6.1733-.0065-3.4032-2.771-6.1565-6.174-6.1498-3.403.0067-6.156 2.771-6.1496 6.1738M8 12.0077a4 4 0 1 1 4.008 3.9921A3.9996 3.9996 0 0 1 8 12.0077"/>',
    tiktok: '<path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>',
    bluesky: '<path d="M5.202 2.857C7.954 4.922 10.913 9.11 12 11.358c1.087-2.247 4.046-6.436 6.798-8.501C20.783 1.366 24 .213 24 3.883c0 .732-.42 6.156-.667 7.037-.856 3.061-3.978 3.842-6.755 3.37 4.854.826 6.089 3.562 3.422 6.299-5.065 5.196-7.28-1.304-7.847-2.97-.104-.305-.152-.448-.153-.327 0-.121-.05.022-.153.327-.568 1.666-2.782 8.166-7.847 2.97-2.667-2.737-1.432-5.473 3.422-6.3-2.777.473-5.899-.308-6.755-3.369C.42 10.04 0 4.615 0 3.883c0-3.67 3.217-2.517 5.202-1.026"/>',
    linkedin: '<rect x="1.5" y="1.5" width="21" height="21" rx="3.5"/><g fill="#1B1A17"><circle cx="7.1" cy="7.1" r="1.7"/><rect x="5.6" y="9.6" width="3" height="9"/><path d="M10.6 9.6h2.9v1.3c.5-.9 1.6-1.5 3-1.5 2.4 0 3.4 1.5 3.4 4.1v5.1h-3v-4.6c0-1.3-.4-2-1.5-2s-1.8.8-1.8 2v4.6h-3z"/></g>'
  };
  const PLATFORMS = [
    ["x", "X"], ["facebook", "Facebook"], ["instagram", "Instagram"],
    ["tiktok", "TikTok"], ["bluesky", "Bluesky"], ["linkedin", "LinkedIn"]
  ];
  function fillText(tpl, c) {
    return String(tpl || "").replace(/\{(\w+)\}/g, (m, k) =>
      ({ name: c.name, archetype: c.archetype, element: c.element, trait: c.trait, artist: S.artist }[k] ?? m));
  }
  const tagLine = () => (SH.hashtags || []).map(t => "#" + t).join(" ");
  function shareUrl(c, platform) {
    return (S.siteUrl || location.href.split("#")[0]) + `share/${c.id}.html?utm_source=${platform}`;
  }
  function shareHTML(c) {
    return `<div class="share-block">
      <div class="share-label">Share your result</div>
      <div class="share-row">${PLATFORMS.map(([k, label]) =>
        `<button class="sbtn" data-share="${k}" aria-label="Share on ${label}" title="${label}"><svg viewBox="0 0 24 24" aria-hidden="true">${ICONS[k]}</svg></button>`).join("")}</div>
      <p class="share-hint">Instagram &amp; TikTok: pick the app in your phone's share menu, then paste — we copy the caption for you.
        <button class="linkish" data-share="download">Download image</button></p>
      <a class="btn orange results-pill" href="#/results">See all results</a>
    </div>`;
  }

  // Images are drawn as soon as the result page opens, so the share menu can open
  // instantly on tap (phones block share menus that open after a delay).
  const shareImgCache = {};
  function loadImg(src) {
    return new Promise((res, rej) => { const im = new Image(); im.onload = () => res(im); im.onerror = rej; im.src = src; });
  }
  function wrapLines(g, text, maxW) {
    const words = text.split(" "), lines = []; let line = "";
    words.forEach(w => { const t = line ? line + " " + w : w; if (g.measureText(t).width > maxW && line) { lines.push(line); line = w; } else line = t; });
    if (line) lines.push(line); return lines;
  }
  async function makeStoryImage(c) {
    if (shareImgCache[c.id]) return shareImgCache[c.id];
    const W = 1080, H = 1920, cv = document.createElement("canvas");
    cv.width = W; cv.height = H;
    const g = cv.getContext("2d");
    try { await document.fonts.load("800 120px 'Bricolage Grotesque'"); await document.fonts.load("700 40px 'Source Sans 3'"); } catch (e) {}
    const im = await loadImg(ART_PNG(c.id));
    g.fillStyle = "#FBF7EA"; g.fillRect(0, 0, W, H);
    g.fillStyle = "#1B1A17"; g.textAlign = "center";
    g.font = "700 34px 'Source Sans 3', sans-serif";
    g.fillText("WHICH COLORFUL CHARACTER ARE YOU?", W / 2, 150);
    g.fillStyle = c.colorHex; g.strokeStyle = "#1B1A17"; g.lineWidth = 9;
    g.beginPath(); (g.roundRect ? g.roundRect(80, 210, W - 160, 1000, 70) : g.rect(80, 210, W - 160, 1000)); g.fill(); g.stroke();
    g.fillStyle = "rgba(251,247,234,.55)"; g.beginPath(); g.ellipse(W / 2, 710, 360, 360, 0, 0, Math.PI * 2); g.fill();
    const sc = Math.min(780 / im.width, 880 / im.height);
    g.drawImage(im, (W - im.width * sc) / 2, 270 + (880 - im.height * sc) / 2, im.width * sc, im.height * sc);
    g.fillStyle = "#1B1A17";
    g.font = "700 50px 'Bricolage Grotesque', sans-serif"; g.fillText("I'm", W / 2, 1320);
    g.font = "800 170px 'Bricolage Grotesque', sans-serif"; g.fillText(c.name, W / 2, 1480);
    g.fillStyle = "#5E5A50"; g.font = "700 42px 'Source Sans 3', sans-serif";
    g.fillText(c.archetype.toUpperCase(), W / 2, 1555);
    g.font = "600 36px 'Source Sans 3', sans-serif";
    g.fillText(`${c.element} · ${c.trait} · carries a ${c.object.toLowerCase()}`, W / 2, 1610);
    g.fillStyle = "#1B1A17"; g.font = "800 58px 'Bricolage Grotesque', sans-serif";
    g.fillText(SH.imageHashtag || "#384Post", W / 2, 1745);
    g.font = "600 32px 'Source Sans 3', sans-serif"; g.fillStyle = "#5E5A50";
    g.fillText(`384 Post · Union Square · mural by ${S.artist}`, W / 2, 1800);
    const blob = await new Promise((res, rej) => cv.toBlob(b => (b ? res(b) : rej(new Error("no image"))), "image/png"));
    shareImgCache[c.id] = blob;
    return blob;
  }
  function downloadBlob(blob, name) {
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = name;
    document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
  }
  function bindShare(c) {
    makeStoryImage(c).catch(e => console.warn("share image", e));
    app.querySelectorAll("[data-share]").forEach(b => b.addEventListener("click", () => shareTo(b.dataset.share, c)));
  }
  function shareTo(platform, c) {
    const long = fillText(SH.text, c), short = fillText(SH.shortText || SH.text, c), tags = tagLine();
    const url = shareUrl(c, platform);
    const enc = encodeURIComponent;
    const open = u => window.open(u, "_blank", "noopener");
    track("share_result", { character: c.id, platform });
    switch (platform) {
      case "x":
        return open(`https://x.com/intent/post?text=${enc(short + " " + tags)}&url=${enc(url)}`);
      case "facebook": // Facebook doesn't allow pre-filled post text; the link preview carries the image + title
        try { navigator.clipboard.writeText(long + " " + tags); toast("Caption copied — paste it into your post"); } catch (e) {}
        return open(`https://www.facebook.com/sharer/sharer.php?u=${enc(url)}&hashtag=${enc("#" + ((SH.hashtags || [])[0] || "384Post"))}`);
      case "linkedin":
        return open(`https://www.linkedin.com/feed/?shareActive=true&text=${enc(long + " " + tags + " " + url)}`);
      case "bluesky":
        return open(`https://bsky.app/intent/compose?text=${enc(short + " " + tags + " " + url)}`);
      case "instagram":
      case "tiktok":
      case "download":
        return shareImageToApp(platform, c, long + " " + tags + " " + (S.siteUrl || ""));
    }
  }
  function shareImageToApp(platform, c, caption) {
    const blob = shareImgCache[c.id];
    if (!blob) { toast("One sec — still drawing your image. Tap again!"); makeStoryImage(c).catch(() => {}); return; }
    const name = `384post-${c.id}.png`;
    const file = new File([blob], name, { type: "image/png" });
    const appName = platform === "tiktok" ? "TikTok" : "Instagram";
    let copied = false;
    try { navigator.clipboard.writeText(caption).then(() => (copied = true)).catch(() => {}); } catch (e) {}
    if (platform !== "download" && navigator.canShare && navigator.canShare({ files: [file] })) {
      toast(`Caption copied — choose ${appName}, then paste it`);
      navigator.share({ files: [file] }).catch(() => {});
      return;
    }
    downloadBlob(blob, name);
    if (platform === "download") { toast("Image saved"); return; }
    openModal(`
      <div class="eyebrow">Share on ${appName}</div>
      <h3>Your image is downloading</h3>
      <p>${appName} only lets you post from its app. Send the image to your phone, open ${appName}, and post it${platform === "instagram" ? " to your feed or story" : ""}.</p>
      <p class="muted">Caption to paste:</p>
      <textarea class="caption-box" readonly rows="5">${esc(caption)}</textarea>
      <div class="btn-row center" style="margin-top:12px"><button class="btn small" id="copyCap">Copy caption</button><button class="btn small ghost" data-close>Done</button></div>`);
    const cb = document.getElementById("copyCap");
    if (cb) cb.addEventListener("click", () => navigator.clipboard.writeText(caption).then(() => toast("Caption copied")).catch(() => {
      const ta = modalCard.querySelector(".caption-box"); ta.select(); toast("Press copy on your keyboard");
    }));
  }

  /* ---------------- Map ----------------
     Uses Mapbox when settings.mapboxToken is set; otherwise basic OpenStreetMap tiles (emergency/testing only).
     One map is created per visit and reused when people come back to the Hunt page,
     so each visitor counts as a single Mapbox "map load" (the thing Mapbox bills for). */
  const MAPBOX_VERSION = "3.32.0";
  const mapHost = document.createElement("div");
  mapHost.className = "map-host";
  let mapView = null, mapViewPromise = null;
  const coreSpots = () => chars.filter(c => !c.spot.bonus);
  function loadMapbox() {
    if (window.mapboxgl) return Promise.resolve(true);
    return new Promise(res => {
      const css = document.createElement("link"); css.rel = "stylesheet";
      css.href = `https://api.mapbox.com/mapbox-gl-js/v${MAPBOX_VERSION}/mapbox-gl.css`;
      document.head.appendChild(css);
      const js = document.createElement("script");
      js.src = `https://api.mapbox.com/mapbox-gl-js/v${MAPBOX_VERSION}/mapbox-gl.js`;
      js.onload = () => res(!!window.mapboxgl); js.onerror = () => res(false);
      document.head.appendChild(js);
    });
  }
  function getMapView() {
    if (mapView) return Promise.resolve(mapView);
    if (!mapViewPromise) {
      mapViewPromise = (S.mapboxToken ? loadMapbox() : Promise.resolve(false)).then(ok => {
        try { mapView = ok ? makeMapbox() : makeLeaflet(); }
        catch (e) { console.warn("map", e); mapView = window.L ? makeLeaflet() : null; }
        return mapView;
      });
    }
    return mapViewPromise;
  }
  function makeLeaflet() {
    if (!window.L) return null;
    const m = L.map(mapHost, { scrollWheelZoom: false, zoomControl: true });
    // Emergency/testing fallback only: OpenStreetMap's volunteer-run tiles aren't meant for heavy traffic.
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(m);
    const markers = {}; let me = null;
    const icon = c => L.divIcon({ className: "", html: pinHTML(c), iconSize: [52, 52], iconAnchor: [26, 26], popupAnchor: [0, -24] });
    return {
      pins() {
        chars.forEach(c => {
          if (markers[c.id]) { markers[c.id].setIcon(icon(c)); markers[c.id].setPopupContent(popupHTML(c)); }
          else markers[c.id] = L.marker([c.spot.lat, c.spot.lng], { icon: icon(c), title: c.name, keyboard: true }).addTo(m).bindPopup(popupHTML(c));
        });
      },
      focus(c, open) { m.setView([c.spot.lat, c.spot.lng], 16); if (open) setTimeout(() => markers[c.id] && markers[c.id].openPopup(), 300); },
      fitCore() { m.fitBounds(coreSpots().map(c => [c.spot.lat, c.spot.lng]), { padding: [30, 30] }); },
      setMe(p) {
        if (!me) me = L.marker([p.lat, p.lng], { icon: L.divIcon({ className: "", html: '<div class="me-dot"></div>', iconSize: [18, 18], iconAnchor: [9, 9] }), zIndexOffset: 1000 }).addTo(m);
        else me.setLatLng([p.lat, p.lng]);
      },
      center(p) { m.setView([p.lat, p.lng], 16); },
      resize() { m.invalidateSize(); }
    };
  }
  function makeMapbox() {
    mapboxgl.accessToken = S.mapboxToken;
    const m = new mapboxgl.Map({
      container: mapHost, style: S.mapboxStyle || "mapbox://styles/mapbox/light-v11",
      center: [-122.405, 37.792], zoom: 13, cooperativeGestures: true
    });
    m.addControl(new mapboxgl.NavigationControl({ showCompass: false }), "top-left");
    const markers = {}; let me = null;
    const bounds = () => { const b = new mapboxgl.LngLatBounds(); coreSpots().forEach(c => b.extend([c.spot.lng, c.spot.lat])); return b; };
    return {
      pins() {
        chars.forEach(c => {
          if (markers[c.id]) { markers[c.id].getElement().innerHTML = pinHTML(c); markers[c.id].getPopup().setHTML(popupHTML(c)); return; }
          const el = document.createElement("div");
          el.innerHTML = pinHTML(c); el.style.cursor = "pointer"; el.setAttribute("aria-label", c.name); el.setAttribute("role", "button");
          markers[c.id] = new mapboxgl.Marker({ element: el })
            .setLngLat([c.spot.lng, c.spot.lat])
            .setPopup(new mapboxgl.Popup({ offset: 28, maxWidth: "260px" }).setHTML(popupHTML(c)))
            .addTo(m);
        });
      },
      focus(c, open) {
        m.jumpTo({ center: [c.spot.lng, c.spot.lat], zoom: 15.5 });
        const mk = markers[c.id];
        if (open && mk && !mk.getPopup().isOpen()) mk.togglePopup();
      },
      fitCore() { m.fitBounds(bounds(), { padding: 40, duration: 0 }); },
      setMe(p) {
        if (!me) { const el = document.createElement("div"); el.className = "me-dot"; me = new mapboxgl.Marker({ element: el }).setLngLat([p.lng, p.lat]).addTo(m); }
        else me.setLngLat([p.lng, p.lat]);
      },
      center(p) { m.jumpTo({ center: [p.lng, p.lat], zoom: 15.5 }); },
      resize() { m.resize(); }
    };
  }

  /* ---------------- Hunt ---------------- */
  let watchId = null, mePos = null;
  function cleanupHunt() {
    if (watchId != null && navigator.geolocation) navigator.geolocation.clearWatch(watchId);
    watchId = null;
    if (mapHost.parentNode) mapHost.parentNode.removeChild(mapHost); // keep the map alive for next time
  }

  function pageHunt(focusId) {
    const r = myResult();
    const n = foundCount();
    app.innerHTML = `
      <section class="hunt-head">
        <div>
          <div class="eyebrow">The Colorful Character Hunt</div>
          <h2>Giants are hiding around San Francisco</h2>
          <p class="muted">Walk within about ${Math.round(S.unlockRadiusMeters * 3.28 / 10) * 10} feet of a spot to unlock its character — then see them towering up to 30 feet tall in AR. Find all ${TOTAL} for a secret message from ${esc(S.artist)}.</p>
        </div>
        <div>
          <div class="counter" id="counter">${n}<small> / ${TOTAL} found</small></div>
          <div class="meter"><i id="meter" style="width:${(n / TOTAL) * 100}%"></i></div>
          <div class="btn-row" style="margin-top:12px">
            <button class="btn green" id="locBtn">Start finding</button>
            ${n === TOTAL ? `<a class="btn red" href="#/secret">Secret unlocked ✦</a>` : ""}
          </div>
          <div class="loc-status" id="locStatus">Location is off. Your position never leaves your phone.</div>
        </div>
      </section>
      ${r ? `<div class="callout"><b>You're ${esc(byId[r].name)}.</b> Start with your pairings, marked with a red ring: ${byId[r].pairings.filter(p => byId[p]).map(p => esc(byId[p].name)).join(" & ")}.</div>` : `<div class="callout"><a href="#/quiz"><b>Take the quiz</b></a> first to get a personal starting route.</div>`}
      ${isTest() ? testToolsHTML() : ""}
      <div id="map" role="application" aria-label="Map of hunt locations"></div>
      <div class="hunt-list" id="huntList"></div>
      <p class="center" style="margin-top:26px">
        <button class="btn ghost small" id="saveBtn">Save my progress</button><br>
        <span class="muted" style="font-size:14px">Progress is saved in this browser. Switching phones or apps? Save a link to bring it with you.</span>
      </p>`;

    renderHuntList();
    initMap(focusId);
    document.getElementById("locBtn").addEventListener("click", startLocation);
    document.getElementById("saveBtn").addEventListener("click", saveProgress);
    if (isTest()) bindTestTools();
    if (store.get("locOn") && !isTest()) startLocation();
  }

  function pinHTML(c) {
    const f = isFound(c.id), mine = myResult() && byId[myResult()].pairings.includes(c.id) && !f;
    return `<div class="pin ${f ? "" : "locked"} ${mine ? "mine" : ""}" style="--c:${esc(c.colorHex)};position:relative">
      <img src="${ART(c.id)}" alt="">${c.spot.bonus ? '<span class="star">★</span>' : ""}</div>`;
  }
  function popupHTML(c) {
    const f = isFound(c.id);
    return `<h4>${esc(c.name)} ${f ? '<span class="badge found">Found</span>' : ""}</h4>
      <div><b>${esc(c.spot.name)}</b>${c.spot.bonus ? ' <span class="badge">Bonus</span>' : ""}</div>
      <div class="muted" style="margin:4px 0 8px">${esc(c.spot.why)}</div>
      ${canAR(c.id) ? `<a class="btn small red" href="#/ar/${c.id}">View in AR</a>` : `<a href="${directions(c)}" target="_blank" rel="noopener">Walking directions →</a>`}`;
  }
  function initMap(focusId) {
    const holder = document.getElementById("map");
    holder.appendChild(mapHost);
    getMapView().then(v => {
      if (!mapHost.isConnected) return;
      if (!v) { holder.innerHTML = '<p style="padding:20px">Map couldn\'t load — check your connection.</p>'; return; }
      v.resize(); v.pins();
      if (focusId && byId[focusId]) v.focus(byId[focusId], true); else v.fitCore();
      if (mePos) v.setMe(mePos);
    });
  }
  function refreshPins() { if (mapView) mapView.pins(); }
  function renderHuntList() {
    const el = document.getElementById("huntList"); if (!el) return;
    const r = myResult(), mine = r ? byId[r].pairings : [];
    const list = chars.slice().sort((a, b) =>
      (isFound(a.id) - isFound(b.id)) || (mine.includes(b.id) - mine.includes(a.id)) || (a.spot.bonus - b.spot.bonus) ||
      (mePos ? distanceM(mePos, a.spot) - distanceM(mePos, b.spot) : a.number - b.number));
    el.innerHTML = list.map(c => {
      const f = isFound(c.id);
      return `<div class="h-card ${f ? "" : "locked"}">
        <div class="pic" style="--c:${esc(c.colorHex)}"><img src="${ART(c.id)}" alt=""></div>
        <div>
          <h4>${esc(c.name)}${f ? '<span class="badge found">Found</span>' : ""}${mine.includes(c.id) && !f ? '<span class="badge mine">Pairing</span>' : ""}${c.spot.bonus ? '<span class="badge">Bonus</span>' : ""}</h4>
          <div class="meta">${esc(c.spot.name)}${mePos ? " · " + fmtDist(distanceM(mePos, c.spot)) : ""}</div>
          <div class="acts">
            <a class="btn ghost" href="#/hunt/${c.id}" data-focus="${c.id}">Map</a>
            ${canAR(c.id) ? `<a class="btn red" href="#/ar/${c.id}">AR</a><a class="btn ghost" href="#/c/${c.id}">Story</a>` : `<a class="btn ghost" href="${directions(c)}" target="_blank" rel="noopener">Directions</a>`}
            ${isTest() && !f ? `<button class="btn" data-teleport="${c.id}">Teleport</button>` : ""}
          </div>
        </div>
      </div>`;
    }).join("");
    el.querySelectorAll("[data-focus]").forEach(a => a.addEventListener("click", e => {
      if (!mapView) return; e.preventDefault();
      mapView.focus(byId[a.dataset.focus], true);
      document.getElementById("map").scrollIntoView({ behavior: "smooth", block: "center" });
    }));
    el.querySelectorAll("[data-teleport]").forEach(b => b.addEventListener("click", () => teleport(b.dataset.teleport)));
  }
  function updateCounter() {
    const n = foundCount();
    const ce = document.getElementById("counter"), me = document.getElementById("meter");
    if (ce) ce.innerHTML = `${n}<small> / ${TOTAL} found</small>`;
    if (me) me.style.width = (n / TOTAL) * 100 + "%";
  }

  function startLocation() {
    const st = document.getElementById("locStatus"), btn = document.getElementById("locBtn");
    if (!navigator.geolocation) { if (st) st.textContent = "This browser can't share location."; return; }
    if (st) st.textContent = "Asking for your location…";
    watchId = navigator.geolocation.watchPosition(p => {
      store.set("locOn", true);
      onPosition({ lat: p.coords.latitude, lng: p.coords.longitude, acc: p.coords.accuracy });
      const s2 = document.getElementById("locStatus");
      if (s2) { s2.className = "loc-status on"; s2.textContent = `Finding characters near you (±${Math.round(p.coords.accuracy)} m)`; }
      const b2 = document.getElementById("locBtn"); if (b2) { b2.textContent = "Location on"; b2.disabled = true; }
    }, err => {
      store.del("locOn");
      const s2 = document.getElementById("locStatus");
      if (s2) s2.textContent = err.code === 1
        ? "Location is blocked. Allow it for this site in your browser settings, then try again."
        : "Couldn't get your location yet — try stepping outside.";
    }, { enableHighAccuracy: true, maximumAge: 5000, timeout: 20000 });
    if (btn) btn.textContent = "Starting…";
  }
  function drawMe() { if (mapView && mePos) mapView.setMe(mePos); }

  function onPosition(pos) {
    mePos = pos; drawMe();
    const slack = Math.min(pos.acc || 0, 40); // forgive a little GPS wobble
    let newly = [];
    chars.forEach(c => {
      if (!isFound(c.id) && distanceM(pos, c.spot) <= S.unlockRadiusMeters + slack) newly.push(c);
    });
    newly.forEach(markFound);
    renderHuntList();
  }
  function markFound(c) {
    const f = getFound(); if (f[c.id]) return;
    f[c.id] = Date.now(); store.set(foundKey(), f);
    track("character_found", { character: c.id });
    refreshPins(); updateCounter();
    const n = foundCount();
    openModal(`
      <div class="eyebrow">You found a Colorful Character!</div>
      <div class="art-stage" style="--c:${esc(c.colorHex)}"><img src="${ART(c.id)}" alt=""></div>
      <h2>${esc(c.name)}</h2>
      <p><b>${esc(c.archetype)}</b> · ${esc(c.spot.name)}</p>
      <p class="muted">${n} of ${TOTAL} found</p>
      <div class="btn-row center">
        <a class="btn red" href="#/ar/${c.id}/giant">See ${esc(c.name)} in giant AR</a>
        <a class="btn ghost" href="#/c/${c.id}">Their story</a>
      </div>
      <p style="margin:16px 0 0"><button class="linkish" data-close>Keep hunting</button></p>`);
    confetti();
    if (n === TOTAL) {
      track("hunt_complete", {});
      openModal(`
        <div class="eyebrow">All ${TOTAL} found</div>
        <h2>You collected every Colorful Character!</h2>
        <p>${esc(S.artist)} left something for you.</p>
        <div class="btn-row center"><a class="btn red" href="#/secret">Open the secret ✦</a></div>`);
    }
  }

  /* ---------------- Save / restore progress ---------------- */
  function progressCode() {
    let bits = 0;
    chars.forEach((c, i) => { if (store.get("found", {})[c.id]) bits |= 1 << i; });
    const r = myResult();
    return bits.toString(36) + "-" + (r ? String.fromCharCode(97 + byId[r].index) : "x");
  }
  async function saveProgress() {
    if (isTest()) { toast("Turn off test mode to save real progress."); return; }
    const url = location.href.split("#")[0] + "#/restore/" + progressCode();
    try {
      if (navigator.share) { await navigator.share({ title: "My 384 Post character hunt", text: "My Colorful Character hunt progress:", url }); return; }
    } catch (e) { if (e.name === "AbortError") return; }
    try { await navigator.clipboard.writeText(url); toast("Link copied — text it to yourself!"); }
    catch (e) { openModal(`<h3>Your progress link</h3><p style="word-break:break-all">${esc(url)}</p><button class="btn small" data-close>Done</button>`); }
  }
  function pageRestore(code) {
    const [b, r] = code.split("-");
    const bits = parseInt(b, 36) || 0;
    const f = store.get("found", {});
    let added = 0;
    chars.forEach((c, i) => { if ((bits & (1 << i)) && !f[c.id]) { f[c.id] = Date.now(); added++; } });
    store.set("found", f);
    if (r && r !== "x") { const c = chars[r.charCodeAt(0) - 97]; if (c && !myResult()) store.set("result", c.id); }
    toast(added ? `Restored ${added} character${added > 1 ? "s" : ""}!` : "Progress is up to date.");
    location.replace("#/hunt");
  }

  /* ---------------- Test mode ---------------- */
  function testToolsHTML() {
    return `<div class="test-tools">
      <b>Test tools</b> <span class="muted">(only visible in test mode; test progress is separate from real progress and isn't sent to analytics)</span>
      <div class="btn-row" style="margin-top:10px">
        <button class="btn small" id="tUnion">Teleport to 384 Post</button>
        <button class="btn small" id="tAll">Unlock all</button>
        <button class="btn small ghost" id="tReset">Reset test progress</button>
        <button class="btn small ghost" id="tQuiz">Clear quiz result</button>
      </div>
    </div>`;
  }
  function bindTestTools() {
    document.getElementById("tUnion").onclick = () => teleport("sol");
    document.getElementById("tAll").onclick = () => {
      const f = {}; chars.forEach(c => (f[c.id] = Date.now())); store.set("testFound", f);
      route(); toast("All unlocked (test)"); confetti();
    };
    document.getElementById("tReset").onclick = () => { store.set("testFound", {}); route(); toast("Test progress reset"); };
    document.getElementById("tQuiz").onclick = () => { store.del("result"); route(); toast("Quiz result cleared"); };
  }
  function teleport(id) {
    const c = byId[id]; if (!c) return;
    // land a few meters off the exact spot, like real GPS would
    const pos = { lat: c.spot.lat + 0.0002, lng: c.spot.lng - 0.0002, acc: 8 };
    if (mapView) mapView.center(pos);
    onPosition(pos);
  }
  function pageToggleTest() {
    const on = !isTest(); store.set("test", on);
    document.getElementById("testBanner").hidden = !on;
    toast(on ? "Test mode ON — use Teleport on the hunt page" : "Test mode OFF");
    location.replace("#/hunt");
  }

  /* ---------------- AR view ---------------- */
  function loadModelViewer() {
    if (window.customElements && customElements.get("model-viewer")) return Promise.resolve(true);
    return new Promise(res => {
      const s = document.createElement("script"); s.type = "module"; s.src = MODEL_VIEWER;
      s.onload = () => res(true); s.onerror = () => res(false); document.head.appendChild(s);
    });
  }
  function pageAR(id, size) {
    const giant = size === "giant";
    const c = byId[id]; if (!c) return notFound();
    if (!canAR(id)) {
      app.innerHTML = `<section class="ar-wrap center">
        <div class="art-stage" style="max-width:420px;margin:0 auto 20px;--c:var(--paper-2)"><img class="locked-art" src="${ART(c.id)}" alt="A locked character"></div>
        <h2>Not found yet</h2>
        <p>Head to <b>${esc(c.spot.name)}</b> to unlock this character in AR.</p>
        <div class="btn-row center"><a class="btn green" href="${directions(c)}" target="_blank" rel="noopener">Walking directions</a><a class="btn ghost" href="#/hunt">Back to the hunt</a></div>
      </section>`;
      return;
    }
    app.innerHTML = `<section class="ar-wrap">
      <div class="eyebrow">${esc(c.archetype)} · ${esc(c.spot.name)}</div>
      <h2>${esc(c.name)}, ${giant ? "giant" : "life-size"}</h2>
      <div class="size-toggle" role="group" aria-label="Size">
        <a href="#/ar/${c.id}" class="${giant ? "" : "on"}">Life-size <small>~6 ft</small></a>
        <a href="#/ar/${c.id}/giant" class="${giant ? "on" : ""}">Giant <small>~${c.spot.giantFeet} ft</small></a>
      </div>
      <div style="position:relative">
        <model-viewer id="mv" src="${MODEL(c.id, giant)}" alt="${esc(c.name)} by ${esc(S.artist)}"
          ar ar-modes="webxr scene-viewer quick-look" ar-scale="fixed" ar-placement="floor"
          camera-controls touch-action="pan-y" interaction-prompt="none"
          camera-orbit="0deg 85deg auto" field-of-view="30deg" shadow-intensity="0.6" shadow-softness="1" exposure="1.1" tone-mapping="neutral">
          <button slot="ar-button" class="btn red ar-btn">See ${esc(c.name)} in your space</button>
        </model-viewer>
      </div>
      <p class="muted" style="margin-top:14px">${giant ? `Giant-size, about ${c.spot.giantFeet} feet tall here: after you tap the button, aim at the ground, then walk back about ${c.spot.giantFeet} feet to fit them on screen.` : "Life-size, about as tall as you: after you tap the button, aim at the ground and stand next to them for a photo."} Snap a photo and tag <b>${esc(S.hashtag)}</b>! On a computer, drag to spin them around.</p>
      <div class="btn-row"><a class="btn ghost small" href="#/c/${c.id}">Read ${esc(c.name)}'s story</a><a class="btn ghost small" href="#/hunt">Back to the hunt</a></div>
    </section>`;
    loadModelViewer().then(ok => {
      if (!ok) { const mv = document.getElementById("mv"); if (mv) mv.outerHTML = `<div class="art-stage" style="--c:${esc(c.colorHex)}"><img src="${ART(c.id)}" alt=""></div><p class="muted">The 3D viewer couldn't load on this connection.</p>`; return; }
      const mv = document.getElementById("mv");
      if (mv) mv.addEventListener("ar-status", e => { if (e.detail.status === "session-started") track("ar_open", { character: c.id, size: giant ? "giant" : "life" }); });
    });
  }

  /* ---------------- Results (popularity cloud) ---------------- */
  const SAMPLE = { source: "sample", counts: { sol: 412, rebel: 287, captain: 198, sequoia: 164, rascal: 356, ocean: 241, atlas: 133, compass: 97, flora: 221, lorey: 309, pixie: 176, flow: 268, ash: 118 } };
  let cloudItems = null, resizeTimer;
  async function pageResults() {
    app.innerHTML = `<section style="padding-top:28px" class="center">
      <div class="eyebrow">Who is San Francisco?</div>
      <h2>The city, by character</h2>
      <p class="muted" id="resMeta">Loading…</p>
      <div class="cloud" id="cloud"></div>
    </section>
    <section style="max-width:640px;margin:0 auto"><ol class="rank" id="rank"></ol></section>
    <p class="center" style="margin-top:28px"><a class="btn red" href="#/quiz">${myResult() ? "Retake the quiz" : "Add yourself — take the quiz"}</a></p>`;
    let data;
    try {
      const r = await fetch(S.resultsDataUrl + "?t=" + Date.now(), { cache: "no-store" });
      if (!r.ok) throw new Error(r.status);
      data = await r.json();
    } catch (e) { data = SAMPLE; }
    const counts = data.counts || {};
    const total = chars.reduce((s, c) => s + (counts[c.id] || 0), 0) || 1;
    const imgs = await Promise.all(chars.map(c => loadImg(ART_PNG(c.id)).catch(() => null)));
    cloudItems = chars.map((c, i) => ({ c, count: counts[c.id] || 0, pct: (counts[c.id] || 0) / total, aspect: imgs[i] ? imgs[i].naturalWidth / imgs[i].naturalHeight : .7 }))
      .sort((a, b) => b.count - a.count);
    const meta = document.getElementById("resMeta"); if (!meta) return;
    meta.innerHTML = data.source === "sample"
      ? `<span class="sample-note">Sample numbers for the concept — real counts appear once analytics is connected.</span>`
      : `${total.toLocaleString()} people have found their character${data.updated ? ` · updated ${new Date(data.updated).toLocaleString([], { dateStyle: "medium", timeStyle: "short" })}` : ""}`;
    drawCloud();
    const me = myResult();
    document.getElementById("rank").innerHTML = cloudItems.map((it, i) => `
      <li><span>${i + 1}</span><a href="#/c/${it.c.id}">${esc(it.c.name)}${it.c.id === me ? ' <span class="badge mine">You</span>' : ""}</a>
      <span class="bar" style="--c:${esc(it.c.colorHex)}"><i style="width:${(it.count / cloudItems[0].count) * 100}%"></i></span>
      <span class="muted">${Math.round(it.pct * 100)}%</span></li>`).join("");
  }
  function drawCloud() {
    const el = document.getElementById("cloud"); if (!el || !cloudItems) return;
    const W = el.clientWidth || 360, base = Math.min(W, 760);
    const maxCount = Math.max(1, cloudItems[0].count);
    const maxH = base * .46, minH = base * .15, LBL = 22, pad = 6;
    const boxes = cloudItems.map(it => {
      const ih = minH + (maxH - minH) * Math.sqrt(it.count / maxCount);
      return { it, ih, w: Math.max(ih * it.aspect, 70), h: ih + LBL };
    });
    const placed = [];
    const hit = (b, x, y) => placed.some(p => x < p.x + p.w + pad && x + b.w + pad > p.x && y < p.y + p.h + pad && y + b.h + pad > p.y);
    const stretch = W > 600 ? 1.5 : 1.05;
    boxes.forEach((b, i) => {
      if (!i) { b.x = -b.w / 2; b.y = -b.h / 2; placed.push(b); return; }
      for (let t = 0; t < 900; t += .12) {
        const r = 3 * t, x = r * Math.cos(t) * stretch - b.w / 2, y = r * Math.sin(t) - b.h / 2;
        if (!hit(b, x, y)) { b.x = x; b.y = y; placed.push(b); return; }
      }
      b.x = 0; b.y = 0; placed.push(b);
    });
    const minX = Math.min(...placed.map(p => p.x)), maxX = Math.max(...placed.map(p => p.x + p.w));
    const minY = Math.min(...placed.map(p => p.y)), maxY = Math.max(...placed.map(p => p.y + p.h));
    const sc = Math.min(1, W / (maxX - minX));
    const offX = (W - (maxX - minX) * sc) / 2;
    el.style.height = (maxY - minY) * sc + "px";
    const me = myResult();
    el.innerHTML = placed.map((b, i) => `
      <a href="#/c/${b.it.c.id}" class="${b.it.c.id === me ? "you" : ""}" style="left:${offX + (b.x - minX) * sc}px;top:${(b.y - minY) * sc}px;width:${b.w * sc}px">
        <img src="${ART(b.it.c.id)}" alt="" style="--d:${(i * .06).toFixed(2)}s;height:${b.ih * sc}px;width:auto;margin:0 auto">
        <div class="lbl" style="font-size:${Math.max(11, Math.min(18, 10 + b.ih * sc / 22))}px">${esc(b.it.c.name)} <span>${Math.round(b.it.pct * 100)}%</span></div>
      </a>`).join("");
  }
  window.addEventListener("resize", () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(drawCloud, 200); });

  /* ---------------- Secret ---------------- */
  function pageSecret() {
    const n = foundCount();
    if (n < TOTAL && !isTest()) {
      app.innerHTML = `<section class="secret">
        <div class="eyebrow">Secret</div><h2>Locked</h2>
        <p>You've found <b>${n} of ${TOTAL}</b> characters. Find them all to unlock a message from ${esc(S.artist)}.</p>
        <a class="btn green" href="#/hunt">Keep hunting</a></section>`;
      return;
    }
    const v = S.secretVideoUrl;
    app.innerHTML = `<section class="secret">
      <div class="eyebrow">All ${TOTAL} found</div>
      <h1>You found every Colorful Character</h1>
      <p>A thank-you from ${esc(S.artist)}.</p>
      <div class="video">${v
        ? `<iframe src="${esc(v)}" title="A message from ${esc(S.artist)}" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe>`
        : `<div class="ph"><div><h3>demit's video goes here</h3><p>Add the unlisted video link as <code>secretVideoUrl</code> in data/config.js.</p></div></div>`}</div>
      <div class="btn-row center"><a class="btn" href="#/results">See who SF is</a><a class="btn ghost" href="#/characters">All characters</a></div>
    </section>`;
    confetti();
    track("secret_video_view", {});
  }

  function notFound() {
    app.innerHTML = `<section class="secret"><h2>Hmm, that page wandered off.</h2><a class="btn" href="#/">Home</a></section>`;
  }

  /* ---------------- Router ---------------- */
  const routes = [
    [/^$/, pageHome],
    [/^quiz$/, pageQuiz],
    [/^result\/(\w+)$/, pageResult],
    [/^characters$/, pageGallery],
    [/^c\/(\w+)$/, pageCharacter],
    [/^hunt$/, () => pageHunt()],
    [/^hunt\/(\w+)$/, pageHunt],
    [/^ar\/(\w+)(?:\/(giant))?$/, pageAR],
    [/^results$/, pageResults],
    [/^secret$/, pageSecret],
    [/^restore\/([\w-]+)$/, pageRestore],
    [/^test$/, pageToggleTest]
  ];
  function route() {
    cleanupHunt();
    if (!modalEl.hidden) { modalQueue.length = 0; closeModal(); }
    document.getElementById("testBanner").hidden = !isTest();
    const path = location.hash.replace(/^#\/?/, "");
    const section = path.split("/")[0];
    const navMap = { result: "quiz", c: "characters", ar: "hunt", secret: "hunt" };
    document.querySelectorAll("[data-nav]").forEach(a => a.classList.toggle("active", a.dataset.nav === (navMap[section] || section)));
    for (const [re, fn] of routes) {
      const m = path.match(re);
      if (m) { fn(...m.slice(1)); break; }
      if (re === routes[routes.length - 1][0]) notFound();
    }
    window.scrollTo(0, 0);
    app.focus({ preventScroll: true });
    if (window.gtag && !isTest()) window.gtag("event", "page_view", { page_location: location.href, page_title: document.title + " · " + (section || "home") });
  }
  window.addEventListener("hashchange", route);
  route();
})();
