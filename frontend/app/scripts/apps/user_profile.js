require.register("scripts/profile", function(exports, require, module) {
    UserProfileView = function(template_name, user_repo) {
        var self = this;
        self.template_name = template_name;
        self.user = ko.observable(false);

        self.load = function(params) {
            user_repo.fetch(params.user_id, function(user) {
                self.user(user);
            }, function(status) {
                // failed fetch user (e.g. 404)
                self.user(false);
            });
        };

        self.load_more_collections = function(last_index) {
            self.user().collections.load_until_entry(last_index);
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
            console.log('loc got params: %o', params)
            return "profile/" + params.user_id + "/";
        };

        self.go_to_collections = function() {
            location.hash = self.location({user_id:self.user().id}) + "collections/";
        };

        self.go_to_favorites = function() {
            location.hash = self.location({user_id:self.user().id}) + "favorites/";
        };


    };

    exports.UserProfileView = UserProfileView;
});
