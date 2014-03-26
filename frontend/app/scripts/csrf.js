require.register("scripts/csrf", function(exports, require, module) {


    function setup_csrf_ajax() {
        // Returns a wrapper for $.ajax which is to be used when talking to the back-end.
        // It will pass value of the csrf cookie into X-CSRFToken header (or else the back-end will refuse the request).
        // It ensures we actually have the csrf-cookie, and if we don't, it will do exactly 1 GET to the backend
        // (the backend will set the CSRF cookie on this GET)
        //
        // why this technique prevents CSRF:
        // - server gives csrf-token in cookie, any malicious site won't be able to read it (cross-origin-policy)
        // - a malicious site will however send cookies on form posts => backend needs more than just csrf cookie
        // - so our same-origin client will read the csrf-cookie data, and put it in each request
        // (this is impossible for a malicious site, because they cannot read the csrf-cookie and so won't know what to
        //  pass in the post-request)
        // - we must make sure though, to never leak the csrf-token (therefore wrapper has crossDomain:false)
        var has_csrf_token = $.cookie('csrftoken');
        var awaiting_response = false;
        function csrf_safe_method(method) {
            // these HTTP methods do not require CSRF protection
            return (/^(GET|HEAD|OPTIONS|TRACE)$/.test(method));
        }
        function get_csrf_token(callback) {
            if (!has_csrf_token && !awaiting_response) {
                awaiting_response = true;
                $.ajax({
                    type: 'GET', url: 'api/csrf/',
                    success: function() {
                        has_csrf_token = true;
                    }
                });
            }
            function wait_for_csrf_token() {
                if (!has_csrf_token) {
                    setTimeout(wait_for_csrf_token, 5);
                }
            }
            wait_for_csrf_token();
            // Make sure to re-read the csrf-token as server can update it
            callback($.cookie('csrftoken'));
        }
        var csrf_ajax = function(options) {
            options['crossDomain'] = false;
            options['beforeSend'] = function(xhr, settings) {
                if (csrf_safe_method(settings.type)) {
                    return;
                }
                get_csrf_token(function(csrf_token) {
                    xhr.setRequestHeader("X-CSRFToken",  csrf_token);
                });
            };
            $.ajax(options);
        };
        return csrf_ajax;
    };

    exports.setup_csrf_ajax = setup_csrf_ajax;

});
