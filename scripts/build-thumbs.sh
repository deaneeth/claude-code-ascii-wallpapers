#!/bin/bash
# Renders every scene to a JPEG at a chosen moment of its animation, then packs small thumbnails into hooks/thumbs.js
# (the picker shows them). Needs node, ImageMagick (convert) and a Chromium. Snap Chromium can only read
# non-hidden folders, so the work happens in $THUMB_TMP (default ~/asc-thumbs).
#   CHROME="snap run chromium" T=7 scripts/build-thumbs.sh [scene ...]
set -e
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
CHROME=${CHROME:-chromium}
T=${T:-7}
TMP=${THUMB_TMP:-$HOME/asc-thumbs}
mkdir -p "$TMP" "$ROOT/assets/thumbs"
cd "$ROOT"
KEYS=("$@")
if [ ${#KEYS[@]} -eq 0 ]; then
  KEYS=($(node -e "import('./hooks/art.js').then(m=>console.log(Object.keys(m.SCENES).join(' ')))" 2>/dev/null))
fi
for k in "${KEYS[@]}"; do
  at=$T; [ "$k" = "sketch" ] && at=18
  node -e "import('./hooks/art.js').then(m=>require('fs').writeFileSync('$TMP/$k.svg', m.SCENES['$k']('dev')))" 2>/dev/null
  { echo '<!doctype html><html><body style="margin:0;background:#000;width:1920px;height:1080px;overflow:hidden">'; cat "$TMP/$k.svg"; echo "<script>const t=$at*1000;function go(){document.getAnimations().forEach(a=>{a.pause();a.currentTime=t})}go();setTimeout(go,50);</script></body></html>"; } > "$TMP/$k.html"
  $CHROME --headless --disable-gpu --no-sandbox --hide-scrollbars --virtual-time-budget=1500 --window-size=1920,1080 --screenshot="$TMP/$k.png" "file://$TMP/$k.html" >/dev/null 2>&1
  convert "$TMP/$k.png" -resize 640x360 -quality 82 "assets/thumbs/$k.jpg"
  convert "$TMP/$k.png" -resize 288x162 -quality 55 "$TMP/$k.mini.jpg"
  echo "$k"
done
node scripts/pack-thumbs.mjs "$TMP"
