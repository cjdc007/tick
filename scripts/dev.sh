#!/usr/bin/env bash
# Serve the app at http://localhost:${PORT:-8000}. Service workers need http://localhost (not file://).
cd "$(dirname "$0")/.." && exec python3 -m http.server "${PORT:-8000}"
