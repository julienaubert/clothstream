SETTINGS=clothstream.settings.test
BUILDDIR=.build
PYTHONPATH=${PWD}
BUILD_NUMBER=0

install-deps:
	@pip install -qr clothstream/requirements/install.pip --extra-index-url=https://pypi.fury.io/nt5s3mktVimAx5L3xDdh/julienaubert/
	@pip install -qr clothstream/requirements/testing.pip --extra-index-url=https://pypi.fury.io/nt5s3mktVimAx5L3xDdh/julienaubert/

mkbuilddir:
	mkdir -p ${BUILDDIR}

locale:
	@cd test_project && django-admin.py makemessages -l en
	@cd test_project && PYTHONPATH=".." django-admin.py compilemessages --settings=${SETTINGS}


setup-dev-env: install-deps
	./manage.py syncdb --migrate --noinput
	./manage.py loaddata clothstream/site/fixtures/clothstream.json

setup-test-db: install-deps
	./manage.py syncdb --migrate --noinput --settings=clothstream.site.settings.testing


build: locale

test: install-deps
	py.test


fulltest: install-deps
	./manage.py test -v 0


clean:
	rm -fr ${BUILDDIR} dist *.egg-info .coverage .pytest MEDIA_ROOT MANIFEST .cache *.egg build STATIC
	find . -name __pycache__ -name .cache -prune | xargs rm -rf
	find . -name "*.py?" -prune | xargs rm -rf
	find . -name "*.orig" -prune | xargs rm -rf
	rm -f coverage.xml flake8.out pytest.xml

qa: coverage flake8 lint

coverage: mkbuilddir
	py.test --cov-report=xml --junitxml=pytest.xml --cov-config=tests/.coveragerc --cov clothstream
	#firefox ${BUILDDIR}/coverage/index.html

flake8: mkbuilddir
	flake8 --max-line-length=120 --exclude=migrations,factories,settings,tests \
	    --ignore=E501,E401,W391,E128,E261 --format pylint clothstream | tee ${BUILDDIR}/flake8.out

docs: mkbuilddir
	rm -fr docs/apidocs
	sphinx-apidoc clothstream -H clothstream -o docs/apidocs
	sphinx-build -n docs/ ${BUILDDIR}/docs/
ifdef BROWSE
	firefox ${BUILDDIR}/docs/index.html
endif


ci_test: install-deps mkbuilddir
	[ "${django}" = "1.6.x" ] && pip install https://www.djangoproject.com/m/releases/1.6/Django-1.6b4.tar.gz || echo ""
	[ "${django}" = "dev" ] && pip install git+git@github.com:django/django.git || echo ""

	[ '${database}' = 'postgres' ] && psql -c 'DROP DATABASE IF EXISTS clothstream_test_$BUILD_NUMBER;' || echo ""
	[ '${database}' = 'postgres' ] && psql -c 'CREATE DATABASE clothstream_test_$BUILD_NUMBER;' || echo ""

	pip install flake8 pylint coverage pygments pytest-django pytest-cov
	@$(MAKE) --no-print-directory install-deps coverage flake8


.PHONY: build docs
