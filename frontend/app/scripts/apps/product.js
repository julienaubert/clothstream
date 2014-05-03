require.register("scripts/product", function(exports, require, module) {
    var req = require('scripts/req');

    AddStyleTagToItemVM = function(user, styletag_repo) {
        // this is very similar to AddItemToCollectionVM - yet different.
        var self = this;
        self.styletags = styletag_repo.create_filter();
        self.styletags.load_until_entry(100);

        self.target_item = ko.observable(null);
        self.selected_styletag = ko.observable();

        self.show_select_styletag = ko.computed(function() {
            return self.target_item();
        });

        self.show_must_login = ko.observable(false);

        var request_add_styletag_to_item = function(item, styletag, success, error) {
            req.post("/api/styletag-item/create/", JSON.stringify({'item': item.id, 'styletag': styletag.name}),
                     success, error);
        };

        self.confirmed_must_login = function() {
            self.show_must_login(false);
        };

        self.confirmed_add_styletag = function() {
            if (!self.selected_styletag()) {
                // user selected "Choose..." in the drop-down
                return;
            }
            if (!_.contains(self.target_item().styletags(), self.selected_styletag())) {
                var success = function() {
                    self.target_item().styletags.push(self.selected_styletag().name);
                    self.target_item(null);
                };
                var error = function() {
                    self.target_item(null);
                    /* TODO: display something to user. */
                };
                request_add_styletag_to_item(self.target_item(), self.selected_styletag(), success, error);
            };
        };

        self.add_to_item = function(item) {
            if (!user()) {
                self.show_must_login(true);
                return;
            }
            console.log("lets go add styletag");
            self.target_item(item);
        };
    };


    ProductVM = function(template_name, item_repo, add_to_collection_vm, favorites_vm, add_styletag_to_item_vm) {
        var self = this;
        self.template_name = template_name;
        self.product = ko.observable(null);
        self.add_to_collection_vm = add_to_collection_vm;
        self.favorites_vm = favorites_vm;
        self.add_styletag_to_item_vm = add_styletag_to_item_vm
        self.load = function(params) {
            item_repo.fetch(params.product_id, self.product);
        }
    };

    exports.ProductVM = ProductVM;
    exports.AddStyleTagToItemVM = AddStyleTagToItemVM;
});
