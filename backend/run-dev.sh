#!/bin/bash
mkdir -p uploads/profiles uploads/events uploads/posts
npx nodemon --exec ts-node --transpile-only src/index.ts 