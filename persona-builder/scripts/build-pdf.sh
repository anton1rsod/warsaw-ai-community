#!/usr/bin/env bash
#
# Build the persona-creation community guide as a PDF.
#
# Usage:
#   ./scripts/build-pdf.sh              # English (default)
#   ./scripts/build-pdf.sh --lang uk    # Ukrainian
#   ./scripts/build-pdf.sh --lang all   # Both languages
#
# Output:
#   persona-creation-guide.pdf          (English, from README.md)
#   persona-creation-guide-uk.pdf       (Ukrainian, from README.uk.md)
#
# Requires: Python 3.9+, `pip install markdown`, Google Chrome.
set -euo pipefail
cd "$(dirname "$0")/.."
python3 scripts/build-pdf.py "$@"
