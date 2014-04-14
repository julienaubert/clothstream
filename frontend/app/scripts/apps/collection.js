require.register("scripts/collection", function(exports, require, module) {
    CollectionView = function(template_name, collection_repo, route_when_delete) {
        var self = this;
        self.template_name = template_name;
        self.collection = ko.observable(null);

        self.load = function(params) {
            collection_repo.fetch(params.collection_id, self.collection);
        }

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

    exports.CollectionView = CollectionView;
});
