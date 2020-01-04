#!/bin/sh
ME=`basename "$0" .sh`
MYDIR=`dirname "$0"`
ABSDIR=`cd -P "$MYDIR/.." && pwd -P`

IFS="
"

sortv() {
  eval "$1=\$(echo \"\${$1}\" | sort -u)"
}

isin() {
 (needle="$1"
  while [ "$#" -gt 1 ]; do
    shift
    test "$needle" = "$1" && exit 0
  done
  exit 1)
}

pushv_unique() {
  __V=$1 __S= IFS=${IFS%${IFS#?}}
  shift
  for __S in "$@"; do
    if eval "! isin \$__S \${$__V}"; then
      pushv "$__V" "$__S"
    else
      return 1
    fi
  done
}

pushv() {
    eval "shift;$1=\"\${$1+\"\$$1\${IFS%\"\${IFS#?}\"}\"}\$*\""
}

get_imports() {
  unset MODULES
  for ARG; do
    DIR=$(dirname "$ARG")
    IMPORTS=$(sed -n \
    "/\\srequire[^a-z]/ {
      s|.*require.*['\"]\([^'\"]*\)['\"].*|\1|p
    }
    /^\\s*import\\s/ {
      s|.*['\"]\([^'\"]*\)['\"].*|\1|p
    }" \
      "$ARG")
    unset DEPS
    for IMPORT in $IMPORTS; do
      case "$IMPORT" in
        ../*) REL="$DIR/$IMPORT" ;;
        ./*) REL="$DIR/${IMPORT#./}" ;;
        *) REL="$IMPORT" ;;
      esac
      [ ! -f  "$REL" -a -f "$REL.js" ] && REL="$REL.js"

      if [ -f "$REL" ]; then
        BASED=$(realpath --relative-to "$ABSDIR" "$REL")
        pushv DEPS  "$BASED"
        continue
      elif [ -f "node_modules/$IMPORT.js" -o -f "node_modules/$IMPORT" ]; then
        pushv_unique MODULES "${IMPORT%/*}"
      elif [ -d "node_modules/$IMPORT" ]; then
        pushv_unique MODULES "$IMPORT"
      fi
      [ "${IMPORT%/*}" == .. ] && OUT="$REL"

    done
    [ -n "$DEPS" ] &&
    echo "$ARG:" $DEPS 1>&2
  done
  sortv MODULES
  echo "MODULES:" $MODULES 1>&2
}
get_modules() {
  set --  "$ABSDIR/node_modules"/*
  echo "${*##*/}"
}
package_modules() {
  sed 's,^\s*"\([^"]*\)": "^*[0-9].*,\1,p' -n "$ABSDIR/package.json"
}

main() {

  NODE_MODULES=`get_modules `
  PACKAGE_MODULES=`package_modules `
  get_imports "$@"

  for NODE_MODULE in $PACKAGE_MODULES; do
    if ! isin $NODE_MODULE $MODULES; then
      echo "\\|\"$NODE_MODULE\"|d"
    fi
  done
  echo "OUT=$OUT" 1>&2
}

main "$@"
