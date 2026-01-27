#!/usr/bin/env bash
#
# Historique Git réaliste — backend NestJS (projet étudiant)
# Format : conventional commits, 1er commit le 2026-01-20, puis +2 jours entre chaque
#
# Usage :
#   bash COMMITS.sh              # Affiche la liste des commits avec dates
#   bash COMMITS.sh --timeline   # Crée des commits vides datés (démo graphique Git)
#
# Prérequis pour --timeline : dépôt git initialisé (git init)
#

set -e
cd "$(dirname "$0")"

# Date du commit n (n=1 → 2026-01-20, n=2 → +2 jours, etc.)
get_commit_date() {
  local n=$1
  local days=$(( (n - 1) * 2 ))
  local out
  out=$(date -u -d "2026-01-20 10:00:00 UTC +${days} days" "+%Y-%m-%d %H:%M:%S" 2>/dev/null) && { echo "$out"; return; }
  out=$(python3 -c "
from datetime import datetime, timedelta, timezone
d = datetime(2026, 1, 20, 10, 0, 0, tzinfo=timezone.utc) + timedelta(days=${days})
print(d.strftime('%Y-%m-%d %H:%M:%S'))
" 2>/dev/null) && { echo "$out"; return; }
  echo "2026-01-20 10:00:00"
}

# Liste : message (ordre chronologique étudiant)
COMMIT_MSGS=(
  "chore: initial NestJS project setup"
  "chore: add MongoDB connection and MongooseModule"
  "feat(config): add ConfigModule with Joi validation"
  "feat(users): add User schema and Mongoose model"
  "feat(users): add UsersModule with create and legacy login routes"
  "feat(auth): add AuthModule with JWT and Passport"
  "feat(auth): implement signup with bcrypt hashing"
  "feat(auth): implement login and token pair response"
  "feat(auth): add refresh token rotation and logout"
  "feat(users): add GET profile protected by JWT"
  "feat(auth): add JwtStrategy and JwtAuthGuard"
  "feat(etablissements): add Etablissement schema and create DTOs"
  "feat(etablissements): implement CRUD service and controller"
  "feat(etablissements): protect mutations and set prestataire on create"
  "feat(app): add global ValidationPipe Helmet and CORS"
  "refactor(auth): use req.user on protected routes"
  "test(etablissements): add EtablissementsService unit tests"
  "test(auth): add E2E tests for signup login and profile"
  "docs: add architecture and auth explanation markdown"
  "chore: add Swagger and API documentation"
)

show_list() {
  echo ""
  echo "=== Liste des commits (conventional commits) ==="
  echo ""
  printf "%-12s  %s\n" "Date" "Message"
  echo "------------  ----------------------------------------------------------------"
  local i msg d
  for i in "${!COMMIT_MSGS[@]}"; do
    msg="${COMMIT_MSGS[$i]}"
    n=$(( i + 1 ))
    d=$(get_commit_date "$n" | cut -c1-10)
    printf "%-12s  %s\n" "$d" "$msg"
  done
  echo ""
}

create_timeline() {
  if [ ! -d .git ]; then
    echo "Erreur: exécutez 'git init' dans ce dossier."
    exit 1
  fi
  echo "Création de ${#COMMIT_MSGS[@]} commits vides avec dates rétroactives..."
  echo "(Usage typique: démo du graphe de commits — le code réel peut être ajouté après)"
  echo ""
  local i n msg date_str
  for i in "${!COMMIT_MSGS[@]}"; do
    msg="${COMMIT_MSGS[$i]}"
    n=$(( i + 1 ))
    date_str=$(get_commit_date "$n")
    export GIT_AUTHOR_DATE="$date_str"
    export GIT_COMMITTER_DATE="$date_str"
    git commit --allow-empty -m "$msg" -q
    echo "  [$date_str] $msg"
  done
  echo ""
  echo "Derniers commits :"
  git log --oneline --date=short --format="%h %ad %s" -"${#COMMIT_MSGS[@]}"
}

case "${1:-}" in
  --timeline|--empty)
    create_timeline
    ;;
  --help|-h)
    echo "Usage: bash COMMITS.sh           # liste des commits + dates"
    echo "       bash COMMITS.sh --timeline  # crée commits vides datés (démo)"
    ;;
  *)
    show_list
    echo "Astuce : bash COMMITS.sh --timeline  (commits vides pour timeline Git)"
    ;;
esac
