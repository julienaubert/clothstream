require.register("scripts/masterView", function(exports, require, module) {

    var pageLoader = require('scripts/pageLoader')

    RangeFilter = function(initial_min, initial_max, max_possible) {
        var self = this;
        self.min = ko.observable(initial_min);
        self.max = ko.observable(initial_max);
        self.max_possible = ko.observable(max_possible);
        self.values = ko.computed(function() {
            return [self.min(), self.max()];
        });

        self.slide = function(event, ui) {
            self.min(ui.values[0]);
            self.max(ui.values[1]);
        }
    };


    ColorOption = function(obj) {
        var self = this;
        self.id = obj.id;
        self.name = obj.name;
        self.code = obj.code;
        self.toggled = ko.observable(obj.toggled);
        self.toggle = function() {
            self.toggled(!self.toggled());
        }
        self.is_multi = ko.computed(function() {
            // TODO: read from a color_categories.js file which is a json-string used by front/back)
            return self.id === 8;
        });
    }

    ColorFilter = function() {
        var self = this;

        var dummy_js = [
            // TODO: read from a color_categories.js file which is a json-string used by front/back)
            {id: 0, name: 'DarkRed', code: '#8B0000', toggled: false},
            {id: 1, name: 'DarkOliveGreen', code: '#556B2F', toggled: false},
            {id: 2, name: 'FloralWhite', code: '#FFFAF0', toggled: false},
            {id: 3, name: 'SaddleBrown', code: '#8B4513', toggled: false},
            {id: 4, name: 'DarkBlue', code: '#00008B', toggled: false},
            {id: 5, name: 'Black', code: '#222222', toggled: false},
            {id: 6, name: 'Chocolate', code: '#D2691E', toggled: false},
            {id: 7, name: 'Gold', code: '#FFD700', toggled: false},
            {id: 9, name: 'Dummy', code: '#ff0000', toggled: false},
            {id: 8, name: 'Multi-color', code: null, toggled: false}
        ];

        var make_options = function(json_obj) {
            var i, opts = [];
            for (i = 0; i < json_obj.length; i++) {
                opts.push(new ColorOption(json_obj[i]))
            }
            return opts;
        }

        self.options = ko.observableArray(make_options(dummy_js));

        self.all_toggled_id = ko.computed(function() {
            var i, opts = self.options(), all_id = [];
            for (i = 0; i < opts.length; i++) {
                if (!opts[i].toggled()) {
                    continue;
                }
                all_id.push(opts[i].id);
            }
            return all_id;
        });
    };


    ItemsFilter = function(dirty_callback) {
        var self = this;
        self.price_filter = new RangeFilter(0, 9999, 9999);
        self.color_filter = new ColorFilter();


        self.dirty = ko.computed(function() {
            dirty_callback({
                price: ko.toJS(self.price_filter),
                colors: ko.toJS(self.color_filter.all_toggled_id())
            });
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
                  return "http://localhost:8000/api/items/?" +
                            "page_size=" + page_size +
                            "&page=" + page +
                            "&min_price=" + filter.price.min +
                            "&max_price=" + filter.price.max +
                            "&colors=" + filter.colors
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


    exports.MasterViewModel = function(auth /* auth.Facebook, see auth.js */,
                                       item_repo /* ItemRepository */) {
        var self = this;

        // SHARED COMPONENTS
        self.item_repo = item_repo;
        self.auth = auth;


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
