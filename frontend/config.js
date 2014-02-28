exports.config = {
  //  https://github.com/brunch/brunch/blob/stable/docs/config.md
  paths: {
    watched: ['app']
  },
  conventions: {
      assets: /(assets|test(\/|\\)assets)/
    // NOTE! this casues the css in font-awesome to be treated as asset, and hence not compiled into app.css :(
    // However. There is no work-around for now. See: https://github.com/brunch/brunch/issues/633
//      Trying with just fonts, this will match font-awesome/fonts/* and put * in public, css files refers to ../fonts though
//      assets: /(assets|fonts)(\/|\\)/
//      Trying with a look-ahead does not work either (i.e. all font-awesome/* where * = fonts/...
//      assets: /(assets|(font-awesome(\/|\\)(?=fonts)))(\/|\\)/
//      Trying with a negative-look-ahead does not work either (i.e. all font-awesome/* except if * = css/...)
//      assets: /(assets|(font-awesome(\/|\\)(?!css)))(\/|\\)/
//  For now: use a bower_assets.sh which symlinks into public, and .bashrc bowerwatch
  },
  modules: {
    wrapper: false,
    definition: 'commonjs'
  },
  files: {
    javascripts: {
      joinTo: {
        'js/app.js': /^app\/scripts/,
        'js/vendor.js': /^bower_components/
      },
      order: {
        before: [
          'bower_components/console-polyfill/index.js',
          'bower_components/jquery/dist/jquery.js',
        ]
      }
    },
    stylesheets: {
      joinTo: {
        'css/app.css': /^(app|bower_components)/
      },
      order: {
        before: ['bower_components/normalize-css']
      }
    }
  }
};
