require.register("scripts/discover", function(exports, require, module) {
    var repository = require('scripts/repository');

    var construct_item_repo = function() {
        return new repository.Repository({
            list_url: function(page_size, page, filter) {
                return "http://localhost:8000/api/items/?" +
                        "page_size=" + page_size +
                        "&page=" + page +
                        "&min_price=" + filter.price.min +
                        "&max_price=" + filter.price.max +
                        "&colors=" + filter.colors;
            },
            detail_url: function(db_id) {
                return "http://localhost:8000/api/items/" + db_id + "/";
            }
        });
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


    DiscoverView = function(template_name, item_repo, user_collection_repo, user) {
        var self = this;
        self.template_name = template_name;
        self.user = user;
        self.item_repo = item_repo.create_filter();

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

        self.item_to_add = ko.observable(null);
        self.selected_collection = ko.observable();

        self.show_add_to_collection = ko.computed(function() {
            return self.item_to_add() && user();
        });

        self.show_must_login = ko.computed(function() {
            return self.item_to_add() && !user();
        });

        self.confirmed_must_login = function() {
            self.item_to_add(null);
        };

        self.confirmed_add_item = function() {
            if (!_.contains(self.selected_collection().items(), self.item_to_add())) {
                self.selected_collection().items.push(self.item_to_add());
            };
            self.item_to_add(null);
        };

        self.add_to_collection = function(item) {
            self.item_to_add(item);
        };
    };


    exports.construct_item_repo = construct_item_repo;
    exports.DiscoverView = DiscoverView;
});
