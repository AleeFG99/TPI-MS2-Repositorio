#!/usr/bin/env bash
# Compara estado-inicial vs estado-refactorizado (comportamiento externo + métricas).
# En Windows sin bash usar:  npm run comparar
set -euo pipefail
cd "$(dirname "$0")/.."
exec node scripts/comparar-versiones.mjs "$@"
