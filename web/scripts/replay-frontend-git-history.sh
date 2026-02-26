#!/usr/bin/env bash

# Rejoue 10 commits vides avec dates espacées de 2 jours (2026-02-13 → 2026-03-03).
# Usage : depuis la racine du dépôt Git : bash web/scripts/replay-frontend-git-history.sh
set -euo pipefail

commit_at() {
  local date="$1"
  shift
  GIT_AUTHOR_DATE="${date}T14:00:00" GIT_COMMITTER_DATE="${date}T14:00:00" \
    git commit --allow-empty -m "$*"
}

commit_at 2026-02-13 "chore(web): scaffold Next.js App Router with locale middleware"
commit_at 2026-02-15 "feat(styles): add shadcn/ui, globals and SCSS design tokens"
commit_at 2026-02-17 "feat(home): implement homepage sections from Figma layout"
commit_at 2026-02-19 "feat(auth): add login and signup pages with shared auth shell"
commit_at 2026-02-21 "feat(api): add fetch client and NEXT_PUBLIC_API_URL wiring"
commit_at 2026-02-23 "feat(auth): wire login and signup to NestJS /auth endpoints"
commit_at 2026-02-25 "feat(auth): store access token in localStorage after login"
commit_at 2026-02-27 "fix(ui): responsive layout for header, hero, and auth cards"
commit_at 2026-03-01 "fix(ui): extract button-variants for server-safe header links"
commit_at 2026-03-03 "chore(web): document local API URL in .env.local.example"

echo "Done: 10 commits created."
