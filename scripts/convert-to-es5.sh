#!/bin/sh

NL="
"
IFS="$NL"

pushv() { 
    eval "shift;$1=\"\${$1+\"\$$1\${IFS%\"\${IFS#?}\"}\"}\$*\""
}
isin() { 
 (needle="$1"
  while [ "$#" -gt 1 ]; do
    shift
    test "$needle" = "$1" && exit 0
  done;
  exit 1)
}

ALLFILES=

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

    if isin $IN $ALLFILES; then
      continue
    fi
    DIR=`dirname "$1"`
    shift
    OUT=${IN%.js}.es5.js
     (set -x; babel -o "$OUT" "$IN" )
    REQUIRES=$( sed '/require(/ { s,.*require(\([^)]*\)).*,\1, ; s,^"\(.*\)"$,\1, ; p }' -n "$OUT" )
    SUBST=
    ADDFILES=
    for FILE in $REQUIRES; do
      FILE=${FILE#./}
      FILE=$DIR/$FILE
      test -e "$FILE" || continue
      pushv ADDFILES "$FILE"
      FILE=${FILE#$DIR/}
      pushv SUBST "/require(/ s|$FILE|${FILE%.js}.es5.js|"
    done
   (set -x;  sed -i -e "$SUBST" "$OUT")

    set -- "$@" $ADDFILES

    pushv ALLFILES "$IN"
  done
}

set -- $(echo "$*" | grep -v es5.js)

convert_to_es5 "$@"