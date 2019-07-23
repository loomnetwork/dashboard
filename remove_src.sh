#!/bin/bash
rm tmp_file || true 

for d in src/contracts/*.json ; do
 echo "updating ${d}"
 jq -r "del(.source)" ${d} > tmp_file
 mv tmp_file ${d}
done