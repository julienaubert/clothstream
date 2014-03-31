require.register("scripts/user", function(exports, require, module) {

    var User = function(user_id, name, default_collection, collections) {
        var self = this;
        self.id = ko.observable(user_id);
        self.name = ko.observable(name);
        self.default_collection = ko.observable(default_collection);
        self.collections = ko.observable(collections);
    };

    var anonymous = new User();

    var logged_in_as = ko.observable(anonymous);

    var sign_in = function(user_id, name, default_collection, collections) {
        logged_in_as(new User(user_id, name, default_collection, collections));
    };

    var sign_out = function() {
        logged_in_as(anonymous);
    };

    exports.user = logged_in_as;
    exports.sign_in = sign_in;
    exports.sign_out = sign_out;

});
