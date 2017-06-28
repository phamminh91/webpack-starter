#!/bin/bash

if ! [ -x "$(command -v svgcleaner)" ]; then
  echo 'Precommint hook error: svgcleaner is not installed. Please install from https://github.com/RazrFalcon/svgcleaner' >&2
  exit 1
fi

source ./build/svglinter/clean_svg_flags.sh
svgcleaner $2 $2 $SVG_CLEANER_FLAGS
