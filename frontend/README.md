# Knockout skeleton [Brunch](http://brunch.io/)

[![Build Status](https://travis-ci.org/julienaubert/brunch_knockout.png?branch=master)](https://travis-ci.org/julienaubert/brunch_knockout)


Compatible with latest brunch (1.7.13).  Uses bower to manage packages (no "vendor" folder).

JavaScript based skeleton:
- [Knockout.js](http://knockoutjs.com/)
- [Font-awesome](http://fortawesome.github.io/Font-Awesome/)
- [html5-boilerplate](http://html5boilerplate.com/) [cherry-picked from 4.3.0]
- Autoreload

Testing: (headless or browser, code-coverage)
- [karma](http://karma-runner.github.io/) as test runner (istanbul for code coverage)
- [mocha](http://visionmedia.github.io/mocha/), [chai](http://chaijs.com/), [sinon](http://sinonjs.org/)

## Installation

- Install [node](http://nodejs.org/).
- Install Brunch: `npm install -g brunch`.
- Install Bower: `npm install -g bower`.
- Run `brunch new https://github.com/julienaubert/brunch_knockout <app name>`.
- cd into your new app folder.
- verify can run tests: `npm test` (2 example tests should run and pass, coverage should be reported). Note: it will auto-watch, `ctrl-c` to stop.
- verify can run brunch server:
 - `brunch w -s` and `open http://localhost:3333/`
 - must copy font-awesome/fonts yourself ([issue-633](https://github.com/brunch/brunch/issues/633)), run `./bower_assets.sh` to symlink them into public
 - after symlink and refresh, you should see a [thumb-up](http://fortawesome.github.io/Font-Awesome/icon/thumbs-up/) icon, and a [knockout example](http://knockoutjs.com/examples/helloWorld.html).

## Running
- To build your project run `brunch build`.
 - must copy font-awesome/fonts yourself ([issue-633](https://github.com/brunch/brunch/issues/633)), run `./bower_assets.sh` to symlink them into public
- To continually watch your project folder changes and auto-compile, use `brunch w`.
- To see it in browser (start a simple server), run `brunch w -s`, run `./bower_assets.sh` ([issue-633](https://github.com/brunch/brunch/issues/633))

## Testing

Put tests in test/tests/<name>_test.js and run: `npm test;` (or if want to see in browser `open test/index.html`).

As you modify tests or app-scripts, the tests will be re-run.

Modify karma.conf.js as you need, see [karma configuration](http://karma-runner.github.io/0.8/intro/configuration.html).

To run a single test, see [mocha](http://visionmedia.github.io/mocha/)'s "Exclusive tests" (i.e. use `it.only`/`describe.only`)
## Todo

Nice-if:
- Font-awesome fonts: nice if this was not symlinked. [issue-633](https://github.com/brunch/brunch/issues/633)

