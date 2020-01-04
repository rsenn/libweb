#!/bin/sh -x
exec sed -i '1 { /@format/ { N; /\n$/ { d } } }'  \
  ${@:-$(find components utils stores pages -name "*.js")}

