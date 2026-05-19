#!/bin/bash
set -e
cd "$(dirname "$0")/.."
mkdir -p public/cards

BASE="https://upload.wikimedia.org/wikipedia/commons"

download() {
  local dest="public/cards/$1"
  local url="$BASE/$2"
  if [ ! -f "$dest" ]; then
    echo "Downloading $1..."
    curl -sL --retry 3 "$url" -o "$dest"
    # Verify it's actually an image (not a 404 HTML page)
    if ! file "$dest" | grep -qE "JPEG|image"; then
      echo "WARNING: $1 may not be a valid image. Check manually."
    fi
  else
    echo "Skipping $1 (already exists)"
  fi
}

download "00-fool.jpg"             "9/90/RWS_Tarot_00_Fool.jpg"
download "01-magician.jpg"         "d/de/RWS_Tarot_01_Magician.jpg"
download "02-high-priestess.jpg"   "8/88/RWS_Tarot_02_High_Priestess.jpg"
download "03-empress.jpg"          "d/d2/RWS_Tarot_03_Empress.jpg"
download "04-emperor.jpg"          "c/c3/RWS_Tarot_04_Emperor.jpg"
download "05-hierophant.jpg"       "8/8d/RWS_Tarot_05_Hierophant.jpg"
download "06-lovers.jpg"           "d/db/RWS_Tarot_06_Lovers.jpg"
download "07-chariot.jpg"          "9/9b/RWS_Tarot_07_Chariot.jpg"
download "08-strength.jpg"         "f/f5/RWS_Tarot_08_Strength.jpg"
download "09-hermit.jpg"           "4/4d/RWS_Tarot_09_Hermit.jpg"
download "10-wheel-of-fortune.jpg" "3/3c/RWS_Tarot_10_Wheel_of_Fortune.jpg"
download "11-justice.jpg"          "e/e0/RWS_Tarot_11_Justice.jpg"
download "12-hanged-man.jpg"       "2/2b/RWS_Tarot_12_Hanged_Man.jpg"
download "13-death.jpg"            "d/d7/RWS_Tarot_13_Death.jpg"
download "14-temperance.jpg"       "f/f8/RWS_Tarot_14_Temperance.jpg"
download "15-devil.jpg"            "5/55/RWS_Tarot_15_Devil.jpg"
download "16-tower.jpg"            "5/53/RWS_Tarot_16_Tower.jpg"
download "17-star.jpg"             "d/db/RWS_Tarot_17_Star.jpg"
download "18-moon.jpg"             "7/7f/RWS_Tarot_18_Moon.jpg"
download "19-sun.jpg"              "1/17/RWS_Tarot_19_Sun.jpg"
download "20-judgement.jpg"        "d/dd/RWS_Tarot_20_Judgement.jpg"
download "21-world.jpg"            "f/ff/RWS_Tarot_21_World.jpg"

count=$(ls public/cards/*.jpg 2>/dev/null | wc -l)
echo "Done. $count/22 cards in public/cards/"
