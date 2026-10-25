#!/usr/bin/env sh
cd "$(dirname "$0")" || exit 1
printf '%s\n' 'ASHFALL Development Hub: abra http://localhost:8765'
python3 -m http.server 8765 --directory site
