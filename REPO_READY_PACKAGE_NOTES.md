# Repo-ready replacement package

This package is prepared for full repository replacement and is intentionally cleaned before zipping.

Included:
- Source code fixes with ASCII-safe generated content filenames
- Verified `.github/workflows/e2e.yml` re-added from the GitHub repository branch `e2e-pass27`
- Project source, tests, tools, public assets, and documentation files needed by the repository

Excluded on purpose:
- `node_modules/`
- `dist/`
- local `*.log` files
- local-only `FIXES_APPLIED.md`

Validation status before packaging:
- Local tests passed on the fixed source tree
- Local build passed on the fixed source tree

Important:
- This package is intended to replace repository contents while preserving `.git/` in the destination clone.
