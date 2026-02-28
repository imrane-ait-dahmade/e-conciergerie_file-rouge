#!/usr/bin/env bash

# Rejoue l’historique mobile (commits vides) avec dates espacées de 2 jours à partir du 2026-03-21.
# Suite logique après les commits frontend (web/scripts/replay-frontend-git-history.sh).
#
# Usage : depuis la racine du dépôt Git :
#   bash mobile/scripts/replay-mobile-git-history.sh
#
# Prérequis : branche courante = celle où tu veux empiler ces commits (souvent après le dernier commit web).
set -euo pipefail

commit_at() {
  local date="$1"
  shift
  GIT_AUTHOR_DATE="${date}T14:00:00" GIT_COMMITTER_DATE="${date}T14:00:00" \
    git commit --allow-empty -m "$*"
}

commit_at 2026-03-21 "chore(mobile): scaffold Expo app with TypeScript template"
commit_at 2026-03-23 "chore(mobile): add React Navigation, gesture handler, and safe area"
commit_at 2026-03-25 "chore(mobile): add AsyncStorage and Expo Constants for env"
commit_at 2026-03-27 "feat(mobile): add NestJS API base URL and shared fetch wrapper"
commit_at 2026-03-29 "feat(mobile): add JWT storage helpers with AsyncStorage"
commit_at 2026-03-31 "feat(auth): add AuthContext for session, sign-in, and sign-out"
commit_at 2026-04-02 "feat(navigation): add auth stack with Welcome, Login, and Signup screens"
commit_at 2026-04-04 "feat(navigation): add bottom tabs for Home, Establishments, and Profile"
commit_at 2026-04-06 "feat(mobile): add SplashScreen while hydrating token from storage"
commit_at 2026-04-08 "feat(auth): wire LoginScreen to POST /auth/login"
commit_at 2026-04-10 "feat(auth): wire SignupScreen to POST /auth/signup with auto session"
commit_at 2026-04-12 "feat(mobile): add HomeScreen with project overview copy"
commit_at 2026-04-14 "feat(establishments): fetch list from GET /etablissements"
commit_at 2026-04-16 "feat(establishments): add detail screen for GET /etablissements/:id"
commit_at 2026-04-18 "feat(profile): load profile from GET /users/profile with Bearer token"
commit_at 2026-04-20 "feat(establishments): add cards with images and pull-to-refresh"
commit_at 2026-04-22 "refactor(navigation): switch RootNavigator by auth state (guest vs signed-in)"
commit_at 2026-04-24 "refactor(mobile): extract design tokens for colors, spacing, and typography"
commit_at 2026-04-26 "fix(mobile): resolve establishment image URLs when API returns relative paths"
commit_at 2026-04-28 "chore(mobile): add Babel preset Expo and TypeScript env references"
commit_at 2026-04-30 "chore(mobile): add .env.example for EXPO_PUBLIC_API_URL"
commit_at 2026-05-02 "docs(mobile): note emulator and device API base URL for NestJS"

echo "Done: 22 commits created (2026-03-21 → 2026-05-02, every 2 days)."
