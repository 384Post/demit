/* 384 Post · Characters of San Francisco — app logic
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

  // demit's Instagram + website, wherever his name appears
  function artistLinks(cls) {
    const l = [];
    if (S.artistInstagram) l.push(`<a href="${esc(S.artistInstagram)}" target="_blank" rel="noopener">Instagram</a>`);
    if (S.artistWebsite) l.push(`<a href="${esc(S.artistWebsite)}" target="_blank" rel="noopener">Website</a>`);
    if (S.artistEmail) l.push(`<a href="mailto:${esc(S.artistEmail)}">Email</a>`);
    return l.length ? `<p class="artist-links ${cls || ""}"><span>${esc(S.artist)}:</span> ${l.join(" · ")}</p>` : "";
  }

  /* ---------------- Footer ---------------- */
  (function footer() {
    const tel = n => "tel:" + String(n).replace(/[^\d+]/g, "");
    document.getElementById("siteFooter").innerHTML = `
      <div class="foot-inner">
        <div class="foot-top">
          <div>
            <img class="foot-lettering" src="assets/brand/384-post-lettering.svg" alt="384 Post St">
            <p class="foot-tag">Characters of San Francisco · a mural by ${esc(S.artist)}<br>384 Post Street · Union Square · San Francisco</p>
            ${artistLinks("foot-artist")}
            ${S.cerosUrl ? `<a class="btn small orange" href="${esc(S.cerosUrl)}">Explore 384 Post →</a>` : ""}
          </div>
          <div class="foot-contacts">
            <div class="eyebrow">Leasing contacts</div>
            ${(S.contacts || []).map(k => `<div class="contact">
              <b>${esc(k.name)}</b><span>${esc(k.license)}</span>
              <a href="${tel(k.phone)}">${esc(k.phone)}</a>
              <a href="mailto:${esc(k.email)}">${esc(k.email)}</a>
            </div>`).join("")}
          </div>
        </div>
        <div class="foot-legal">
          ${S.artworkNotice ? `<p>${esc(S.artworkNotice)}</p>` : ""}
          ${S.cbreNotice ? `<p>${esc(S.cbreNotice)}</p>` : ""}
          <p class="foot-links">${S.contactFormUrl ? `<a href="${esc(S.contactFormUrl)}" target="_blank" rel="noopener">Stay in touch</a>` : ""}<a href="#/terms">Terms of use</a><a href="#/terms#privacy">Privacy</a>${S.privacyPolicyUrl ? `<a href="${esc(S.privacyPolicyUrl)}" target="_blank" rel="noopener">CBRE privacy &amp; cookie policy</a>` : ""}</p>
        </div>
      </div>`;
  })();

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
  // Hidden-in-the-mural objects (honor system: people tap what they spot at the building)
  const OBJS = C.muralObjects || [];
  const objById = {}; OBJS.forEach(o => (objById[o.id] = o));
  const OBJ_TOTAL = OBJS.length;
  const OBJ_CODE_ORDER = OBJS.map(o => o.id).sort(); // stable order for save links (independent of the cloud order)
  const objKey = () => (isTest() ? "testObjFound" : "objFound");
  const getObj = () => store.get(objKey(), {});
  const objCount = () => Object.keys(getObj()).filter(id => objById[id]).length;
  const OBJ_ART = id => `assets/objects/${id}.svg`;
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
    // Basic, privacy-friendly analytics only: no ad personalization or Google Signals.
    window.gtag("config", S.gaMeasurementId, { send_page_view: false, allow_google_signals: false, allow_ad_personalization_signals: false });
  }
  document.addEventListener("click", e => { if (e.target.closest(".icon-pack")) track("icon_pack_download", {}); });
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
  // Units: US (feet/miles) by default; visitors can switch to metric on the Hunt page.
  const metric = () => store.get("units") === "metric";
  function len(feet, word) { // a length given in feet → "330 feet" or "100 meters" (word=true) / "330 ft" or "100 m"
    if (!metric()) return `${feet} ${word ? "feet" : "ft"}`;
    const m = feet * 0.3048, r = m >= 20 ? Math.round(m / 5) * 5 : Math.max(1, Math.round(m));
    return `${r} ${word ? "meters" : "m"}`;
  }
  function fmtDist(m) {
    if (metric()) {
      if (m < 1000) return Math.round(m / 10) * 10 + " m away";
      return (m / 1000).toFixed(m < 10000 ? 1 : 0) + " km away";
    }
    const ft = m * 3.28084, mi = m / 1609.34;
    if (ft < 1000) return Math.max(10, Math.round(ft / 10) * 10) + " ft away";
    return (mi < 10 ? mi.toFixed(1) : Math.round(mi)) + " mi away";
  }
  const directions = c => `https://www.google.com/maps/dir/?api=1&destination=${c.spot.lat},${c.spot.lng}&travelmode=walking`;

  /* ---------------- Quiz scoring ---------------- */
  // Max points each character could earn, so characters in fewer answers aren't disadvantaged.
  // Quiz scoring (see the notes above the quiz in data/config.js):
  // 1) most-picked element wins (tie → most recently picked), 2) within it, most lean points wins.
  const charElems = c => (c.elements && c.elements.length ? c.elements : [c.element]);
  function scoreQuiz(answerIdx) {
    const picked = answerIdx.map((ai, qi) => C.quiz[qi] && C.quiz[qi].answers[ai]);
    const cnt = {}, lastEl = {};
    picked.forEach((a, qi) => { if (a) { cnt[a.element] = (cnt[a.element] || 0) + 1; lastEl[a.element] = qi; } });
    const el = Object.keys(cnt).sort((x, y) => cnt[y] - cnt[x] || lastEl[y] - lastEl[x])[0];
    // only that element's answers count toward which of its characters you are
    const pts = {}, last = {};
    chars.forEach(c => { pts[c.id] = 0; last[c.id] = -1; });
    picked.forEach((a, qi) => {
      if (!a || a.element !== el) return;
      if (a.main in pts) { pts[a.main] += S.primaryPoints; last[a.main] = qi * 2 + 1; }
      if (a.also in pts) { pts[a.also] += S.secondaryPoints; if (last[a.also] < qi * 2) last[a.also] = qi * 2; }
    });
    const pool = chars.filter(c => charElems(c).includes(el)).map(c => c.id);
    return (pool.length ? pool : chars.map(c => c.id)).sort((x, y) => pts[y] - pts[x] || last[y] - last[x])[0];
  }
  window.__scoreQuiz = scoreQuiz; // handy for testing in the console

  /* ---------------- Shared bits of markup ---------------- */
  // Soft element shape behind a character on the big art panels (thumbnails use a plain circle)
  const EL_SHAPES = {
    fire: "M52 2C58 20 72 28 75 46C78 38 77 31 74 25C86 36 91 52 89 67C86 85 70 97 50 97C30 97 13 85 11 67C9 52 17 41 25 32C25 41 28 47 33 51C30 32 38 15 52 2Z",
    water: "M50 4C65 28 82 46 82 66C82 84 68 96 50 96C32 96 18 84 18 66C18 46 35 28 50 4Z",
    air: "M27 74C13 74 6 64 8 54C10 44 20 39 29 41C29 27 41 18 54 20C65 22 71 30 73 39C85 37 95 46 93 58C91 69 82 74 73 74Z",
    earth: "M12 88C8 52 30 16 88 10C92 58 66 90 12 88Z"
  };
  const elKey = c => (c.id === "flow" ? "air" : String((c.elements || [c.element])[0] || "").toLowerCase());
  function artStage(c, extraStyle) {
    const d = EL_SHAPES[elKey(c)];
    return `<div class="art-stage${d ? " has-shape" : ""}" style="--c:${esc(c.colorHex)};${extraStyle || ""}">
      ${d ? `<svg class="el-shape" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet" aria-hidden="true"><path d="${d}"/></svg>` : ""}
      <img src="${ART(c.id)}" alt="${esc(c.name)}, ${esc(c.archetype)}, by ${esc(S.artist)}"></div>`;
  }
  // Little element icons for thumbnails (Fog and Mangrove get two)
  function elBadges(c) {
    const els = (c.elements || [c.element]).map(e => String(e).toLowerCase()).filter(e => EL_SHAPES[e]);
    if (!els.length) return "";
    return `<span class="el-badges" title="${esc(c.element)}">${els.map(e => `<span class="el-badge el-${e}"><svg viewBox="0 0 100 100" aria-hidden="true"><path d="${EL_SHAPES[e]}"/></svg></span>`).join("")}<span class="sr-only">${esc(c.element)}</span></span>`;
  }
  const paras = t => String(t || "").split(/\n+/).filter(Boolean).map(x => `<p>${esc(x)}</p>`).join("");
  function challengeHTML(c, compact) {
    if (!c.challenge) return "";
    const ig = ((C.settings.share || {}).instagramTags || []).map(h => "@" + h).join(" ");
    return `<div class="challenge${compact ? " compact" : ""}" style="--c:${esc(c.colorHex)}">
      <div class="eyebrow">AR challenge</div>
      <p class="challenge-text">${esc(c.challenge)}</p>
      <p class="challenge-tag">Share it and tag ${ig ? `<b>${esc(ig)}</b> ` : ""}<b>${esc(S.hashtag)}</b></p>
    </div>`;
  }
  function chipsHTML(c) {
    return `<div class="chips">
      <span class="chip"><b>Element</b>${esc(c.element)}</span>
      <span class="chip"><b>Core trait</b>${esc(c.trait)}</span>
      <span class="chip"><span class="swatch" style="background:${esc(c.colorHex)}"></span>${esc(c.color)}</span>
      ${c.object ? `<span class="chip"><b>Carries</b>${esc(c.object)}</span>` : ""}
    </div>`;
  }
  function pairingsHTML(c) {
    return `<h3>Pairings</h3><div class="pair-grid">${c.pairings.filter(id => byId[id]).map(id => {
      const p = byId[id];
      return `<a class="mini" href="#/c/${p.id}"><img src="${ART(p.id)}" alt=""><span><strong>${esc(p.name)}</strong><small>${esc(p.archetype)}</small></span></a>`;
    }).join("")}</div>`;
  }
  function spotHTML(c) {
    const f = isFound(c.id);
    return `<div class="spot-card">
      <div class="eyebrow">${c.spot.bonus ? "Bonus hunt spot" : "Hunt spot"} ${f ? '<span class="badge found">Found</span>' : ""}</div>
      <h3>${esc(c.spot.name)}</h3>
      ${c.spot.why ? `<p class="muted">${esc(c.spot.why)}</p>` : ""}
      <div class="btn-row">
        <a class="btn small" href="#/hunt/${c.id}">Show on map</a>
        ${canAR(c.id) ? `<a class="btn small red" href="#/ar/${c.id}">View in AR</a>` : `<a class="btn small ghost" href="${directions(c)}" target="_blank" rel="noopener">Walking directions</a>`}
      </div>
    </div>`;
  }
  function muralHTML(c) {
    const objs = (c.objects || []).filter(id => objById[id]);
    if (!c.mural && !objs.length) return "";
    return `<div class="mural-card">
      <div class="eyebrow">On the mural at 384 Post</div>
      ${c.mural ? `<h3>${esc(c.mural)}</h3>` : ""}
      ${objs.length ? `<p class="muted" style="margin:0 0 8px">Look for ${esc(c.name)}'s hidden objects:</p>
        <div class="mural-objs">${objs.map(id => `<a href="#/mural" title="${esc(objById[id].name)}"><img src="${OBJ_ART(id)}" alt="${esc(objById[id].name)}"><small>${esc(objById[id].name)}</small></a>`).join("")}</div>` : ""}
    </div>`;
  }
  function profileHTML(c, you) {
    return `<section class="profile">
      ${artStage(c)}
      <div>
        ${you ? `<div class="youare">You're…</div>` : `<div class="eyebrow">Character ${c.number}</div>`}
        <h1 style="margin-bottom:.1em">${esc(c.name)}</h1>
        <div class="eyebrow" style="font-size:15px">${esc(c.archetype)}</div>
        ${chipsHTML(c)}
        ${paras(c.description)}
        <div class="facts" style="--c:${esc(c.colorHex)}">
          <div class="fact"><b>Powers</b>${esc(c.powers || c.power)}</div>
          <div class="fact"><b>Struggles</b>${esc(c.struggles)}</div>
          ${c.recharge && c.recharge.length ? `<div class="fact"><b>How to recharge</b><ul class="recharge">${c.recharge.map(r => `<li>${esc(r)}</li>`).join("")}</ul></div>` : ""}
        </div>
        ${you ? challengeHTML(c) : ""}
        ${pairingsHTML(c)}
        ${muralHTML(c)}
        ${spotHTML(c)}
        ${you ? `<div class="btn-row">
            <a class="btn red" href="#/ar/${c.id}">See ${esc(c.name)} in AR</a>
            <a class="btn" href="#/hunt">Start the Scavenger Hunt</a>
            <a class="btn ghost" href="#/quiz">Retake quiz</a>
          </div>` : `<div class="callout"><b>Which character are you?</b> ${C.quiz.length} quick questions to find out.<div class="btn-row" style="margin-top:10px"><a class="btn red small" href="#/quiz">Take the Quiz</a></div></div>`}
      </div>
    </section>`;
  }

  /* ================= PAGES ================= */

  function pageHome() {
    const r = myResult();
    const order = ["rebel", "flora", "captain", "lorey", "sol", "ocean", "compass", "pixie", "sequoia", "flow", "atlas", "ash", "rascal"];
    const parade = order.map((id, i) => {
      const x = 4 + i * (92 / (order.length - 1));
      const h = [70, 82, 92, 78, 100, 86, 80, 74, 88, 76, 94, 72, 68][i];
      const rot = ((i % 3) - 1) * 4;
      return `<img src="${ART(id)}" alt="" style="--x:${x}%;--h:${h}%;--r:${rot}deg;--d:${(i * .27).toFixed(2)}s;z-index:${i % 2 ? 1 : 2}">`;
    }).join("");
    app.innerHTML = `
      <section class="hero">
        <div class="eyebrow">Union Square · a mural by ${esc(S.artist)}</div>
        <h1>Which <em>Character</em> are you?</h1>
        <p>Every one of us arrives in San Francisco with a distinct story.<br>Find the character who shares yours.</p>
        <div class="btn-row center">
          <a class="btn red" href="#/quiz">${r ? "Retake the Quiz" : "Take the Quiz"}</a>
          ${r ? `<a class="btn ghost" href="#/result/${r}">I'm ${esc(byId[r].name)} →</a>` : ""}
          <a class="btn green" href="#/hunt">Start the Scavenger Hunt</a>
        </div>
      </section>
      <div class="parade" aria-hidden="true">${parade}</div>
      <section class="cards3">
        <a class="tile" href="#/quiz"><h3>1 · Find Your Character</h3><p>${C.quiz.length} quick questions match you with one of ${TOTAL} characters.</p></a>
        <a class="tile" href="#/hunt"><h3>2 · Scavenger Hunt</h3><p>Giant characters are hiding around SF, and ${OBJ_TOTAL} objects are hidden in the mural itself. ${foundCount() ? `<b>${foundCount()} of ${TOTAL} found.</b>` : ""}</p></a>
        <a class="tile" href="#/results"><h3>3 · SF Character Rankings</h3><p>See which characters the city is made of, live.</p></a>
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
        <b>${esc(c.name)}'s hunt spot: ${esc(c.spot.name)}.</b> ${TOTAL - 1} more characters are waiting around the city. Find them in any order. <a href="#/hunt">Start the Scavenger Hunt →</a>
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
      <h2>Meet all ${TOTAL} characters</h2>
      <p class="muted">Each embodies the elemental forces and personalities that shape us. Art by ${esc(S.artist)}.</p>
      ${artistLinks()}
      <div class="gallery">${chars.map(c => `
        <a class="g-item" href="#/c/${c.id}">
          <div class="pic" style="--c:${esc(c.colorHex)}"><img src="${ART(c.id)}" alt="" loading="lazy"></div>
          <strong>${esc(c.name)}</strong><small>${esc(c.archetype)}</small>${elBadges(c)}
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
    g.fillText("WHICH CHARACTER ARE YOU?", W / 2, 150);
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
    g.fillText([c.element, c.trait, c.object].filter(Boolean).join(" · "), W / 2, 1610);
    try { // demit's hand-drawn "384 POST ST" lettering
      const lt = await loadImg("assets/brand/384-post-lettering.png");
      const lw = 640, lh = lw * lt.naturalHeight / lt.naturalWidth;
      g.drawImage(lt, (W - lw) / 2, 1690, lw, lh);
    } catch (e) {
      g.fillStyle = "#1B1A17"; g.font = "800 58px 'Bricolage Grotesque', sans-serif"; g.fillText("384 Post St", W / 2, 1745);
    }
    g.font = "600 32px 'Source Sans 3', sans-serif"; g.fillStyle = "#5E5A50";
    g.fillText(`${SH.imageHashtag || "#384Post"} · Union Square · mural by ${S.artist}`, W / 2, 1820);
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
      case "download": {
        // @-tags only on Instagram, where we know the handles
        const at = platform === "instagram" ? (SH.instagramTags || []).map(h => "@" + h).join(" ") : "";
        return shareImageToApp(platform, c, long + (at ? " " + at : "") + " " + tags + " " + (S.shareLandingUrl || S.cerosUrl || S.siteUrl || ""));
      }
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
    app.innerHTML = huntTabs("giants") + `
      <section class="hunt-head">
        <div>
          <div class="eyebrow">The Scavenger Hunt</div>
          <h2>Giants are hiding around San Francisco</h2>
          <p class="muted">Walk within about ${len(Math.round(S.unlockRadiusMeters * 3.28 / 10) * 10, true)} of a spot to unlock its character — then see them towering up to ${len(30, true)} tall in AR. Find all ${TOTAL} for a secret message from ${esc(S.artist)}.</p>
          <p style="margin:0"><button class="linkish strong" id="howBtn">How the Scavenger Hunt works</button></p>
        </div>
        <div>
          <div class="counter" id="counter">${n}<small> / ${TOTAL} found</small></div>
          <div class="meter"><i id="meter" style="width:${(n / TOTAL) * 100}%"></i></div>
          <div class="btn-row" style="margin-top:12px">
            <button class="btn green" id="locBtn">Start finding</button>
            ${n === TOTAL ? `<a class="btn red" href="#/secret">Secret unlocked ✦</a>` : ""}
          </div>
          <div class="loc-status" id="locStatus">Location is off. Your position never leaves your phone.</div>
          <div class="units" role="group" aria-label="Units">
            <button data-units="us" class="${metric() ? "" : "on"}">ft / mi</button><button data-units="metric" class="${metric() ? "on" : ""}">m / km</button>
          </div>
        </div>
      </section>
      ${r ? `<div class="callout"><b>You're ${esc(byId[r].name)}!</b> Your character is circled in red on the map. Hunt in any order: start with whoever's closest.</div>` : `<div class="callout"><a href="#/quiz"><b>Take the Quiz</b></a> to find your character, then hunt for all ${TOTAL}.</div>`}
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
    document.getElementById("howBtn").addEventListener("click", showHowTo);
    app.querySelectorAll("[data-units]").forEach(b => b.addEventListener("click", () => {
      store.set("units", b.dataset.units); route();
    }));
    document.getElementById("saveBtn").addEventListener("click", saveProgress);
    if (isTest()) bindTestTools();
    if (store.get("locOn") && !isTest()) startLocation();
  }

  function showHowTo() {
    const ft = len(Math.round(S.unlockRadiusMeters * 3.28 / 10) * 10, true);
    openModal(`<div class="howto">
      <div class="eyebrow">The Scavenger Hunt</div>
      <h2>How the Scavenger Hunt works</h2>
      <ol>
        <li><b>Keep this page open while you explore.</b> The site can only spot you while it's open on your screen. It can't alert you when your phone is locked or the browser is closed, so open the Hunt page when you get to a spot.</li>
        <li><b>Tap "Start finding" and allow location.</b> Your location stays on your phone and is never sent anywhere. Each spot shows how far away it is.</li>
        <li><b>Walk within about ${ft} of a spot.</b> The character unlocks automatically, with a little celebration. Hunt in any order. Spots marked "Bonus" are farther out.</li>
        <li><b>See them in AR.</b> Tap to place the character in front of you through your phone camera, at giant size for that spot, or switch to life-size. Any character you've found, and your own quiz character, can be viewed again anytime.</li>
        <li><b>Your progress saves automatically</b> on this phone, in this browser. If you switch phones or browsers (say, from Instagram's built-in browser to Safari), tap <b>Save my progress</b> for a link, then open it in the new browser. The link is a snapshot of what you've found so far, so make a new one whenever you want to carry over newer finds. Tip: iPhones can clear saved progress after about a week without a visit, so a saved link is a good backup.</li>
        <li><b>Find all ${TOTAL}</b> to unlock a secret message from ${esc(S.artist)}.</li>
      </ol>
      <p class="muted" style="font-size:14px;margin:14px 0 0"><b>Stay safe:</b> watch where you're walking, stay on public sidewalks and paths, and never use AR in the street or while driving. Location accuracy varies, especially between tall buildings.</p>
      <div class="btn-row center" style="margin-top:18px"><button class="btn" data-close>Got it</button></div>
    </div>`);
  }

  function pinHTML(c) {
    const f = isFound(c.id), mine = myResult() === c.id;
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
    const r = myResult();
    const list = chars.slice().sort((a, b) =>
      (isFound(a.id) - isFound(b.id)) || (a.spot.bonus - b.spot.bonus) ||
      (mePos ? distanceM(mePos, a.spot) - distanceM(mePos, b.spot) : a.number - b.number));
    el.innerHTML = list.map(c => {
      const f = isFound(c.id);
      return `<div class="h-card ${f ? "" : "locked"}">
        <div class="pic" style="--c:${esc(c.colorHex)}"><img src="${ART(c.id)}" alt=""></div>
        <div>
          <h4>${esc(c.name)}${f ? '<span class="badge found">Found</span>' : ""}${r === c.id ? '<span class="badge mine">You</span>' : ""}${c.spot.bonus ? '<span class="badge">Bonus</span>' : ""}</h4>
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
      if (s2) { s2.className = "loc-status on"; s2.textContent = "Location on · finding characters near you"; }
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
      <div class="eyebrow">You found a character!</div>
      ${artStage(c)}
      <h2>${esc(c.name)}</h2>
      <p><b>${esc(c.archetype)}</b> · ${esc(c.spot.name)}</p>
      <p class="muted">${n} of ${TOTAL} found</p>
      ${challengeHTML(c, true)}
      <div class="btn-row center">
        <a class="btn red" href="#/ar/${c.id}/giant">See ${esc(c.name)} in giant AR</a>
        <a class="btn ghost" href="#/c/${c.id}">Their story</a>
      </div>
      <p style="margin:16px 0 0"><button class="linkish" data-close>Keep hunting</button></p>`);
    confetti();
    if (n === TOTAL) {
      const code = ensureGiftCode();
      track("hunt_complete", code ? { claim_code: code } : {});
      openModal(`
        <div class="eyebrow">All ${TOTAL} found</div>
        <h2>You collected every character!</h2>
        <p>${esc(S.artist)} left something for you${code && S.giftClaimUrl ? `, including a <b>Gift Ticket</b>` : ""}.</p>
        <div class="btn-row center"><a class="btn red" href="#/secret">Open the secret ✦</a></div>`);
    }
  }

  /* ---------------- Hidden in the Mural ---------------- */
  // Two big illustrated tabs so nobody misses the second hunt
  function huntTabs(active) {
    const giants = ["ocean", "flora", "sol", "rascal", "pixie"].filter(id => byId[id]);
    const objs = ["bunny", "crown", "rainbow", "musicNote", "globe", "butterfly", "binoculars", "genieLamp"].filter(id => objById[id]);
    return `<nav class="hunt-tabs" aria-label="Choose a hunt">
      <a href="#/hunt" class="${active === "giants" ? "on" : ""}">
        <span class="tab-thumb map-thumb" aria-hidden="true">${giants.map(id => `<img src="${ART(id)}" alt="">`).join("")}<i class="tab-pin"></i></span>
        <span class="tab-label">Giant SF Hunt<small>${foundCount()} / ${TOTAL} giants around the city</small></span>
      </a>
      <a href="#/mural" class="${active === "mural" ? "on" : ""}">
        <span class="tab-thumb obj-thumb" aria-hidden="true">${objs.map(id => `<img src="${OBJ_ART(id)}" alt="">`).join("")}</span>
        <span class="tab-label">Hidden in the Mural<small>${objCount()} / ${OBJ_TOTAL} objects to spot</small></span>
      </a>
    </nav>`;
  }
  // small fixed wobble so the cloud looks hand-placed (the same for everyone)
  const wob = (i, k) => { const x = Math.sin((i + 1) * 12.9898 * k) * 43758.5453; return x - Math.floor(x); };
  function objBtn(o, inTray) {
    const i = OBJS.indexOf(o);
    const rot = Math.round((wob(i, 1) - .5) * 24), dy = Math.round((wob(i, 2) - .5) * 26), mx = Math.round(wob(i, 3) * 14);
    return `<button class="obj${inTray ? " in-tray" : ""}" data-obj="${o.id}" style="--s:${o.size}px;--r:${rot}deg;--y:${dy}px;--mx:${mx}px"
      aria-label="${inTray ? "Found: " + esc(o.name) + ". Tap to put it back" : esc(o.name)}" title="${esc(o.name)}"><img src="${OBJ_ART(o.id)}" alt="" draggable="false"></button>`;
  }
  const trayHint = n => n ? "Tapped one by mistake? Tap it here to put it back." : "Objects you find will collect here.";
  function pageMural() {
    const got = getObj(), n = objCount(), done = OBJ_TOTAL && n === OBJ_TOTAL;
    const left = OBJS.filter(o => !got[o.id]);
    const found = OBJS.filter(o => got[o.id]).sort((a, b) => got[a.id] - got[b.id]);
    app.innerHTML = huntTabs("mural") + `
      <section class="hunt-head mural-head">
        <div>
          <div class="eyebrow">Hidden in the Mural</div>
          <h2>${OBJ_TOTAL} objects are hiding in the mural</h2>
          <p class="muted">Visit the mural at 384 Post in Union Square and look closely: ${esc(S.artist)} tucked these objects in among the characters. Each time you spot one on the wall, tap it here.</p>
        </div>
        <div>
          <div class="counter" id="objCounter">${n}<small> / ${OBJ_TOTAL} found</small></div>
          <div class="meter"><i id="objMeter" style="width:${OBJ_TOTAL ? (n / OBJ_TOTAL) * 100 : 0}%"></i></div>
        </div>
        ${done ? doneSticker() : ""}
      </section>
      ${isTest() ? `<div class="test-tools"><b>Test tools</b> <span class="muted">(test progress is separate and isn't sent to analytics)</span>
        <div class="btn-row" style="margin-top:10px"><button class="btn small" id="tObjAlmost">Find all but one</button><button class="btn small ghost" id="tObjReset">Reset objects</button></div></div>` : ""}
      <div class="obj-cloud" id="objCloud">${left.map(o => objBtn(o)).join("")}</div>
      <a class="obj-bar" href="#foundTray" id="objBar">${n} / ${OBJ_TOTAL} found ↓</a>
      <p class="center muted obj-empty" id="cloudEmpty" ${left.length ? "hidden" : ""}>You've spotted everything. Nicely done.</p>
      <div id="packSlot">${done ? iconPackCard() : ""}</div>
      <section class="found-tray" id="foundTray">
        <h3>Found <span id="trayCount">${n}</span></h3>
        <div class="obj-tray" id="objTray">${found.map(o => objBtn(o, true)).join("")}</div>
        <p class="muted tray-hint" id="trayHint">${trayHint(n)}</p>
      </section>
      <p class="center" style="margin-top:26px">
        <button class="btn ghost small" id="saveBtn">Save my progress</button><br>
        <span class="muted" style="font-size:14px">One link saves everything: your character, the giant hunt and the mural.</span>
      </p>
`;
    app.querySelector("#objCloud").addEventListener("click", e => { const b = e.target.closest(".obj"); if (b) findObject(b); });
    app.querySelector("#objTray").addEventListener("click", e => { const b = e.target.closest(".obj"); if (b) unfindObject(b); });
    app.querySelector("#objBar").addEventListener("click", e => { e.preventDefault(); document.getElementById("foundTray").scrollIntoView({ behavior: "smooth" }); });
    document.getElementById("saveBtn").addEventListener("click", saveProgress);
    if (isTest()) {
      document.getElementById("tObjAlmost").onclick = () => { const f = {}; OBJS.slice(1).forEach((o, i) => (f[o.id] = Date.now() + i)); store.set("testObjFound", f); route(); };
      document.getElementById("tObjReset").onclick = () => { store.set("testObjFound", {}); route(); toast("Test objects reset"); };
    }
  }
  function doneSticker() {
    return `<div class="done-sticker" role="img" aria-label="All ${OBJ_TOTAL} found"><img src="assets/brand/flower.svg" alt=""><span>All ${OBJ_TOTAL}<br>found!</span></div>`;
  }
  function iconPackBtn(cls) {
    return S.iconPackUrl ? `<a class="btn ${cls || "red"} icon-pack" href="${esc(S.iconPackUrl)}" download>Download the icon pack</a>` : "";
  }
  function iconPackCard() {
    if (!S.iconPackUrl) return "";
    return `<section class="pack-card">
      <div class="pack-icons" aria-hidden="true">${OBJS.slice(0, 6).map(o => `<img src="${OBJ_ART(o.id)}" alt="">`).join("")}</div>
      <div><div class="eyebrow">Your reward</div><h3>${esc(S.artist)}'s icon pack</h3>
      <p class="muted">All ${OBJ_TOTAL} hand-drawn objects as SVG and PNG, free for personal use. Tag @demit if you share them.</p>
      ${iconPackBtn()}</div>
    </section>`;
  }
  function updateObjUI() {
    const n = objCount();
    const set = (id, h) => { const el = document.getElementById(id); if (el) el.innerHTML = h; };
    set("objCounter", `${n}<small> / ${OBJ_TOTAL} found</small>`);
    set("trayCount", n);
    set("objBar", `${n} / ${OBJ_TOTAL} found ↓`);
    set("trayHint", trayHint(n));
    const m = document.getElementById("objMeter"); if (m) m.style.width = (n / OBJ_TOTAL) * 100 + "%";
    const tab = app.querySelector('.hunt-tabs a[href="#/mural"] small'); if (tab) tab.textContent = `${n} / ${OBJ_TOTAL} objects to spot`;
    const ce = document.getElementById("cloudEmpty"); if (ce) ce.hidden = n < OBJ_TOTAL;
  }
  const reduceMotion = () => !!(window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches);
  // take an element out of its row and slide its neighbors smoothly into the gap
  function flipOut(btn) {
    const sibs = [...btn.parentNode.children].filter(x => x !== btn);
    const before = sibs.map(x => x.getBoundingClientRect());
    btn.remove();
    if (reduceMotion()) return;
    sibs.forEach((x, k) => {
      const a = before[k], b = x.getBoundingClientRect();
      const dx = a.left - b.left, dy = a.top - b.top;
      if (!dx && !dy) return;
      const tray = x.classList.contains("in-tray");
      const y = tray ? "0px" : x.style.getPropertyValue("--y") || "0px", r = tray ? "0deg" : x.style.getPropertyValue("--r") || "0deg";
      x.animate([{ transform: `translate(${dx}px, calc(${dy}px + ${y})) rotate(${r})` }, { transform: `translate(0px, ${y}) rotate(${r})` }],
        { duration: 380, easing: "cubic-bezier(.2,.8,.3,1)" });
    });
  }
  // a little burst of demit-style ink sparkle marks around the tapped object (black ink only,
  // to match the black-and-white objects; color confetti is saved for finishing the whole mural)
  function burst(btn, big) {
    if (reduceMotion()) return;
    const r = btn.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    const reach = Math.max(r.width, r.height) / 2;
    const rings = big ? [{ n: 12, out: 34, len: 14 }, { n: 12, out: 62, len: 9, delay: 90 }] : [{ n: 8, out: 22, len: 11 }];
    const base = Math.random() * 360;
    rings.forEach((ring, ri) => {
      for (let k = 0; k < ring.n; k++) {
        const t = document.createElement("i"); t.className = "spark-tick";
        const ang = base + (ri ? 180 / ring.n : 0) + k * (360 / ring.n) + (Math.random() - .5) * 12;
        t.style.left = cx + "px"; t.style.top = cy + "px";
        t.style.setProperty("--a", ang + "deg");
        t.style.setProperty("--from", reach * .55 + (ri ? 18 : 0) + "px");
        t.style.setProperty("--to", reach + ring.out + Math.random() * 8 + "px");
        t.style.setProperty("--len", ring.len + Math.random() * 5 + "px");
        if (ring.delay) t.style.animationDelay = ring.delay + "ms";
        document.body.appendChild(t); setTimeout(() => t.remove(), 800);
      }
    });
  }
  const buzz = pattern => { try { if (navigator.vibrate) navigator.vibrate(pattern); } catch (e) {} }; // Android only; iPhones ignore it
  function bump(id) {
    const el = document.getElementById(id); if (!el || reduceMotion()) return;
    el.classList.remove("bump"); void el.offsetWidth; el.classList.add("bump");
  }
  // small milestones along the way: halfway, and a few to go (plus 10 found on bigger lists)
  function milestone(n) {
    const half = Math.ceil(OBJ_TOTAL / 2), left = OBJ_TOTAL >= 30 ? 8 : 3;
    if (OBJ_TOTAL >= 30 && n === 10) return "10 found! You've got an eye for this.";
    if (n === half) return "Halfway there!";
    if (n === OBJ_TOTAL - left && n > half) return `Only ${left} left!`;
    return "";
  }
  function findObject(btn) {
    const o = objById[btn.dataset.obj]; if (!o || btn.classList.contains("got")) return;
    const f = getObj(); f[o.id] = Date.now(); store.set(objKey(), f);
    track("mural_object_found", { object: o.id });
    const n = objCount(), note = n < OBJ_TOTAL ? milestone(n) : "";
    btn.classList.add("got");
    buzz(note ? [20, 50, 20] : 15);
    setTimeout(() => burst(btn, !!note), reduceMotion() ? 0 : 140); // pop at the top of the hop
    setTimeout(() => {
      if (!btn.isConnected) return;
      flipOut(btn);
      btn.classList.remove("got"); btn.classList.add("in-tray", "arrive");
      btn.setAttribute("aria-label", `Found: ${o.name}. Tap to put it back`);
      document.getElementById("objTray").appendChild(btn);
      setTimeout(() => btn.classList.remove("arrive"), 600);
      updateObjUI();
      bump("objBar"); bump("objCounter"); bump("trayCount");
      if (note) toast(note);
      if (objCount() === OBJ_TOTAL) muralComplete();
    }, reduceMotion() ? 0 : 480);
  }
  function unfindObject(btn) {
    const o = objById[btn.dataset.obj]; if (!o) return;
    const f = getObj(); delete f[o.id]; store.set(objKey(), f);
    flipOut(btn);
    btn.classList.remove("in-tray"); btn.setAttribute("aria-label", o.name);
    // back to its original place in the cloud
    const cloud = document.getElementById("objCloud"), idx = OBJS.indexOf(o);
    const next = [...cloud.children].find(x => OBJS.indexOf(objById[x.dataset.obj]) > idx);
    cloud.insertBefore(btn, next || null);
    btn.classList.add("arrive"); setTimeout(() => btn.classList.remove("arrive"), 600);
    const st = app.querySelector(".done-sticker"); if (st) st.remove();
    const ps = document.getElementById("packSlot"); if (ps) ps.innerHTML = "";
    updateObjUI();
    toast(`${o.name} went back to the cloud. Tap it again when you spot it.`);
  }
  function muralComplete() {
    track("mural_complete", {});
    const head = app.querySelector(".mural-head");
    if (head && !head.querySelector(".done-sticker")) head.insertAdjacentHTML("beforeend", doneSticker());
    const slot = document.getElementById("packSlot"); if (slot) slot.innerHTML = iconPackCard();
    const bloom = document.createElement("div"); bloom.className = "bloom";
    bloom.innerHTML = `<img src="assets/brand/flower.svg" alt="">`;
    document.body.appendChild(bloom);
    confetti();
    setTimeout(() => {
      bloom.remove();
      openModal(`<div class="eyebrow">Hidden in the Mural</div>
        <div class="done-flower"><img src="assets/brand/flower.svg" alt=""></div>
        <h2>You did it!</h2>
        <p>You spotted all ${OBJ_TOTAL} objects ${esc(S.artist)} hid in the mural. Sharp eyes.${S.iconPackUrl ? " Your reward: the drawings are yours to download." : ""}</p>
        <div class="btn-row center">${iconPackBtn()}<a class="btn green" href="#/hunt">Now hunt the giants</a><button class="btn ghost" data-close>See my collection</button></div>`);
    }, reduceMotion() ? 0 : 2100);
  }

  /* ---------------- Save / restore progress ---------------- */
  function progressCode() {
    let bits = 0;
    chars.forEach((c, i) => { if (store.get("found", {})[c.id]) bits |= 1 << i; });
    const r = myResult();
    // mural objects as one big number (BigInt: there are more than 32 of them)
    const got = store.get("objFound", {});
    let ob = 0n;
    OBJ_CODE_ORDER.forEach((id, i) => { if (got[id]) ob |= 1n << BigInt(i); });
    const g = store.get("giftCode");
    return bits.toString(36) + "-" + (r ? String.fromCharCode(97 + byId[r].index) : "x") + (ob ? "-" + ob.toString(36) : "") +
      (g && window.GiftCode ? "-_" + GiftCode.normalize(g).toLowerCase() : "");
  }
  async function saveProgress() {
    if (isTest()) { toast("Turn off test mode to save real progress."); return; }
    const url = location.href.split("#")[0] + "#/restore/" + progressCode();
    try {
      if (navigator.share) { await navigator.share({ title: "My 384 Post hunt", text: "My 384 Post hunt progress:", url }); return; }
    } catch (e) { if (e.name === "AbortError") return; }
    try { await navigator.clipboard.writeText(url); toast("Link copied — text it to yourself!"); }
    catch (e) { openModal(`<h3>Your progress link</h3><p style="word-break:break-all">${esc(url)}</p><button class="btn small" data-close>Done</button>`); }
  }
  function pageRestore(code) {
    const seg = code.split("-");
    const [b, r] = seg;
    const o = seg.slice(2).find(x => x && x[0] !== "_");
    const g = seg.slice(2).find(x => x && x[0] === "_");
    if (g && window.GiftCode && !store.get("giftCode")) { const d = GiftCode.decode(g.slice(1)); if (d.ok) store.set("giftCode", d.code); }
    const bits = parseInt(b, 36) || 0;
    const f = store.get("found", {});
    let added = 0;
    chars.forEach((c, i) => { if ((bits & (1 << i)) && !f[c.id]) { f[c.id] = Date.now(); added++; } });
    store.set("found", f);
    if (r && r !== "x") { const c = chars[r.charCodeAt(0) - 97]; if (c && !myResult()) store.set("result", c.id); }
    let objAdded = 0;
    if (o) {
      let ob = 0n;
      try { for (const ch of o.toLowerCase()) ob = ob * 36n + BigInt(parseInt(ch, 36)); } catch (e) { ob = 0n; }
      const got = store.get("objFound", {});
      OBJ_CODE_ORDER.forEach((id, i) => { if ((ob >> BigInt(i)) & 1n && !got[id]) { got[id] = Date.now() + i; objAdded++; } });
      store.set("objFound", got);
    }
    const parts = [];
    if (added) parts.push(`${added} character${added > 1 ? "s" : ""}`);
    if (objAdded) parts.push(`${objAdded} mural object${objAdded > 1 ? "s" : ""}`);
    toast(parts.length ? `Restored ${parts.join(" and ")}!` : "Progress is up to date.");
    location.replace(objAdded && !added ? "#/mural" : "#/hunt");
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
        <a href="#/ar/${c.id}" class="${giant ? "" : "on"}">Life-size <small>~${len(6)}</small></a>
        <a href="#/ar/${c.id}/giant" class="${giant ? "on" : ""}">Giant <small>~${len(c.spot.giantFeet)}</small></a>
      </div>
      <div style="position:relative">
        <model-viewer id="mv" src="${MODEL(c.id, giant)}" alt="${esc(c.name)} by ${esc(S.artist)}"
          ar ar-modes="webxr scene-viewer quick-look" ar-scale="fixed" ar-placement="floor"
          camera-controls touch-action="pan-y" interaction-prompt="none"
          camera-orbit="0deg 85deg auto" field-of-view="30deg" shadow-intensity="0.6" shadow-softness="1" exposure="1.1" tone-mapping="neutral">
          <span slot="ar-button" hidden></span>
          <div slot="ar-prompt" class="ar-prompt">Point at the ground and move your phone slowly…</div>
        </model-viewer>
        <button class="btn red ar-btn" id="arGo" hidden>See ${esc(c.name)} in your space</button>
      </div>
      <p class="muted" style="margin-top:14px">${giant ? `Giant-size, about ${len(c.spot.giantFeet, true)} tall here: after you tap the button, aim at the ground, then walk back about ${len(c.spot.giantFeet, true)} to fit them on screen.` : "Life-size, about as tall as you: after you tap the button, aim at the ground and stand next to them for a photo."} On a computer, drag to spin them around.</p>
      ${challengeHTML(c)}
      <div class="btn-row"><a class="btn ghost small" href="#/c/${c.id}">Read ${esc(c.name)}'s story</a><a class="btn ghost small" href="#/hunt">Back to the hunt</a></div>
    </section>`;
    loadModelViewer().then(ok => {
      if (!ok) { const mv = document.getElementById("mv"); if (mv) mv.outerHTML = `<div class="art-stage" style="--c:${esc(c.colorHex)}"><img src="${ART(c.id)}" alt=""></div><p class="muted">The 3D viewer couldn't load on this connection.</p>`; return; }
      const mv = document.getElementById("mv");
      if (!mv) return;
      mv.addEventListener("ar-status", e => { if (e.detail.status === "session-started") track("ar_open", { character: c.id, size: giant ? "giant" : "life" }); });
      // Our own AR button, so we can show a quick "how to place them" tip first.
      const go = document.getElementById("arGo");
      const showIfAR = () => { if (go && mv.canActivateAR) go.hidden = false; };
      mv.addEventListener("load", showIfAR); setTimeout(showIfAR, 400);
      if (go) go.addEventListener("click", () => {
        // Show the placement tip the first time only; after that, go straight to the camera.
        if (store.get("arTipSeen")) { try { mv.activateAR(); } catch (e) { toast("AR isn't available in this browser."); } }
        else arTip(c, giant, mv);
      });
    });
  }

  // The finale: all 13 characters together in AR, for people who found every one.
  function pageEveryone(size) {
    const small = size === "tabletop";
    if (foundCount() < TOTAL && !isTest()) { location.replace("#/secret"); return; }
    const src = small ? "assets/models/group/everyone-tabletop.glb" : "assets/models/group/everyone.glb";
    // iPhones use a ready-made Apple (USDZ) version: converting a 13-character scene on the phone is too slow
    const iosSrc = src.replace(/\.glb$/, ".usdz");
    const ig = ((C.settings.share || {}).instagramTags || []).map(h => "@" + h).join(" ");
    app.innerHTML = `<section class="ar-wrap">
      <div class="eyebrow">All ${TOTAL} found · the finale</div>
      <h2>Everyone, together</h2>
      <div class="size-toggle" role="group" aria-label="Size">
        <a href="#/everyone" class="${small ? "" : "on"}">Life-size <small>~${len(17)} tall</small></a>
        <a href="#/everyone/tabletop" class="${small ? "on" : ""}">Tabletop <small>~${len(2)} tall</small></a>
      </div>
      <div style="position:relative">
        <model-viewer id="mv" src="${src}" ios-src="${iosSrc}" alt="All ${TOTAL} characters by ${esc(S.artist)}"
          ar ar-modes="webxr scene-viewer quick-look" ar-scale="fixed" ar-placement="floor"
          camera-controls touch-action="pan-y" interaction-prompt="none"
          camera-orbit="0deg 85deg auto" field-of-view="30deg" shadow-intensity="0.6" shadow-softness="1" exposure="1.1" tone-mapping="neutral">
          <span slot="ar-button" hidden></span>
          <div slot="ar-prompt" class="ar-prompt">Point at the ground and move your phone slowly…</div>
        </model-viewer>
        <button class="btn red ar-btn" id="arGo" hidden>See everyone in your space</button>
      </div>
      <p class="muted" style="margin-top:14px">${small
        ? "Tabletop size, about 2 feet tall: place them on a table or the floor in front of you."
        : `Life-size: the front row is about as tall as you, and the whole group is about ${len(33, true)} wide. Find an open space, place them, then walk back to fit everyone in.`} On a computer, drag to spin them around.</p>
      <div class="challenge" style="--c:var(--yellow)">
        <div class="eyebrow">The final challenge</div>
        <p class="challenge-text">Take a group photo with all ${TOTAL} characters!</p>
        <p class="challenge-tag">Share it and tag ${ig ? `<b>${esc(ig)}</b> ` : ""}<b>${esc(S.hashtag)}</b></p>
      </div>
      <div class="btn-row"><a class="btn ghost small" href="#/secret">Back to the artist's note</a></div>
    </section>`;
    loadModelViewer().then(ok => {
      const mv = document.getElementById("mv"); if (!mv) return;
      if (!ok) { mv.outerHTML = `<p class="muted">The 3D viewer couldn't load on this connection.</p>`; return; }
      mv.addEventListener("ar-status", e => { if (e.detail.status === "session-started") track("ar_open", { character: "everyone", size: small ? "tabletop" : "life" }); });
      const go = document.getElementById("arGo");
      const showIfAR = () => { if (go && mv.canActivateAR) go.hidden = false; };
      mv.addEventListener("load", showIfAR); setTimeout(showIfAR, 400);
      const who = { name: "everyone", spot: { giantFeet: 30 } };
      if (go) go.addEventListener("click", () => {
        if (store.get("arTipSeen")) { try { mv.activateAR(); } catch (e) { toast("AR isn't available in this browser."); } }
        else arTip(who, !small, mv);
      });
    });
  }

  // Native AR viewers (iPhone Quick Look, Android Scene Viewer) give almost no guidance,
  // so explain the three moves right before the camera opens.
  function arTip(c, giant, mv) {
    const back = giant ? `walk back about ${len(c.spot.giantFeet, true)} and look up` : "step back for a photo";
    openModal(`<div class="ar-tip">
      <div class="eyebrow">Before the camera opens</div>
      <h3>Placing ${esc(c.name)}</h3>
      <ol>
        <li><b>Point your camera at the ground</b> a few steps ahead.</li>
        <li><b>Move your phone slowly</b> side to side until ${esc(c.name)} appears.</li>
        <li><b>Tap ${esc(c.name)}</b> (or the screen) to place them, then ${back}.</li>
      </ol>
      <p class="muted" style="font-size:14px;margin:10px 0 0">Pinch to rotate, and use your camera button to snap a photo. Tag ${esc(S.hashtag)}!</p>
      <div class="btn-row center" style="margin-top:16px"><button class="btn red" id="arOpen">Open camera</button></div>
    </div>`);
    const open = document.getElementById("arOpen");
    if (open) open.addEventListener("click", () => {
      store.set("arTipSeen", true);
      closeModal();
      try { mv.activateAR(); } catch (e) { toast("AR isn't available in this browser."); }
    });
  }

  /* ---------------- Results (popularity cloud) ---------------- */
  const SAMPLE = { source: "none", counts: {} }; // if results can't load, show the starting seed only
  let cloudItems = null, resizeTimer;
  async function pageResults() {
    app.innerHTML = `<section style="padding-top:28px" class="center">
      <div class="eyebrow">Who is San Francisco?</div>
      <h2>The city, by character</h2>
      <p class="muted" id="resMeta">Loading…</p>
      <div class="cloud" id="cloud"></div>
    </section>
    <section style="max-width:640px;margin:0 auto"><ul class="rank" id="rank"></ul></section>
    <p class="center" style="margin-top:28px"><a class="btn red" href="#/quiz">${myResult() ? "Retake the quiz" : "Add yourself — take the quiz"}</a></p>`;
    let data = null;
    for (const url of (S.resultsDataUrls || [S.resultsDataUrl || "data/results.json"])) {
      try {
        const r = await fetch(url + (url.includes("?") ? "&" : "?") + "t=" + Date.now(), { cache: "no-store" });
        if (!r.ok) throw new Error(r.status);
        const d = await r.json();
        if (d && d.counts) { data = d; break; }
      } catch (e) { /* try the next address */ }
    }
    if (!data) data = SAMPLE;
    // Starting seed (settings.resultsSeed) is added on screen only, so the page never
    // shows all zeros at launch. Google Analytics data stays real and unseeded.
    const seed = S.resultsSeed || {}, raw = data.counts || {}, counts = {};
    chars.forEach(c => { counts[c.id] = (raw[c.id] || 0) + (seed[c.id] || 0); });
    const total = chars.reduce((s, c) => s + (counts[c.id] || 0), 0) || 1;
    const imgs = await Promise.all(chars.map(c => loadImg(ART_PNG(c.id)).catch(() => null)));
    cloudItems = chars.map((c, i) => ({ c, count: counts[c.id] || 0, pct: (counts[c.id] || 0) / total, aspect: imgs[i] ? imgs[i].naturalWidth / imgs[i].naturalHeight : .7 }))
      .sort((a, b) => b.count - a.count);
    const meta = document.getElementById("resMeta"); if (!meta) return;
    meta.innerHTML = data.source === "google-analytics" && data.updated
      ? `Updated ${new Date(data.updated).toLocaleString([], { dateStyle: "medium", timeStyle: "short" })}`
      : "";
    drawCloud();
    const me = myResult();
    const maxC = Math.max(1, ...cloudItems.map(it => it.count));
    // listed in character order (not by popularity), so it isn't a ranking
    document.getElementById("rank").innerHTML = cloudItems.slice().sort((a, b) => a.c.index - b.c.index).map(it => `
      <li><span class="dot" style="--c:${esc(it.c.colorHex)}"></span><a href="#/c/${it.c.id}">${esc(it.c.name)}${it.c.id === me ? ' <span class="badge mine">You</span>' : ""}</a>
      <span class="bar" style="--c:${esc(it.c.colorHex)}"><i style="width:${(it.count / maxC) * 100}%"></i></span>
      <span class="muted">${Math.round(it.pct * 100)}%</span></li>`).join("");
  }
  // Cloud layout: everyone together in one loose crowd, sized by popularity but placed
  // in a fixed mixed-up order, so it reads as a crowd, not a leaderboard.
  // Sizing evens out demit's art: wide or seated characters (like Ash) aren't drawn
  // smaller just because of their shape.
  function drawCloud(redraw) {
    const el = document.getElementById("cloud"); if (!el || !cloudItems) return;
    const W = el.clientWidth || 360;
    cloudWidth = el.clientWidth;
    el.classList.toggle("no-anim", !!redraw);
    const maxCount = Math.max(1, ...cloudItems.map(it => it.count));
    const maxH = Math.min(W * 0.42, 250), minH = Math.min(W * 0.21, 112);
    const me = myResult();
    // a fixed, mixed-up order (the same as the home page parade), never sorted by popularity
    const MIX = ["rebel", "flora", "captain", "lorey", "sol", "ocean", "compass", "pixie", "sequoia", "flow", "atlas", "ash", "rascal"];
    const order = cloudItems.slice().sort((a, b) => (MIX.indexOf(a.c.id) + 99) % 99 - (MIX.indexOf(b.c.id) + 99) % 99);
    el.innerHTML = order.map((it, i) => {
      const t = Math.sqrt(it.count / maxCount);
      let h = (minH + (maxH - minH) * t) * Math.pow(.72 / it.aspect, .35); // even out tall vs. wide art
      h = Math.min(h, (W * .46) / it.aspect);
      const rot = Math.round((wob(it.c.index, 4) - .5) * 10), dy = Math.round((wob(it.c.index, 5) - .5) * 24);
      const fs = Math.max(13, Math.min(18, 9 + h / 16));
      return `<a href="#/c/${it.c.id}" class="${it.c.id === me ? "you" : ""}" style="--r:${rot}deg;--y:${dy}px">
        <img src="${ART(it.c.id)}" alt="" style="--d:${(i * .06).toFixed(2)}s;height:${Math.round(h)}px">
        <div class="lbl" style="font-size:${fs}px">${esc(it.c.name)} <span>${Math.round(it.pct * 100)}%</span></div>
      </a>`;
    }).join("");
  }
  // Phones fire "resize" while scrolling (the address bar slides in and out), so only
  // redraw the cloud when the width actually changes, e.g. rotating the phone.
  let cloudWidth = 0;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      const el = document.getElementById("cloud");
      if (el && el.clientWidth !== cloudWidth) drawCloud(true);
    }, 200);
  });

  /* ---------------- Gift Tickets ---------------- */
  // A claim code is made once, when all 13 are found for real (never in test mode), and kept on
  // this device (and in save links). It records the hunt's timing; see js/giftcode.js.
  function ensureGiftCode() {
    if (isTest() || !window.GiftCode || foundCount() < TOTAL) return null;
    let code = store.get("giftCode");
    if (code && GiftCode.decode(code).ok) return code;
    const f = store.get("found", {});
    const finds = chars.filter(c => f[c.id]).map(c => ({ t: f[c.id], lat: c.spot.lat, lng: c.spot.lng }));
    code = GiftCode.make(finds);
    store.set("giftCode", code);
    return code;
  }
  let resultsCache = null;
  async function loadResultsData() {
    if (resultsCache) return resultsCache;
    for (const url of (S.resultsDataUrls || [S.resultsDataUrl || "data/results.json"])) {
      try {
        const r = await fetch(url + (url.includes("?") ? "&" : "?") + "t=" + Date.now(), { cache: "no-store" });
        if (!r.ok) throw new Error(r.status);
        const d = await r.json();
        if (d && d.counts) return (resultsCache = d);
      } catch (e) { /* try the next address */ }
    }
    return null;
  }
  async function giftsLeft() {
    const total = S.giftTotal || 100;
    if (typeof S.giftsLeft === "number") return Math.max(0, Math.min(total, S.giftsLeft));
    const d = await loadResultsData();
    if (!d || typeof d.completions !== "number") return null;
    return Math.max(0, total - d.completions);
  }
  function giftCardHTML() {
    if (!S.giftClaimUrl) return "";
    const code = isTest() ? "384-TEST-TEST-TEST-TEST" : ensureGiftCode();
    if (!code) return "";
    const total = S.giftTotal || 100;
    return `<section class="gift-card" id="giftCard">
      <div class="gift-head"><img src="${ART("rascal")}" alt="" aria-hidden="true"><div>
        <div class="eyebrow">Your reward</div>
        <h2>You earned a Gift Ticket!</h2>
        <p>You're one of the few who found every Character! Claim your Gift Ticket: if thank-you gifts from ${esc(S.artist)} are offered, they'll go to up to ${total} hunters, first come, while supplies last. We'll email you if and when gifts are ready. <a href="#/terms">Terms apply.</a></p>
        <p class="gift-left" id="giftLeft" hidden></p>
      </div></div>
      <div class="gift-code-box">
        <small>Your claim code${isTest() ? " (test mode: not a real code)" : ""}</small>
        <code id="giftCode">${esc(code)}</code>
        <button class="btn small ghost" id="giftCopy">Copy code</button>
      </div>
      <div class="btn-row center" id="giftActions">
        <a class="btn red" id="giftClaim" href="${esc(S.giftClaimUrl + (S.giftClaimCodeField ? (S.giftClaimUrl.includes("?") ? "&" : "?") + S.giftClaimCodeField + "=" + encodeURIComponent(code) : ""))}" target="_blank" rel="noopener">Claim your Gift Ticket</a>
      </div>
      <p class="muted gift-help">${S.giftClaimCodeField ? "Your code fills in on the form automatically. " : "Paste your code into the form's first question. "}Keep it somewhere safe. One per person; we review every claim. A claim isn't a guarantee of a gift. <a href="#/terms">Terms apply.</a></p>
    </section>`;
  }
  function wireGiftCard() {
    const card = document.getElementById("giftCard"); if (!card) return;
    const code = document.getElementById("giftCode").textContent;
    const copy = async (quiet) => {
      try { await navigator.clipboard.writeText(code); if (!quiet) toast("Code copied!"); return true; }
      catch (e) { if (!quiet) toast("Press and hold the code to copy it"); return false; }
    };
    document.getElementById("giftCopy").onclick = () => copy(false);
    document.getElementById("giftClaim").addEventListener("click", () => {
      copy(true).then(ok => ok && !S.giftClaimCodeField && toast("Code copied: paste it into the form"));
      track("gift_claim_click", isTest() ? {} : { claim_code: code });
    });
    giftsLeft().then(left => {
      const total = S.giftTotal || 100, el = document.getElementById("giftLeft"); if (!el || left == null) return;
      el.hidden = false;
      if (left > 0) { el.innerHTML = `<b>${left} of ${total}</b> Gift Tickets left`; return; }
      el.innerHTML = `<b>All ${total} Gift Tickets have been claimed.</b> You're still one of the few who found every Character! Keep your code: if any more become available, we'll share it on @demit.`;
      const a = document.getElementById("giftActions"); if (a) a.remove();
      card.classList.add("gone");
    });
  }

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
    const v = S.secretVideoUrl, note = S.artistNote;
    app.innerHTML = `<section class="secret">
      <div class="eyebrow">All ${TOTAL} found</div>
      <h1>You found every character</h1>
      ${giftCardHTML()}
      <div class="finale">
        <div class="finale-art" aria-hidden="true">${["rebel", "flora", "sol", "rascal", "ash"].map(id => `<img src="${ART(id)}" alt="">`).join("")}</div>
        <h2>Everyone, together</h2>
        <p>You've earned the finale: all ${TOTAL} characters at once, life-size in augmented reality. Line up for a group photo!</p>
        <a class="btn red" href="#/everyone">See all ${TOTAL} in AR</a>
      </div>
      ${v ? `<div class="video"><iframe src="${esc(v)}" title="A message from ${esc(S.artist)}" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe></div>` : ""}
      ${note ? `<article class="artist-note">
        <div class="eyebrow">A special note from the artist</div>
        <h2>${esc(note.title)}</h2>
        ${(note.paragraphs || []).map(p => `<p>${esc(p)}</p>`).join("")}
        ${note.thanks ? `<p class="note-thanks">${esc(note.thanks)}</p>` : ""}
        <p class="sig">— ${esc(S.artist)}</p>
        ${artistLinks()}
      </article>` : (!v ? `<div class="video"><div class="ph"><div><h3>A message from ${esc(S.artist)} is on its way ✦</h3><p>Check back soon.</p></div></div></div>` : "")}
      <div class="btn-row center"><a class="btn" href="#/results">See who SF is</a><a class="btn ghost" href="#/characters">All characters</a></div>
      ${S.contactFormUrl ? `<p class="center muted" style="margin-top:18px">Want to hear what ${esc(S.artist)} makes next? <a href="${esc(S.contactFormUrl)}" target="_blank" rel="noopener">Stay in touch</a></p>` : ""}
    </section>`;
    wireGiftCard();
    confetti();
    track("secret_video_view", {});
  }

  function pageTerms() {
    const who = `CBRE, Inc., the owner of 384 Post Street, ${esc(S.artist)}, and each of their parents, affiliates, officers, directors, employees, agents, contractors and partners (together, the "Released Parties")`;
    app.innerHTML = `<section class="legal">
      <div class="eyebrow">Last updated October 2026</div>
      <h2>Terms of use &amp; privacy</h2>
      <p>This site is an interactive art experience featuring the Characters of San Francisco, a mural by ${esc(S.artist)} at 384 Post Street, presented by CBRE, Inc. ("CBRE," "we," "us"). By using this site, taking the quiz, joining the hunt, using the augmented reality (AR) features or submitting a form, you agree to these terms. If you don't agree, please don't use the site.</p>

      <h3>Just for fun; no offer or obligation</h3>
      <p>Everything on this site, including the quiz, results, hunt, mural objects, AR features, downloads, Gift Tickets and any rewards, is offered for entertainment only, free of charge, as a courtesy. Nothing on this site is an offer, promise, contract or commitment of any kind, and using the site does not create any agreement, partnership, employment, agency or other relationship between you and any Released Party, other than your agreement to these terms. Nothing on this site is an offer to lease, a solicitation, or real estate, financial, legal or professional advice. Quiz results are not a personality assessment, and popularity counts are approximate and anonymous.</p>

      <h3>The hunt and AR: please be safe</h3>
      <p>Taking part in the hunt and using AR is entirely voluntary and at your own risk. You are solely responsible for your own safety, conduct, travel and costs, and for anyone in your care. Stay aware of your surroundings, follow traffic laws and posted rules, keep to public sidewalks and paths, respect private property and other people, and never use your phone in the street or while driving or riding. Don't enter closed, restricted, unsafe or paid areas to find a character. Hunt locations are public places that the Released Parties don't own, operate or control, and they are not affiliated with or endorsed by those places; access, hours, conditions and safety can change at any time, and spots may be moved or removed without notice. GPS, maps, distances and AR placement may be inaccurate, and features may not work on every device, browser or network. Minors should take part only with the permission and supervision of a parent or guardian.</p>

      ${S.giftClaimUrl ? `<h3>Gift Tickets and rewards</h3>
      <p>Gift Tickets, the icon pack, the finale and any other rewards are discretionary thank-you gestures, not prizes, and not an offer or contract. No purchase is necessary, and nothing of value is required to take part. A claim code or claim form submission is not a guarantee of any gift; it only lets us consider your claim if and when gifts are available. We may, at any time and for any reason, without notice or liability, decide not to provide gifts, change their number, type, timing or availability, substitute something else, or end the Gift Ticket program.</p>
      <p>If gifts are offered, they are limited (up to ${S.giftTotal || 100}), go to eligible claims in the order we receive them, while supplies last, and are limited to one per person, household and mailing address. To claim, you must be at least 18 years old (or have a parent or guardian submit the claim on your behalf) and, for anything mailed, have a mailing address in the United States. Void where prohibited or restricted. We check every claim and may, in our sole discretion, decline any claim we believe is duplicated, altered, automated, made with false location data or otherwise not made in good faith; our decisions are final. The "Gift Tickets left" count is an estimate only. Gifts have no cash value and may not be exchanged, transferred or sold. You are responsible for any taxes. We are not responsible for lost, late, incomplete or misdirected claims, emails or deliveries, or for technical problems of any kind.</p>` : ""}

      <h3>Your content and social posts</h3>
      <p>If you share photos, results or posts (for example, tagging @demit or using our hashtags), you're responsible for what you post and for having permission from anyone shown. You agree that the Released Parties may, but are never required to, view, like, comment on or reshare publicly posted content that tags or mentions this project, with credit to you where practical, without payment. We don't endorse user content.</p>

      <h3>Artwork and content</h3>
      <p>${esc(S.artworkNotice || "")} The site's design, text, code and other content are protected by copyright and other laws and may not be copied or reused without permission, except that downloads we offer (such as the icon pack) may be used for personal, non-commercial purposes as described in the download. "384 Post," "CBRE" and related names and logos are trademarks of their owners. No other license or right is granted.</p>

      <h3>No warranties</h3>
      <p>To the fullest extent permitted by law, this site and everything on or available through it (including saved progress, unlocks, claim codes, rewards, results, downloads and AR) are provided "as is" and "as available," with all faults and without warranties of any kind, whether express, implied or statutory, including any warranties of merchantability, fitness for a particular purpose, title, non-infringement, accuracy, availability or that the site is free of errors, viruses or other harmful components. We may change, suspend or end any part of the site, the hunt or any reward at any time without notice or liability.</p>

      <h3>Limitation of liability</h3>
      <p>To the fullest extent permitted by law, the Released Parties are not liable for any direct, indirect, incidental, special, consequential, exemplary or punitive damages, or for any injury, illness, death, property damage, loss of data, progress or rewards, or any other loss, cost or expense of any kind, arising out of or related to this site, the hunt, AR, any reward or these terms, even if advised of the possibility of such damages and whatever the legal theory. If any Released Party is found liable despite this, its total liability will not exceed fifty U.S. dollars (US $50). Some places don't allow certain limitations, so some of these may not apply to you.</p>

      <h3>Release and indemnity</h3>
      <p>To the fullest extent permitted by law, you release ${who} from all claims, damages and liabilities arising out of or related to your use of this site, participation in the hunt or AR, or any reward. You agree to defend, indemnify and hold harmless the Released Parties from any claims, losses, costs and expenses (including reasonable attorneys' fees) arising from your use of the site, your conduct, your content or your breach of these terms. If you are a California resident, you waive California Civil Code Section 1542, which says: "A general release does not extend to claims that the creditor or releasing party does not know or suspect to exist in his or her favor at the time of executing the release and that, if known by him or her, would have materially affected his or her settlement with the debtor or released party," and any similar law elsewhere.</p>

      <h3>Other services and links</h3>
      <p>This site uses or links to services run by others, including Mapbox (maps), Google Maps (walking directions), Google Analytics, Microsoft Forms, social networks and Ceros. We don't control them and aren't responsible for them; their own terms and privacy policies apply when you use them.</p>

      <h3 id="privacy">Privacy</h3>
      <ul>
        ${S.contactFormUrl || S.giftClaimUrl
          ? `<li><b>Contact details only if you choose to share them.</b> The site itself doesn't collect your name or email.${S.contactFormUrl ? ` If you sign up through our "Stay in touch" form, we receive what you enter there and use it only for the updates you check on the form. You can ask to stop receiving updates at any time.` : ""}${S.giftClaimUrl ? ` If you claim a Gift Ticket, we use what you enter on the claim form only to review your claim and, if gifts are offered, to contact you and arrange your gift; if we need a mailing address, we'll ask for it then.` : ""} Both forms are run on Microsoft Forms. Please don't submit a form if you are under 13.</li>`
          : `<li><b>We don't ask for or collect your name, email or contact details.</b></li>`}
        <li><b>Your location stays on your phone.</b> It's used only in your browser to unlock nearby characters and is never sent to us.</li>
        <li><b>Your quiz result, hunt progress and mural finds are saved only in your browser</b> on your device. Clearing your browser data deletes them, and we can't recover them.${S.giftClaimUrl ? ` If you find every character, your Gift Ticket claim code (which records when your hunt started and how long it took, not where you were) is saved there too and counted anonymously in our usage statistics.` : ""}</li>
        <li><b>Anonymous usage statistics.</b> We use Google Analytics, which sets cookies, to count visits and actions such as quiz results, characters and mural objects found, shares and AR views. Advertising features are turned off. You can block analytics cookies in your browser settings or with Google's <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener">opt-out add-on</a>.</li>
        <li><b>Maps.</b> Mapbox provides the hunt map and receives standard technical information (such as your IP address and device type) needed to load it.</li>
      </ul>
      <p>For more about how CBRE handles personal information, including your privacy rights, see the ${S.privacyPolicyUrl ? `<a href="${esc(S.privacyPolicyUrl)}" target="_blank" rel="noopener">CBRE Global Web Privacy &amp; Cookie Policy</a>` : "CBRE privacy policy"}${S.californiaPrivacyUrl ? ` and the <a href="${esc(S.californiaPrivacyUrl)}" target="_blank" rel="noopener">CBRE California Privacy Policy</a>` : ""}.</p>

      <h3>General</h3>
      <p>These terms are governed by the laws of the State of California, without regard to its conflict-of-law rules, and any dispute will be brought only in the state or federal courts located in San Francisco County, California. If any part of these terms is found unenforceable, the rest stays in effect. Our not enforcing a term is not a waiver. These terms are the entire agreement about the site and replace any earlier statements, posts or messages about it. You may not transfer your rights under these terms. We may update these terms at any time by posting a new version here; the date above shows the latest version, and continuing to use the site means you accept the changes.</p>
      <p>${S.termsContactEmail ? `Questions? <a href="mailto:${esc(S.termsContactEmail)}">Contact us</a>.` : ""}</p>
    </section>`;
    if (location.hash.includes("#privacy")) setTimeout(() => { const el = document.getElementById("privacy"); if (el) el.scrollIntoView(); }, 50);
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
    [/^mural$/, pageMural],
    [/^everyone(?:\/(tabletop))?$/, pageEveryone],
    [/^results$/, pageResults],
    [/^secret$/, pageSecret],
    [/^restore\/([\w-]+)$/, pageRestore],
    [/^test$/, pageToggleTest],
    [/^terms(?:#privacy)?$/, pageTerms]
  ];
  function route() {
    cleanupHunt();
    if (!modalEl.hidden) { modalQueue.length = 0; closeModal(); }
    document.getElementById("testBanner").hidden = !isTest();
    const path = location.hash.replace(/^#\/?/, "");
    const section = path.split("/")[0];
    const navMap = { result: "quiz", c: "characters", ar: "hunt", secret: "hunt", mural: "hunt", everyone: "hunt" };
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
