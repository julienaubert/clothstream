#!/usr/bin/env python
import os
import codecs
from setuptools import setup, find_packages
from distutils.command.sdist import sdist
import clothstream as app


def read(*parts):
    here = os.path.abspath(os.path.dirname(__file__))
    return codecs.open(os.path.join(here, *parts), 'r').read()


class MySdist(sdist):
    def run(self):
        sdist.run(self)
        os.system('rm -rf *.egg-info')


tests_require = read('clothstream/requirements/testing.pip')

setup(
    name=app.NAME,
    version=app.get_version(),
    url='https://pypi.fury.io/nt5s3mktVimAx5L3xDdh/julienaubert/{}'.format(app.NAME),

    author='Julien Aubert',
    author_email='julien.aubert.mail@gmail.com',
    license="Property of Julien Aubert",
    description='clothstream',
    cmdclass={
        'sdist': MySdist,
    },
    packages=find_packages('.'),
    include_package_data=True,
    dependency_links=[],
    install_requires=read('clothstream/requirements/install.pip'),
    tests_require=tests_require,
    test_suite='conftest.runtests',
    extras_require={
        'tests': tests_require,
    },
    platforms=['linux'],
    classifiers=[
        'Environment :: Web Environment',
        'Framework :: Django',
        'Operating System :: OS Independent',
        'Programming Language :: Python :: 2.7',
        'Intended Audience :: Developers'
    ]
)
