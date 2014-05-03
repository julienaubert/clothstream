require.register("scripts/product", function(exports, require, module) {
    ProductVM = function(template_name, item_repo, add_to_collection_vm, favorites_vm) {
        var self = this;
        self.template_name = template_name;
        self.product = ko.observable(null);
        self.add_to_collection_vm = add_to_collection_vm;
        self.favorites_vm = favorites_vm;

        self.load = function(params) {
            item_repo.fetch(params.product_id, self.product);
        }
    };

    exports.ProductVM = ProductVM;
});
