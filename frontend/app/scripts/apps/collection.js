require.register("scripts/collection", function(exports, require, module) {
    var req = require('scripts/req');

    RemoveItemFromCollectionVM = function(user) {
        var self = this;
        self.collection = ko.observable(null);

        var request_remove_item = function(item, collection, success, error) {
            req.delete("/api/collecteditem/delete/" + collection.id + "/", JSON.stringify({'item': item.id}),
                       success, error);
        };

        self.can_remove = function() {
            return self.collection() && self.collection().owned_by_me;
        };

        self.remove = function(item, event) {
            var success = function() {
                var items = _.without(self.collection().items(), item);
                self.collection().items(items);
            };
            var error = function() {
                // TODO: show error to user
            };
            request_remove_item(item, self.collection(), success, error);
        };
    };


    CollectionVM = function(template_name, collection_repo, route_when_delete, add_to_collection_vm, favorites_vm,
                            remove_from_collection_vm) {
        var self = this;
        self.template_name = template_name;
        self.collection = ko.observable(null);
        self.add_to_collection_vm = add_to_collection_vm;
        self.favorites_vm = favorites_vm;
        self.remove_from_collection_vm = remove_from_collection_vm;

        self.load = function(params) {
            collection_repo.fetch(params.collection_id, function(object) {
                self.collection(object);
                self.remove_from_collection_vm.collection(object);
            });
        };

        // TODO: duplicated code for deleting here and for deleting in CollectionsView
        self.collection_to_delete = ko.observable(null);

        self.delete = function(collection) {
            self.collection_to_delete(collection);
        };

        self.confirm_delete = function(collection, event) {
            collection = ko.unwrap(collection);
            collection_repo.delete(ko.unwrap(collection.id));
            self.collection_to_delete(null);
            route_when_delete();
        };

    };

    exports.CollectionVM = CollectionVM;
    exports.RemoveItemFromCollectionVM = RemoveItemFromCollectionVM;
});
