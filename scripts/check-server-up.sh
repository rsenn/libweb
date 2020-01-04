#!/bin/bash

THISDIR=$(dirname "$0")

DOCDIR=$(realpath --relative-to "$PWD" "$THISDIR/../doc")

. require.sh
require url

. "$DOCDIR/api.sh"

trap '[ "$FAIL_CMD" ] && echo "Failed command was: $FAIL_CMD"; exit' EXIT
IFS="
"

STARDEV_HOST='http://starlottery.club:8080'
STARDEV_LOCATION='/'
STARDEV_CMD='curl -s -L -k --cookie stardev.cookie --cookie-jar stardev.cookie'
STARDEV_HEADERS='stardev.headers'
STARDEV_OUTPUT='stardev.out'

# http_request <url> <data>
http_request() {
 (: ${NS:=STARDEV}; URL=${1##*.ASP}; shift; DATA="$*"; eval 'set -- "$'$NS'_HOST$'$NS'_LOCATION$URL"'
 eval "HEADERS=\${${NS}_HEADERS} CURL_CMD=\${${NS}_CMD} OUTPUT=\${${NS}_OUTPUT}"
  T=${DATA:+POST}
  IFS="
 "
  #trap 'rm -f "$HEADERS" "$OUTPUT"' EXIT
   #echo "${T:-GET} $1${DATA:+ $DATA}" 1>&2
  $CURL_CMD $CURL_ARGS \
      -o "$OUTPUT" \
      -D "$HEADERS" \
        ${PREV_URL:+--referer
"$PREV_URL"} \
     -H "Content-type: application/json" \
       ${DATA:+--data-ascii "$DATA"} \
        "$1" && FAIL_CMD= || FAIL_CMD="$*"
   PREV_URL="$1"

  #grep -iE '(^HTTP|cookie|session|type|key|token|Access-Control)' "$HEADERS" 1>&2
  #echo
  echo >>"$OUTPUT"
  OUT=$(cat <"$OUTPUT")
 echo "$OUT"
  )
}


check-server-up() {

   NUMBER="$1" 
   shift
   TEXT="$*"
  (set -e . require.sh
  require var
  require xml
  rm -f "stardev.cookie"


  for PAGE in "" about account admin confirmation deposit drawings games guide index login picks play profile register withdraw
  do 
   http_request /$PAGE || {
     exit $?
 }
  done

   )
}

case "$0" in
  *.sh) check-server-up "$@"; exit $? ;;
esac


