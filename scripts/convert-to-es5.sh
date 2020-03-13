#!/bin/sh

NL="
"
IFS="$NL"

pushv() { 
    eval "shift;$1=\"\${$1+\"\$$1\${IFS%\"\${IFS#?}\"}\"}\$*\""
}


convert_to_es5() {
  OPTS=
  while :; do
    case "$1" in
      -*) OPTS="${OPTS:+$OPTS$NL}$1"; shift ;;
       *) break ;;
    esac
  done


  while [ $# -gt 0 ]; do
    IN=$1
    shift
    OUT=${IN%.js}.es5.js
     (set -x; babel -o "$OUT" "$IN" )
    REQUIRES=$( sed '/require(/ { s,.*require(\([^)]*\)).*,\1, ; s,^"\(.*\)"$,\1, ; p }' -n "$OUT" )
    SUBST=
    ADDFILES=
    for FILE in $REQUIRES; do
      test -e "$FILE" || continue
      FILE=${FILE#./}
      pushv SUBST "/require(/ s|$FILE|${FILE%.js}.es5.js|"
     pushv ADDFILES "$FILE"
    done
    sed -i -e "$SUBST" "$OUT"

    set -- "$@" $ADDFILES
  done
}

convert_to_es5 "$@"