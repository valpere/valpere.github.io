# Change gate for dreaming passes: skip the (expensive, hundreds of Ollama
# requests) agentic run when nothing it reads changed since the last report.
# Sourced by dreaming.sh and by per-project copies.
#
# dreaming_changed_since <reports_dir> <path>...
#   exit 0 -> something under <path>... is newer than the newest *.md report in
#             <reports_dir> (or there is no report yet): run the pass.
#   exit 1 -> nothing newer (or no path exists): skip the pass.
dreaming_changed_since() {
  local reports_dir="$1"; shift
  local last
  last=$(ls -1t "$reports_dir"/*.md 2>/dev/null | head -n1)
  [[ -z "$last" ]] && return 0
  [[ -n "$(find "$@" -type f -newer "$last" -print -quit 2>/dev/null)" ]]
}

# dreaming_repo_changed_since <reports_dir> <repo_dir>
#   exit 0 -> a commit newer than the newest report exists (or no report yet).
dreaming_repo_changed_since() {
  local last
  last=$(ls -1t "$1"/*.md 2>/dev/null | head -n1)
  [[ -z "$last" ]] && return 0
  [[ -n "$(git -C "$2" log -1 --since="$(stat -c %Y "$last")" --format=%H 2>/dev/null)" ]]
}
