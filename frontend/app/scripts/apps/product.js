require.register("scripts/product", function(exports, require, module) {
    ProductView = function(template_name, item_repo) {
        var self = this;
        self.template_name = template_name;
        self.product = ko.observable(null);

        self.load = function(params) {
            item_repo.fetch(params.product_id, self.product);
        }
    };

    exports.ProductView = ProductView;
});
