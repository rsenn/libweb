#!/bin/bash

THISDIR=$(dirname "$0")

DOCDIR=$(realpath --relative-to "$PWD" "$THISDIR/../doc")

. require.sh
require url

#. "$DOCDIR/api.sh"

trap '[ "$FAIL_CMD" ] && echo "Failed command was: $FAIL_CMD"; exit' EXIT
IFS="
"

get_ips() {
  (ip addr || ifconfig) |sed 's,.*inet \([^/ ]*\).*,\1,p' -n
}

: ${DEV_PORT=5555}
DEV_HOST="http://$(get_ips | tail -n1):${DEV_PORT}"
DEV_LOCATION='/'
DEV_CMD='curl -s -L -k --cookie dev.cookie --cookie-jar dev.cookie'
DEV_HEADERS='dev.headers'
DEV_OUTPUT='dev.out'

# http_request <url> <data>
http_request() {
 (: ${NS:=DEV}; URL=${1##*.ASP}; shift; DATA="$*"; eval 'set -- "$'$NS'_HOST$'$NS'_LOCATION$URL"'
 eval "HEADERS=\${${NS}_HEADERS} CURL_CMD=\${${NS}_CMD} OUTPUT=\${${NS}_OUTPUT}"
  T=${DATA:+POST}
  IFS="
 "
  #trap 'rm -f "$HEADERS" "$OUTPUT"' EXIT
   #echo "${T:-GET} $1${DATA:+ $DATA}" 1>&2
  set -- $CURL_CMD $CURL_ARGS \
      -o "$OUTPUT" \
      -D "$HEADERS" \
        ${PREV_URL:+--referer
"$PREV_URL"} \
     -H "Content-type: application/json" \
       ${DATA:+--data-ascii "$DATA"} \
        "$1"

   "$@" && FAIL_CMD= || FAIL_CMD="$*"
   PREV_URL="$1"

  #grep -iE '(^HTTP|cookie|session|type|key|token|Access-Control)' "$HEADERS" 1>&2
  echo "$@" 1>&2
  echo >>"$OUTPUT"
  OUT=$(<"$OUTPUT")
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
  rm -f "dev.cookie"

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


