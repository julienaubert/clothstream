require.register("scripts/discover", function(exports, require, module) {
    var req = require('scripts/req');
    var repository = require('scripts/repository');

    var construct_item_repo = function() {
        var favorites_to_unset = [];

        var repo = new repository.Repository({
            list_url: function(page_size, page, filter) {
                var url = "http://localhost:8000/api/items/?" +
                          "page_size=" + page_size +
                          "&page=" + page;
                if (filter.price && filter.price.min) {
                    url += "&min_price=" + filter.price.min;
                }
                if (filter.price && filter.price.max) {
                    url += "&max_price=" + filter.price.max;
                }
                if (filter.colors) {
                    url += "&colors=" + filter.colors;
                }
                if (filter.favorited_by) {
                    url += "&favorited_by=" + filter.favorited_by;
                }
                return url;
            },
            detail_url: function(db_id) {
                return "http://localhost:8000/api/items/" + db_id + "/";
            },
            on_init: function(obj) {
                obj.styletags = ko.observableArray(obj.styletags);
                obj.favorited_by_me = ko.observable(obj.favorited_by_me);
                obj.favorited_by_me.subscribe(function(value) {
                    if (value) {
                        // we need to keep track which items to unset when user signs-off
                        favorites_to_unset.push(obj.id);
                    }
                });
                // we won't re-fetch items when user favorite/unfavorite the items, so we modify favorited-count
                // when user changes favorited_by_me.
                // note: favorited_by_me should only be written to once received success from server
                obj.favorited_count = ko.observable(obj.favorited_count);
                obj.favorited_by_me.subscribe(function(value) {
                    if (value) {
                        obj.favorited_count(obj.favorited_count()+1);
                    } else {
                        obj.favorited_count(obj.favorited_count()-1);
                    }
                });
            }
        });
        repo.set_initial_favorites = function(favorited_items) {
            favorites_to_unset = favorited_items;
            var i, db_id, item;
            for (i = 0; i < favorited_items.length; ++i) {
                db_id = favorited_items[i];
                item = repo.cached(db_id);
                if (item) {
                    var pre_count = item.favorited_count();
                    item.favorited_by_me(true);
                    item.favorited_count(pre_count);
                }
            }
        };
        repo.unset_initial_favorites = function() {
            var i, db_id, item;
            for (i = 0; i < favorites_to_unset.length; ++i) {
                db_id = favorites_to_unset[i];
                item = repo.cached(db_id);
                if (item) {
                    var pre_count = item.favorited_count();
                    item.favorited_by_me(false);
                    item.favorited_count(pre_count);
                }
            }
        };
        return repo;
    };

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
        self.dirty.extend({ rateLimit: {timeout: 100, method: "notifyWhenChangesStop" }});
    };


    FavoritesVM = function(user) {
        var self = this;

        var add_favorite = function(item) {
            var success = function() { item.favorited_by_me(true); };
            var error = function() { /* TODO: display something to user. */ };
            req.post("/api/favorite-item/create/", JSON.stringify({'item': item.id}), success, error);
        };

        var remove_favorite = function(item) {
            var success = function() { item.favorited_by_me(false); };
            var error = function() { /* TODO: display something to user. */ };
            req.delete("/api/favorite-item/delete/" + item.id + "/", {}, success, error);
        };

        self.show_must_login = ko.observable(false);
        self.confirmed_must_login = function() {
            self.show_must_login(false);
        };

        self.clicked = function(item) {
            if (!user()) {
                self.show_must_login(true);
                return;
            }
            if (item.favorited_by_me()) {
                remove_favorite(item);
            } else {
                add_favorite(item);
            }
        };
    };

    AddToCollectionVM = function(user) {
        // user add an item to a collection, 2 steps: user clicks add, the item added is stored
        // once item added exists, the UI reacts and brings up pop-up to select which collection
        // once user confirms, the confirmed-add-item is called and we have the item and the collection
        // if not logged in: we reject the item and ask user to login instead
        var self = this;

        self.user = user;
        self.item_to_add = ko.observable(null);
        self.selected_collection = ko.observable();

        self.show_select_collection = ko.computed(function() {
            return self.item_to_add();
        });

        self.show_must_login = ko.observable(false);

        var request_add_item = function(item, collection, success, error) {
            req.post("/api/collecteditem/create/", JSON.stringify({'item': item.id, 'collection': collection.id}),
                     success, error);
        };

        self.confirmed_must_login = function() {
            self.show_must_login(false);
        };

        self.confirmed_add_item = function() {
            if (!self.selected_collection()) {
                // user selected "Choose..." in the drop-down
                return;
            }
            if (!_.contains(self.selected_collection().items(), self.item_to_add())) {
                var success = function() {
                    self.selected_collection().items.push(self.item_to_add());
                    self.item_to_add(null);
                };
                var error = function() {
                    self.item_to_add(null);
                    /* TODO: display something to user. */
                };
                request_add_item(self.item_to_add(), self.selected_collection(), success, error);
            };
        };

        self.add_to_collection = function(item) {
            if (!user()) {
                self.show_must_login(true);
                return;
            }
            self.item_to_add(item);
        };
    };


    DiscoverVM = function(template_name, item_repo, user_collection_repo, user, add_to_collection_vm, favorites_vm) {
        var self = this;
        self.template_name = template_name;
        self.user = user;
        self.item_repo = item_repo.create_filter();
        self.add_to_collection_vm = add_to_collection_vm;
        self.favorites_vm = favorites_vm;

        self.load_more = function(last_item_index) {
            self.item_repo.load_until_entry(last_item_index);
        };

        self.filter_view = new ItemsFilter(self.item_repo.apply_filter);

        self.load = function(params) {
            self.item_repo.load_until_entry(20);
        };

        var load_user_collection = ko.computed(function() {
            if (user()) {
                user().collections.load_until_entry(20);
            }
        });
    };


    exports.construct_item_repo = construct_item_repo;
    exports.DiscoverVM = DiscoverVM;
    exports.AddToCollectionVM = AddToCollectionVM;
    exports.FavoritesVM = FavoritesVM;
});
