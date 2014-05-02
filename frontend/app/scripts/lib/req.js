require.register("scripts/req", function(exports, require, module) {

    var lib = {};
    lib.request = function(type, target, payload, success, error) {
        $.csrfAjax({
            type: type,
            url: target,
            async: true,
            contentType: "application/json; charset=utf-8",
            data: payload,
            success: function(data) {
                if (success) {
                    success(data);
                }
            },
            error: function(jqXHR, textStatus, errorThrown) {
                if (error) {
                    error(jqXHR, textStatus, errorThrown);
                }
            }
        });
    };
    lib.put = function(target, payload, success, error) {
        lib.request('PUT', target, payload, success, error);
    };
    lib.post = function(target, payload, success, error) {
        lib.request('POST', target, payload, success, error);
    };
    lib.get = function(args) {
        // args.url
        // args.success callback same as in $.ajax
        // args.error callback same as in $.ajax
        lib.request('GET', args.url, {}, args.success, args.error);
    };
    lib.delete = function(target, payload, success, error) {
        lib.request('DELETE', target, payload, success, error);
    };

    exports.delete = lib.delete;
    exports.get = lib.get;
    exports.put = lib.put;
    exports.post = lib.post;


});
