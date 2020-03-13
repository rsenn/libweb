#!/bin/bash
ME=`basename "$0" .sh`
MYDIR=`dirname "$0"`
ABSDIR=`cd -P "$MYDIR/.." && pwd -P`

IFS="
"
exec 9>&2

package_path() {
   resty -e 'print(package.path)' |sed "s|;|\\n|g ; s|?|${1//"."/"/"}|g"
}

find_package() {
  MOD=${1//"."/"/"}
  PP=$(package_path "$MOD")
#    echo "$1 PP=$PP"  1>&9 
  for F in $PP; do
    if [ -e "$F" ]; then
      #echo "$F"
      return 0
    fi
  done
# case "$1" in
#   *.* | */*) echo "PP=$PP"  1>&9 ;;
# esac

  return 1
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
    " \
      "$ARG")
    unset DEPS
    for IMPORT in $IMPORTS; do
      FILE=$(echo "$IMPORT" | sed 's,\.,/,g ; s,$,.moon,')
      if [ -f "$FILE" ]; then
        pushv_unique DEPS "$FILE"
      elif find_package "${IMPORT}"; then
        pushv_unique MODULES "${IMPORT%%.*}"
      elif isin "${IMPORT%%.*}" $LUAROCKS_MODULES; then
        pushv_unique MODULES "${IMPORT%%.*}"
      elif isin "${IMPORT%%.*}" $SHARED_MODULES; then
        pushv_unique SHARED "${IMPORT%%.*}"
      else
        echo "$ARG: error: ${IMPORT} not found" 1>&2
      fi
    done
    [ -n "$DEPS" ] &&
    echo "$ARG:" $DEPS $MODULES 1>&2
  done
  echo "MODULES:" $MODULES 1>&2
  echo "SHARED:" $SHARED 1>&2
}
shared_modules() {
  set -- $OPENRESTY_ROOT/luajit/*/lua/*/*.so
  for ARG; do 
    basename "$ARG" .so
  done
}
get_modules() {
  command luarocks list | sed  '1d; /^Rocks installed/d; /^[-=]*$/d ; /^[^ ]/p' -n
}

main() {

  : ${OPENRESTY_ROOT=/opt/openresty}
  LUAROCKS_MODULES=`get_modules `
  SHARED_MODULES=`shared_modules `

  [ $# -gt 0 ] || set -- $(find * -iname "*.moon")
  get_imports "$@"

  UNUSED_MODULES=

  for LUAROCKS_MODULE in $LUAROCKS_MODULES; do
    if ! isin $LUAROCKS_MODULE $MODULES; then
      pushv_unique UNUSED_MODULES $LUAROCKS_MODULE
    fi
  done
  echo UNUSED_MODULES: $UNUSED_MODULES 1>&2
  echo LUAROCKS_MODULES: $LUAROCKS_MODULES 1>&2
  echo SHARED_MODULES: $SHARED_MODULES 1>&2
}

main "$@"
