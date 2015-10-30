#!/bin/sh

cd nxt-1.6.1e
./run.sh &
cd ..
cd fmcore
./run_core.sh &
cd ..
node ./freemarket-lite/app.js