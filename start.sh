#!/bin/sh
# Start script that keeps the container alive
exec node node_modules/next/dist/bin/next start -p 3000 -H 0.0.0.0
