#!/bin/bash

if ! [ -x "$(command -v /root/.cargo/bin/svgcleaner)" ]; then
  echo 'Precommint hook error: svgcleaner is not installed. Please install from https://github.com/RazrFalcon/svgcleaner' >&2
  exit 1
fi

source ./build/svglinter/clean_svg_flags.sh
files=$(find src -name '*.svg')

while read -r svgFile; do
  # Redirect stderr to stdout
  status=$(/root/.cargo/bin/svgcleaner $svgFile $svgFile $SVG_CLEANER_FLAGS 2>&1 >/dev/null)

  # The svgcleaner command does not return whether a file is optimized or not
  # Better way to check is to find if there is reduction in file size
  if echo "$status" | grep -q 'Your image is 0.00% smaller now.'; then
    : # do nothing
  elif echo "$status" | grep -q 'Error: Cleaned file is bigger than original.'; then
    :
  else
    echo "Error: $svgFile is not clean. Please run 'npm run svg:clean'\n"
    exit 1
  fi
done <<< "$files"

exit 0
