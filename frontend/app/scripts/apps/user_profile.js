require.register("scripts/profile", function(exports, require, module) {
    var discover = require('scripts/discover');

    UserProfileVM = function(template_name, user_repo, add_to_collection_vm, favorites_vm) {
        var self = this;
        self.template_name = template_name;
        self.user_viewed = ko.observable(false);
        self.menu = ko.observable();
        self.add_to_collection_vm = add_to_collection_vm;
        self.favorites_vm = favorites_vm;

        self.load = function(params) {
            user_repo.fetch(params.user_id, function(user) {
                self.user_viewed(user);
                self.load_more_collections(20);
                self.load_more_favorites(20);
            }, function(status) {
                // failed fetch user (e.g. 404)
                self.user_viewed(false);
            });
            self.menu(params.menu);
        };

        self.show_collections = ko.computed(function() {
            return self.menu() === 'collections';
        });

        self.show_favorites = ko.computed(function() {
            return self.menu() === 'favorites';
        });

        self.load_more_collections = function(last_index) {
            self.user_viewed().collections.load_until_entry(last_index);
        };

        self.load_more_favorites = function(last_index) {
            self.user_viewed().favorites.load_until_entry(last_index);
        };

        self.route = function(register) {
            register('#profile/:user_id/$', function(params) {
                return {user_id: params.user_id, menu: 'collections'};
            });
            register('#profile/:user_id/collections/$', function(params) {
                return {user_id: params.user_id, menu: 'collections'};
            });
            register('#profile/:user_id/favorites/$', function(params) {
                return {user_id: params.user_id, menu: 'favorites'};
            });
        };

        self.location = function(params) {
            return "profile/" + params.user_id + "/";
        };

        self.go_to_collections = function() {
            location.hash = self.location({user_id:self.user_viewed().id}) + "collections/";
        };

        self.go_to_favorites = function() {
            location.hash = self.location({user_id:self.user_viewed().id}) + "favorites/";
        };


    };

    exports.UserProfileVM = UserProfileVM;
});
