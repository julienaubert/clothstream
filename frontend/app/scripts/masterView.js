require.register("scripts/masterView", function(exports, require, module) {

    var pageLoader = require('scripts/pageLoader')


    DiscoverView = function(template_name, item_repo) {
        var self = this;
        self.template_name = template_name;
        self.items = item_repo.items;
        self.item_by_dbid = item_repo.item_by_dbid;

        self.load = function(params) {
        }

        self.item_loader = new pageLoader.Sequential(
            {
                url: "http://localhost:8000/item/items/",
                page_size: 20
            },
            function(props, page_loaded, data){
                var i;
                for (i = 0; i < data.results.length; i++) {
                    self.item_by_dbid[data.results[i].id] = data.results[i];
                }
                ko.utils.arrayPushAll(self.items, data.results);
                self.items.valueHasMutated();
        });

        self.scrolled = function(data, event) {
            var scroller = self.items.infinitescroll;
            var elem = event.target;
            self.items.infinitescroll.scrollY($(elem).scrollTop());
            self.item_loader.loadUntilEntry(scroller.lastVisibleIndex() + 1 + scroller.numItemsPadding());
        };

        self.items.infinitescroll.lastVisibleIndex.subscribe(function (last_visible_index) {
            if (last_visible_index == -1) {
                return;
            }
            var scroller = self.items.infinitescroll;
            self.item_loader.loadUntilEntry(scroller.lastVisibleIndex() + 1 + scroller.numItemsPadding());
        });

        self.item_loader.load(1);
    };

    ChosenProductView = function(template_name, item_repo) {
        var self = this;
        self.template_name = template_name;
        self.items = item_repo.items;
        self.item_by_dbid = item_repo.item_by_dbid;
        self.chosen_product = ko.observable(null);

        self.context = {
            chosen_product: self.chosen_product
        }

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
