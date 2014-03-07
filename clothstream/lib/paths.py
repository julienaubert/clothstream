from pathlib import Path

DJANGO_ROOT = Path(__file__).parent.parent
PROJECT_DIR = DJANGO_ROOT.parent
TMP_BUILDDIR = PROJECT_DIR/'.build'

