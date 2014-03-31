require.register("scripts/auth", function(exports, require, module) {

    var fb = require('scripts/facebook_sdk');
    var user = require('scripts/user');

    var BackendAuth = function(base_url, auth, collection_repo) {
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
            // post token to backend
            self.post('register/facebook/', JSON.stringify({"access_token": token}), function(response) {
                var default_collection = collection_repo.register(response.default_collection);
                var collections = collection_repo.create_filter({'owner': response.id});
                collections.load_until_entry(20); // TODO: load_all
                user.sign_in(response.id, response.name, default_collection, collections);
            });
        });
    };


    var FacebookAuth = function() {
        var self = this;
        self.connected = ko.observable(undefined);
        self.token = ko.observable(undefined)

        var auth_change = function(response) {
            self.connected(response.status === 'connected');
            self.show_login(!self.connected());
            self.show_logout(self.connected());
            if (self.connected()) {
                self.token(response.authResponse.accessToken);
            }
        };

        self.throttled_login_check = function() {
            // this is for the case where they have signed-in/out via facebook.com
            FB.getLoginStatus(function(response) {
                auth_change(response);
            }, true);
            setTimeout(self.periodic_check, 5000);
        }

        self.fb_init = function() {
            self.throttled_login_check();
            FB.Event.subscribe('auth.authResponseChange', function(response) {
                auth_change(response);
            });
        };

        self.logout = function() {
            FB.logout();
            user.sign_out();
        };

        self.show_login = ko.observable(false);
        self.show_logout = ko.observable(false);
    };

    exports.create_facebook_auth = function(collection_repo) {
        var auth = new FacebookAuth();
        fb.load_sdk(function() {
            // at this point 'FB' is available and FB.init has been called
            auth.fb_init();
            new BackendAuth('//localhost:8000/api/', auth, collection_repo);
        });
        return auth;
    };


});