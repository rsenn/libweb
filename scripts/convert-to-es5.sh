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
pushv_unique() { 
  __V=$1
  old_IFS=$IFS
  IFS=${IFS%${IFS#?}}
  shift
  for __S; do
    if eval "! isin \$__S \${$__V}"; then
      pushv "$__V" "$__S"
    else
      return 1
    fi
  done
  IFS=$old_IFS
}

ALLFILES=

convert_to_es5() {
  OPTS=
  while :; do
    case "$1" in
      --force|-f) FORCE=true; shift ;;
      --debug|-x) DEBUG=true; shift ;;
      -*) OPTS="${OPTS:+$OPTS$NL}$1"; shift ;;
       *) break ;;
    esac
  done
  #echo ARGS: $@ 1>&2

  while [ $# -gt 0 ]; do
    IN=$1
    shift
    DIR=`dirname "$IN"`
    OUT=${IN%.js}.es5.js

    isin $IN $ALLFILES && continue 
    [ "$DEBUG" = true ] && echo "File: ${IN}" 1>&2

    pushv_unique ALLFILES "$IN"

    run_babel() {
      (set -x;  babel --compact auto --no-comments ${2:+-o} ${2:+"$2"} "${1:-"-"}" )
    }

    [ "$FORCE" = true -o "$OUT" -ot "$IN" ] && run_babel "$IN" "$OUT"

    REQUIRES=$( sed '/require(/ { s,.*require(\([^)]*\)).*,\1, ; s,^"\(.*\)"$,\1, ; p }' -n "$OUT" )
    SUBST=
    unset ADDFILES
    for FILE in $REQUIRES; do
      FILE=${FILE#./}
      FILE="$DIR/$FILE"
      test -e "$FILE" || continue
      #echo "FILE=$FILE" 1>&2
      FILE=${FILE%.js}
      FILE=${FILE%.es5}
      pushv_unique ADDFILES "${FILE}.js"
      FILE=${FILE#$DIR/}
      SUBST="$SUBST ;; /require(/ s|${FILE%.js}.js\"|${FILE%.js}.es5.js\"|g"
    done
   [ -n "$SUBST" ] && (set -x; sed -i -e "$SUBST" "$OUT")

    set -- "$@" $ADDFILES
  done
}

set -- $(echo "$*" | sed 's,\.es5\.,.,g')

#set -- $(echo "$*" | grep -v es5.js)

convert_to_es5 "$@"
