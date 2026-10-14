"""Builds the link-preview images and pages that social sites read when someone shares.

  python3 tools/make_share_pages.py

Run it from the project folder whenever you change:
  - siteUrl in data/config.js (link previews need the full, real web address)
  - a character's name / archetype / color, or the character art

It creates:
  assets/share/<id>.png      1200x630 preview image per character (shows on X, Facebook, LinkedIn, Bluesky)
  assets/share/og-default.png preview image for the main site link
  share/<id>.html            tiny page with the preview tags; visitors are forwarded to shareLandingUrl (or cerosUrl)
and updates the preview tags in index.html.

Needs Python 3 + Pillow (pip install pillow).
"""
import os, re, html
from PIL import Image, ImageDraw, ImageFont

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FONTS = os.path.join(ROOT, "tools", "fonts")
INK, PAPER, SOFT = (27, 26, 23), (251, 247, 234), (94, 90, 80)


def font(name, size):
    return ImageFont.truetype(os.path.join(FONTS, name), size)


def read_config():
    src = open(os.path.join(ROOT, "data", "config.js"), encoding="utf-8").read()
    get = lambda key: re.search(key + r':\s*"([^"]*)"', src).group(1)
    settings = {k: get(k) for k in ("siteUrl", "cerosUrl", "artist", "imageHashtag")}
    m = re.search(r'shareLandingUrl:\s*"([^"]*)"', src)
    settings["shareLandingUrl"] = m.group(1) if m else ""
    m = re.search(r'shareLandingUrl:\s*"([^"]*)"', src)
    settings["shareLandingUrl"] = m.group(1) if m else ""
    chars = []
    for block in re.split(r"\n\s*\{\s*\n\s*id:", src)[1:]:
        block = "id:" + block
        f = lambda k: re.search(k + r':\s*"([^"]*)"', block).group(1)
        chars.append({k: f(k) for k in ("id", "archetype", "name", "element", "colorHex")})
    if not settings["siteUrl"].endswith("/"):
        settings["siteUrl"] += "/"
    return settings, chars


def hex2rgb(h):
    h = h.lstrip("#"); return tuple(int(h[i:i + 2], 16) for i in (0, 2, 4))


def fit_font(d, text, name, start, max_w):
    size = start
    while size > 30:
        f = font(name, size)
        if d.textlength(text, font=f) <= max_w:
            return f
        size -= 4
    return font(name, size)


def character_card(c, s):
    W, H = 1200, 630
    im = Image.new("RGB", (W, H), PAPER)
    d = ImageDraw.Draw(im)
    # color panel with the character
    d.rounded_rectangle((40, 40, 560, 590), radius=44, fill=hex2rgb(c["colorHex"]), outline=INK, width=6)
    d.ellipse((90, 105, 510, 525), fill=tuple(int(a * .45 + b * .55) for a, b in zip(hex2rgb(c["colorHex"]), PAPER)))
    art = Image.open(os.path.join(ROOT, "assets", "characters", c["id"] + ".png")).convert("RGBA")
    art.thumbnail((440, 480), Image.LANCZOS)
    im.paste(art, (300 - art.width // 2, 315 - art.height // 2), art)
    # text
    x = 610
    d.text((x, 92), "WHICH CHARACTER ARE YOU?", font=font("SourceSans3-700.woff", 24), fill=SOFT)
    d.text((x, 150), "I'm", font=font("Bricolage-700.woff", 50), fill=INK)
    nf = fit_font(d, c["name"], "Bricolage-800.woff", 150, W - x - 40)
    d.text((x - 6, 195), c["name"], font=nf, fill=INK)
    af = fit_font(d, c["archetype"].upper(), "SourceSans3-700.woff", 34, W - x - 40)
    d.text((x, 375), c["archetype"].upper(), font=af, fill=SOFT)
    d.text((x, 420), c["element"], font=font("SourceSans3-600.woff", 30), fill=SOFT)
    d.line((x, 488, W - 50, 488), fill=INK, width=3)
    paste_lettering(im, x, 508, W - x - 50, 44)
    d.text((x, 562), s["imageHashtag"] + " · Union Square · mural by " + s["artist"], font=font("SourceSans3-600.woff", 22), fill=SOFT)
    return im


def paste_lettering(im, x, y, max_w, max_h, center_w=None):
    """demit's hand-drawn '384 POST ST' lettering."""
    lt = Image.open(os.path.join(ROOT, "assets", "brand", "384-post-lettering.png")).convert("RGBA")
    lt.thumbnail((max_w, max_h), Image.LANCZOS)
    if center_w: x = (center_w - lt.width) // 2
    im.paste(lt, (int(x), int(y)), lt)
    return lt.width


def default_card(chars, s):
    W, H = 1200, 630
    im = Image.new("RGB", (W, H), PAPER)
    d = ImageDraw.Draw(im)
    lw = paste_lettering(im, None, 34, 560, 56, center_w=W)
    tf = font("Bricolage-800.woff", 64)
    d.text((W / 2, 118), "Which character", font=tf, fill=INK, anchor="mt")
    d.text((W / 2, 186), "are you?", font=tf, fill=(220, 74, 78), anchor="mt")
    order = ["rascal", "flora", "captain", "lorey", "sol", "ocean", "pixie", "sequoia", "flow", "atlas", "rebel", "ash", "compass"]
    heights = [200, 215, 240, 205, 255, 225, 210, 200, 230, 205, 245, 200, 190]
    for i, cid in enumerate(order):
        art = Image.open(os.path.join(ROOT, "assets", "characters", cid + ".png")).convert("RGBA")
        art.thumbnail((260, heights[i]), Image.LANCZOS)
        cx = 70 + i * (W - 140) / (len(order) - 1)
        im.paste(art, (int(cx - art.width / 2), 560 - art.height), art)
    d.text((W / 2, 585), s["imageHashtag"] + " · Union Square · mural by " + s["artist"], font=font("SourceSans3-700.woff", 26), fill=INK, anchor="mt")
    return im


PAGE = """<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{title}</title>
<meta name="description" content="{desc}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="Characters of San Francisco · 384 Post">
<meta property="og:title" content="{title}">
<meta property="og:description" content="{desc}">
<meta property="og:url" content="{url}">
<meta property="og:image" content="{img}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="{alt}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="{title}">
<meta name="twitter:description" content="{desc}">
<meta name="twitter:image" content="{img}">
<link rel="canonical" href="{url}">
<meta http-equiv="refresh" content="0; url={dest}">
<style>body{{font-family:system-ui,sans-serif;background:#FBF7EA;color:#1B1A17;display:grid;place-items:center;min-height:90vh}}</style>
</head>
<body>
<p><a href="{dest}">Meet {name} at 384 Post →</a></p>
<script>location.replace("{dest}");</script>
</body>
</html>
"""


def main():
    s, chars = read_config()
    site = s["siteUrl"]
    os.makedirs(os.path.join(ROOT, "assets", "share"), exist_ok=True)
    os.makedirs(os.path.join(ROOT, "share"), exist_ok=True)
    desc = f"Which of {s['artist']}'s Characters of San Francisco are you? Take the quiz at 384 Post in Union Square. {s['imageHashtag']}"
    for c in chars:
        character_card(c, s).save(os.path.join(ROOT, "assets", "share", c["id"] + ".png"), optimize=True)
        page = PAGE.format(
            title=html.escape(f"I'm {c['name']}, {c['archetype']}"), desc=html.escape(desc),
            url=f"{site}share/{c['id']}.html", img=f"{site}assets/share/{c['id']}.png",
            alt=html.escape(f"{c['name']}, {c['archetype']}, a character by {s['artist']}"),
            id=c["id"], name=html.escape(c["name"]), dest=html.escape(s["shareLandingUrl"] or s["cerosUrl"] or f"../#/c/{c['id']}"))
        open(os.path.join(ROOT, "share", c["id"] + ".html"), "w", encoding="utf-8").write(page)
    default_card(chars, s).save(os.path.join(ROOT, "assets", "share", "og-default.png"), optimize=True)

    # point the main page's preview tags at the full address
    p = os.path.join(ROOT, "index.html")
    idx = open(p, encoding="utf-8").read()
    idx = re.sub(r'<meta property="og:image" content="[^"]*">\n(  <meta property="og:url"[^\n]*\n  <meta name="twitter:card"[^\n]*\n)?',
                 f'<meta property="og:image" content="{site}assets/share/og-default.png">\n'
                 f'  <meta property="og:url" content="{site}">\n'
                 f'  <meta name="twitter:card" content="summary_large_image">\n', idx, count=1)
    open(p, "w", encoding="utf-8").write(idx)
    print(f"Built {len(chars)} share pages for {site}")
    if "example.github.io" in site:
        print("NOTE: siteUrl is still the placeholder — set it in data/config.js and run this again before launch.")


if __name__ == "__main__":
    main()
