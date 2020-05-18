#!/bin/sh
exec sed \
  -e 's|const \([^{}]*\) = require(\(.*\))\.\([^)]*\);|import { \3 as \1 } from \2;|' \
  -e 's|const \(.*\) = require(\(.*\));|import \1 from \2;|' \
  -e 's|\.es5\.|.|g' \
"$@"
