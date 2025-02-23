c#!/bin/bash

# set -eo pipefail

declare -A PAGE_PARAMS=(

  ["HOST"]='http://localhost:3300'

  ["CDN_HOST"]="http://localhost:3300"

)

for index in "${!PAGE_PARAMS[@]}";

do

  ENV_VAL=`eval echo '$'${index}`

  [ -z "${ENV_VAL}" ] && ENV_VAL=${PAGE_PARAMS[$index]}

  /bin/sed -i "s!${index}!${ENV_VAL}!g" /usr/share/nginx/assets*.html;

done

exec "$@"
