#!/bin/sh

THISDIR=`dirname "$0"`/..

[ -x "$THISDIR"/node_modules/.bin/eslint ] && ESLINT="$THISDIR/node_modules/.bin/eslint"

var_dump () 
{ 
    ( for N in "$@";
    do
        N=${N%%=*};
        O=${O:+$O${var_s-${IFS%${IFS#?}}}}$N=`eval 'echo "${'$N'}"'`;
    done;
    echo "$O" )
}


[ $# -gt 0 ] || set -- $(find components pages utils stores -name "*.js")



for FILE; do
  echo "$FILE" 1>&2
  ${ESLINT:-eslint} --no-color --fix "$FILE" 2>&1 | tee eslint.tmp | sed "s,^\s*\([0-9]\+\):\([0-9]\+\)\s\+\([^ ]\+\) \+\(.*[^ ]\)\s\s*\([^\s]\+\)$,$1|\1|\3|\4|\5,"  \
    | {
    IFS="|"
    while read -r _FILE LINE WHAT MESSAGE RULE; do
      echo $FILE $LINE $WHAT $MESSAGE $RULE
     ([ "$WHAT" = error ] && exec 1>&2
      printf "%-30s %-10s %-150s %10s\n" "$FILE:$LINE" "$WHAT" "$MESSAGE" "$RULE")
    done
  }
done | tee eslint.log
