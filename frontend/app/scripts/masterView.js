require.register("scripts/masterView", function(exports, require, module) {

    var pageLoader = require('scripts/pageLoader')


    ItemsFilter = function(dirty_callback) {
        var self = this;
        self.min_price = ko.observable(0);
        self.max_price = ko.observable(9999);
        self.max_possible_price = ko.observable(9999);
        self.price_values = ko.computed(function() {
            return [self.min_price(), self.max_price()];
        });

        self.price_slide = function(event, ui) {
            self.min_price(ui.values[0]);
            self.max_price(ui.values[1]);
        }
        self.dirty = ko.computed(function() {
            dirty_callback(ko.toJS(self));
        });


        self.dirty.extend({ rateLimit: 500 });

    };


    DiscoverView = function(template_name, item_repo) {
        var self = this;
        self.template_name = template_name;
        self.items = item_repo.items;
        self.item_by_dbid = item_repo.item_by_dbid;
        self.filter_view = new ItemsFilter(item_repo.apply_filter);

        self.load = function(params) {
        }

        self.items.infinitescroll.lastVisibleIndex.subscribe(function (last_visible_index) {
            if (last_visible_index == -1) {
                return;
            }
            var scroller = self.items.infinitescroll;
            item_repo.load_until_entry(scroller.lastVisibleIndex() + 1 + scroller.numItemsPadding())
        });

    };


    ChosenProductView = function(template_name, item_repo) {
        var self = this;
        self.template_name = template_name;
        self.items = item_repo.items;
        self.item_by_dbid = item_repo.item_by_dbid;
        self.chosen_product = ko.observable(null);

        self.load = function(params) {
            if (self.item_by_dbid[params.product_id]) {
                self.chosen_product(self.item_by_dbid[params.product_id])
            } else {
                $.get("http://localhost:8000/item/items/" + params.product_id + "/", function(result) {
                    self.item_by_dbid[params.product_id] = result;
                    self.chosen_product(result);
                });
            }
        }
    };


    ItemRepository = function() {
        var self = this;
        self.items = ko.observableArray([]);
        self.items.extend({ infinitescroll: {} });
        self.item_by_dbid = {};

        make_item_loader = function(filter) {
            var item_loader = new pageLoader.Sequential(
                20,
                function(page_size, page) {
                  return "http://localhost:8000/item/items/?" +
                            "page_size=" + page_size +
                            "&page=" + page +
                            "&min_price=" + filter.min_price +
                            "&max_price=" + filter.max_price
                },
                function(props, page_loaded, data){
                    var i;
                    for (i = 0; i < data.results.length; i++) {
                        self.item_by_dbid[data.results[i].id] = data.results[i];
                    }
                    ko.utils.arrayPushAll(self.items, data.results);
                    self.items.valueHasMutated();
            });
            return item_loader;
        }

        self.item_loader = make_item_loader({});

        self.apply_filter = function(filter) {
            self.items([])
            self.item_loader = make_item_loader(filter);
            self.load_until_entry(20);
        };

        self.load_until_entry= function(end_index) {
            self.item_loader.loadUntilEntry(end_index);
        }

    };


    exports.MasterViewModel = function() {
        var self = this;

        // SHARED COMPONENTS
        self.item_repo = new ItemRepository();

        // VIEWS
        self.views = {
            'chosen_product': new ChosenProductView("chosen_product.html", self.item_repo),
            'discover': new DiscoverView("discover.html", self.item_repo)
        };
        self.active_view = ko.observable();


        // ROUTING
        self.go_to_product = function(product) {
            location.hash = getSlug(product.thumb_title) + "/" + product.id;
        }

        self.route = function(view, data) {
            view.load(data);
            self.active_view(view);
        }

        Sammy(function() {
            this.get('#:productThumb/:productId', function() {
                self.route(self.views.chosen_product, { product_id: this.params.productId });
            });
            this.get('', function() { self.route(self.views.discover) });
        }).run();


    };

});
