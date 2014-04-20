require.register("scripts/auth", function(exports, require, module) {
    var fb = require('scripts/facebook_sdk');
    var req = require('scripts/req');
    var repository = require('scripts/repository');

    var user = ko.observable(false);

    var construct_user_repo = function(collection_repo) {
        var json_patch = function(obj) {
            return ko.toJS({
                about_me: obj.about_me
            });
        };
        var put_update = function(obj, payload) {
            req.put("/api/userprofile/update/" + obj.id + "/", payload, function() {
            });
        };

        var repo = new repository.Repository({
            list_url: function(page_size, page, filter) {
                var url = "http://localhost:8000/api/userprofile/?" +
                           "page_size=" + page_size +
                           "&page=" + page;
                return url;
            },
            detail_url: function(db_id) {
                return "http://localhost:8000/api/userprofile/" + db_id + "/";
            },
            on_init: function(obj) {
                obj.is_authenticated = ko.observable(false);
                obj.about_me = ko.observable(obj.about_me);
                obj.collections = collection_repo.create_filter({'owner': obj.id});

                obj._last_patch_json = undefined;
                obj.dirty = ko.computed(function() {
                    // KO will fire also when we have no changes (only primitives are stopped if write same value)
                    // so e.g. if the same array was written, it will fire. we should not send such a patch to the
                    // server. Therefore we check that the stringified data actually differs from the last time we
                    // sent it.
                    // This has a cost in memory
                    var first_call = obj._last_patch_json === undefined;
                    if (first_call) {
                        // first call is the update when we got the object, skip post on that one
                        obj._last_patch_json = JSON.stringify(json_patch(obj)); // ensure we subscribe
                        return;
                    }
                    var new_patch = JSON.stringify(json_patch(obj));
                    if (new_patch != obj._last_patch_json) {
                        put_update(obj, new_patch);
                        obj._last_patch_json = new_patch;
                    }
                });
                obj.dirty.extend({ rateLimit: {timeout: 500, method: "notifyWhenChangesStop" }});
            }
        });

        return repo;
    };


    var BackendAuth = function(base_url, auth, user_repo) {
        self.post = function(service, payload, callback) {
            var target = base_url + service;
            $.csrfAjax({
                type: 'POST',
                url: target,
                async: true,
                contentType: "application/json; charset=utf-8",
                data: payload,
                success: function(data) {
                    if (callback) {
                        callback(data);
                    }
                }
            });
        };

        auth.token.subscribe(function(token) {
            self.post('register/facebook/', JSON.stringify({"access_token": token}), function(response) {
                user(user_repo.register(response));
            });
        });
    };


    var FacebookAuth = function() {
        var self = this;
        self.connected = ko.observable(undefined);
        self.token = ko.observable(undefined)
        self.user = user;

        var auth_change = function(response) {
            self.connected(response.status === 'connected');
            self.show_login(!self.connected());
            self.show_logout(self.connected());
            if (self.connected()) {
                self.token(response.authResponse.accessToken);
            } else {
                user(false);
            }
        };

        self.throttled_login_check = function() {
            // this is for the case where they have signed-in/out via facebook.com
            FB.getLoginStatus(function(response) {
                auth_change(response);
            }, true);
            setTimeout(self.periodic_check, 5000);
        };

        self.fb_init = function() {
            self.throttled_login_check();
            FB.Event.subscribe('auth.authResponseChange', function(response) {
                auth_change(response);
            });
        };

        self.logout = function() {
            FB.logout();
            user(false);
        };

        self.show_login = ko.observable(false);
        self.show_logout = ko.observable(false);
    };

    exports.construct_user_repo = construct_user_repo

    exports.create_facebook_auth = function(user_repo) {
        var auth = new FacebookAuth();
        fb.load_sdk(function() {
            // at this point 'FB' is available and FB.init has been called
            auth.fb_init();
            new BackendAuth('//localhost:8000/api/', auth, user_repo);
        });
        return auth;
    };


});