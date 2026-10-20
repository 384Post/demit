/* Gift Ticket claim codes — shared by the site (js/app.js) and the private checker page.

   A code looks like 384-7KQM-2XRA-H4TP-9DWE and quietly records the hunt that earned it:
     • when the first character was found      (minutes since Oct 1 2026, 20 bits)
     • how long the whole hunt took            (minutes from first to last find, 20 bits)
     • "impossible hops"                       (finds too far apart for the time between them, 4 bits)
     • a random number                         (16 bits, so two people never share a code)
     • a check value                           (20 bits, catches typos and made-up codes)
   This is a deterrent, not bank-grade security: anyone determined could read this file.
   Final judgment (and duplicates) are checked by a person with the checker page. */
(function (root) {
  "use strict";
  const ALPHA = "0123456789ABCDEFGHJKMNPQRSTVWXYZ"; // Crockford base32: no I, L, O, U
  const EPOCH = Date.UTC(2026, 9, 1);              // Oct 1 2026
  const SALT = "384post-demit-gift";
  const MAX20 = (1 << 20) - 1;

  function hash32(str) { // FNV-1a + avalanche
    let h = 0x811c9dc5;
    for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; }
    h ^= h >>> 16; h = Math.imul(h, 0x85ebca6b) >>> 0; h ^= h >>> 13; h = Math.imul(h, 0xc2b2ae35) >>> 0; h ^= h >>> 16;
    return h >>> 0;
  }
  function distKm(a, b) {
    const R = 6371, r = x => x * Math.PI / 180;
    const dLat = r(b.lat - a.lat), dLng = r(b.lng - a.lng);
    const s = Math.sin(dLat / 2) ** 2 + Math.cos(r(a.lat)) * Math.cos(r(b.lat)) * Math.sin(dLng / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(s));
  }
  // finds: [{t: ms timestamp, lat, lng}]
  function fastHops(finds) {
    const f = finds.slice().sort((a, b) => a.t - b.t);
    let n = 0;
    for (let i = 1; i < f.length; i++) {
      const km = distKm(f[i - 1], f[i]), hrs = Math.max(0, f[i].t - f[i - 1].t) / 3.6e6;
      if (km > 1.5 && (hrs === 0 || km / hrs > 80)) n++; // faster than ~50 mph across the city
    }
    return Math.min(n, 15);
  }
  function check(start, span, fast, rnd) { return hash32(SALT + ":" + start + ":" + span + ":" + fast + ":" + rnd) & MAX20; }
  function mask(rnd) { // keystream so codes look random
    const a = hash32(SALT + "#a" + rnd), b = hash32(SALT + "#b" + rnd);
    return (BigInt(a) << 32n) | BigInt(b);
  }

  function make(finds, rnd) {
    const ts = finds.map(f => f.t);
    const first = Math.min(...ts), last = Math.max(...ts);
    const start = Math.max(0, Math.min(MAX20, Math.floor((first - EPOCH) / 60000)));
    const span = Math.max(0, Math.min(MAX20, Math.round((last - first) / 60000)));
    const fast = fastHops(finds);
    if (rnd == null) rnd = Math.floor(Math.random() * 65536);
    rnd &= 0xffff;
    let body = (BigInt(start) << 24n) | (BigInt(span) << 4n) | BigInt(fast); // 44 bits
    body ^= mask(rnd) & ((1n << 44n) - 1n);
    let n = (body << 36n) | (BigInt(rnd) << 20n) | BigInt(check(start, span, fast, rnd)); // 80 bits
    let s = "";
    for (let i = 0; i < 16; i++) { s = ALPHA[Number(n & 31n)] + s; n >>= 5n; }
    return "384-" + s.match(/.{4}/g).join("-");
  }

  function normalize(code) {
    return String(code || "").toUpperCase().replace(/^\s*384/, "").replace(/[^0-9A-Z]/g, "")
      .replace(/O/g, "0").replace(/[IL]/g, "1").replace(/U/g, "V");
  }
  function decode(code) {
    const s = normalize(code);
    if (s.length !== 16) return { ok: false, reason: "Wrong length (should be 384 + 16 letters/numbers)" };
    let n = 0n;
    for (const ch of s) { const v = ALPHA.indexOf(ch); if (v < 0) return { ok: false, reason: "Has a character codes never use" }; n = (n << 5n) | BigInt(v); }
    const chk = Number(n & BigInt(MAX20)), rnd = Number((n >> 20n) & 0xffffn);
    let body = (n >> 36n) ^ (mask(rnd) & ((1n << 44n) - 1n));
    const fast = Number(body & 15n), span = Number((body >> 4n) & BigInt(MAX20)), start = Number((body >> 24n) & BigInt(MAX20));
    if (check(start, span, fast, rnd) !== chk) return { ok: false, reason: "Check value doesn't match: typo or made-up code" };
    const first = new Date(EPOCH + start * 60000);
    return { ok: true, code: "384-" + s.match(/.{4}/g).join("-"), first, last: new Date(first.getTime() + span * 60000), spanMinutes: span, fastHops: fast, rnd };
  }

  root.GiftCode = { make, decode, normalize, fastHops };
})(typeof window !== "undefined" ? window : globalThis);
