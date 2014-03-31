// Karma configuration
// Generated on Wed Feb 26 2014 09:39:36 GMT+0100 (CET)

module.exports = function(config) {
  config.set({

    // base path, that will be used to resolve files and exclude
    basePath: '',


    // frameworks to use
    frameworks: ['mocha'],


    // list of files / patterns to load in the browser
    files: [
      'bower_components/jquery/dist/jquery.js',
      'bower_components/commonjs-require-definition/require.js',
      'bower_components/knockout-3.1.0.debug/index.js',
      'bower_components/mocha/mocha.js',
      'bower_components/chai/chai.js',
      'bower_components/sinon-chai/lib/sinon-chai.js',
      'bower_components/sinon/lib/sinon.js',
      'bower_components/sinon/lib/sinon/call.js',
      'bower_components/sinon/lib/sinon/spy.js',
      'bower_components/sinon/lib/sinon/mock.js',
      'bower_components/knockout-js-infinite-scroll/infinitescroll.js',
      'test/setup.js',
      'app/scripts/*.js',
      'app/scripts/*/*.js',
      'test/tests/*.js'
    ],


    // list of files to exclude
    exclude: [
      
    ],


    // test results reporter to use
    // possible values: 'dots', 'progress', 'junit', 'growl', 'coverage'
    reporters: ['dots', 'coverage'],
    coverageReporter: {
      reporters: [
            {type: 'html', dir: 'coverage/'},
            {type: 'lcov', dir: 'coverage/'}
      ]
    },
    // the preprocessor configures which files should be tested for coverage.
    preprocessors: {
      '**/app/scripts/*.js': 'coverage',
      '**/app/scripts/*/*.js': 'coverage'
    },


    // web server port
    port: 9876,


    // enable / disable colors in the output (reporters and logs)
    colors: true,


    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,


    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,


    // Start these browsers, currently available:
    // - Chrome
    // - ChromeCanary
    // - Firefox
    // - Opera (has to be installed with `npm install karma-opera-launcher`)
    // - Safari (only Mac; has to be installed with `npm install karma-safari-launcher`)
    // - PhantomJS
    // - IE (only Windows; has to be installed with `npm install karma-ie-launcher`)
    browsers: ['PhantomJS'],


    // If browser does not capture in given timeout [ms], kill it
    captureTimeout: 60000,


    // Continuous Integration mode
    // if true, it capture browsers, run tests and exit
    singleRun: false
  });
};
