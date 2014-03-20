require.register("scripts/homeView", function(exports, require, module) {

    var pageLoader = require('scripts/pageLoader')

    function Item(data) {
        this.thumb_title = ko.observable(data.thumb_title);
        this.thumb_image_url = ko.observable(data.thumb_image_url);
        this.link = ko.observable(data.link);
    }



    exports.HomeViewModel = function() {
        var self = this;
        self.items = ko.observableArray([]);
        self.items.extend({ infinitescroll: {} });
        self.item_by_dbid = {};
        self.grid = ko.observable();
        self.chosen_product = ko.observable(null);
        self.active_view = ko.observable({});

        self.item_loader = new pageLoader.Sequential(
            {   url: "http://localhost:8000/item/items/",
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

        self.go_to_product = function(product) {
            console.log("go to prod: %o", product)
            location.hash = getSlug(product.thumb_title) + "/" + product.id;
        }

        self.scrolled = function(data, event) {
            var scroller = self.items.infinitescroll;
            var elem = event.target;
            self.items.infinitescroll.scrollY($(elem).scrollTop());
            self.item_loader.loadUntilEntry(scroller.lastVisibleIndex() + 1 + scroller.numItemsPadding());
        };

        self.grid.subscribe(function (grid) {
            console.log("grid is doing stuff..")
                    console.log("\tis g vis: ", self.active_view().home);

            var scroller = self.items.infinitescroll;
            scroller.viewportWidth(grid.viewport.width);
            scroller.viewportHeight(grid.viewport.height);
            scroller.itemWidth(grid.itemport.width);
            scroller.itemHeight(grid.itemport.height);
            self.item_loader.loadUntilEntry(scroller.lastVisibleIndex() + 1 + scroller.numItemsPadding());
        });


        // ROUTING

        self.route_product = function(product_id) {
            self.active_view({'product': true});
            console.log("route product")
            if (self.item_by_dbid[product_id]) {
                self.chosen_product(self.item_by_dbid[product_id])
            } else {
                $.get("http://localhost:8000/item/items/" + product_id + "/", function(result) {
                    self.item_by_dbid[product_id] = result;
                    self.chosen_product(result);
                });
            }
        };

        self.route_home = function() {
            self.active_view({'home': true});
            console.log("route home")
            self.chosen_product(null);
        }


        Sammy(function() {
            this.get('#:productThumb/:productId', function() { self.route_product(this.params.productId); });
            this.get('', function() { self.route_home(); });
        }).run();

        self.item_loader.load(1);

    };

});
