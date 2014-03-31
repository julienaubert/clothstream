require.register("scripts/facebook_sdk", function(exports, require, module) {

    function load_sdk(callback) {
        if (typeof(FB) == 'undefined') {
            jQuery.ajax({
                type: "GET",
                url: "//connect.facebook.net/en_US/all.js",
//                url: "//connect.facebook.net/en_US/all/debug.js",
                success: function() {
                    FB.init({
                        appId: '230332697163931',
                        status: true,
                        xfbml: true
                    });
                    callback();
                },
                dataType: "script",
                cache: true
            });
        }
    }

    exports.load_sdk = load_sdk;

});
