"""Rebuild public/bcnearby from a new commute-final.html (the designer's demo package).

    python scripts/bcnearby/build_from_demo.py path/to/commute-final.html

Splits the one-file demo into styles, data and code, drops the demo-only parts (offline tiles, fake header),
and applies patch_engine.py so the map runs on our API. If the designer changed a line the patch relies on,
patch_engine.py stops with "expected 1 match(es)" and the line it could not find: update that one rule.
Vendor libraries (Leaflet, MapLibre) come from node_modules: node scripts/copy-bcnearby-vendor.mjs
"""
import os, re, subprocess, sys

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, "..", "..", "public", "bcnearby")
VER = "20261113ae"


def between(s, start, end, include_start=False):
    a = s.index(start); b = s.index(end, a + len(start))
    return s[a if include_start else a + len(start): b]


def main(path):
    html = open(path, encoding="utf-8").read()
    os.makedirs(OUT, exist_ok=True)

    # styles: the two <style> blocks after the pasted Leaflet CSS (PART 1 ... 1d)
    m = re.search(r"<style>\s*(/\* ######## PART 1: STYLES.*?)</style>", html, re.S)
    if not m: raise SystemExit("PART 1 styles not found")
    open(os.path.join(OUT, "bcnearby.css"), "w", encoding="utf-8").write(m.group(1))

    # data: every "const NAME = ..." line in the D4 block except the offline TILES
    d4 = between(html, "// ===== DEMO START (D4)", "// ===== DEMO END (D4)")
    data = [ln for ln in d4.split("\n") if re.match(r"const (DATA|ROUTES|AMEN|SCHOOLS|FLOOD) = ", ln)]
    if len(data) < 5: raise SystemExit("D4 data lines not found")
    open(os.path.join(OUT, "bcnearby-data.js"), "w", encoding="utf-8").write("/* BC Nearby data (SkyTrain, buses, places, schools, flood) */\n" + "\n".join(data) + "\n")

    # code: the script that starts with PART 4
    m = re.search(r"<script>\n(\(\(\) => \{\n  // ######## PART 4: MAIN CODE.*?)</script>", html, re.S)
    if not m: raise SystemExit("PART 4 script not found")
    src = os.path.join(OUT, "bcnearby.src.js")
    open(src, "w", encoding="utf-8").write(m.group(1))
    subprocess.check_call([sys.executable, os.path.join(HERE, "patch_engine.py"), src, os.path.join(OUT, "bcnearby.js")])
    os.remove(src)

    # markup: the map area, without the fake site header (D3)
    app = between(html, '<div class="app">', "<!-- ######## PART 3", include_start=True)
    app = re.sub(r"  <!-- ===== DEMO START \(D3\).*?<!-- ===== DEMO END \(D3\) ===== -->\n", "", app, flags=re.S)
    app = re.sub(r'<p class="lsm">.*?</p>', '<p class="lsm"></p>', app, count=1, flags=re.S)
    tpl = open(os.path.join(HERE, "index.template.html"), encoding="utf-8").read()
    open(os.path.join(OUT, "index.html"), "w", encoding="utf-8").write(tpl.replace("<!--APP-->", app.rstrip() + "\n").replace("{{VER}}", VER))
    print("public/bcnearby rebuilt from", path)


if __name__ == "__main__":
    main(sys.argv[1])
