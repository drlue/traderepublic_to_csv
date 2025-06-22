#!/bin/bash
for pdf in /input/*.pdf; do
    file=$(basename "$pdf" | sed 's/\.pdf$/.csv/')
    pdftotext -layout "$pdf" - | node traderepublic.js $SEPARATOR $QUOTE > "/input/$file"
done