require.register("scripts/masterView", function(exports, require, module) {

    var pageLoader = require('scripts/pageLoader');
    var collections = require('scripts/collections');
    var collection = require('scripts/collection');
    var discover = require('scripts/discover');
    var product = require('scripts/product');

    exports.MasterViewModel = function(auth /* auth.Facebook, see auth.js */,
                                       item_repo /* ItemRepository */,
                                       collection_repo /* CollectionRepository */,
                                       user) {
        var self = this;

        // SHARED COMPONENTS
        self.item_repo = item_repo;
        self.auth = auth;
        self.user = user;
        self.collection_repo = collection_repo;


        // Routes
        self.go_to_collection = function(collection) {
            location.hash = "collections/" + collection.id;
        }

        self.go_to_product = function(product) {
            location.hash = getSlug(product.thumb_title) + "/" + product.id;
        }

        self.go_to_discover = function() {
            location.hash = "discover/"
        }

        self.go_to_collections = function() {
            location.hash = "collections/"
        }

        // VIEWS
        self.views = {
            'chosen_product': new product.ProductView("chosen_product.html", self.item_repo),
            'discover': new discover.DiscoverView("discover.html", self.item_repo, self.collection_repo, user),
            'collections': new collections.CollectionsView("collections.html", self.collection_repo, user),
            'collection': new collection.CollectionView("collection.html", self.collection_repo, self.go_to_collections)
        };
        self.active_view = ko.observable();


        // ROUTING
        self.route = function(view, data) {
            view.load(data);
            self.active_view(view);
        }

        Sammy(function() {
            this.get('#collections/:collectionId', function() {
                self.route(self.views.collection, { collection_id: this.params.collectionId});
            });
            this.get('#:productThumb/:productId', function() {
                self.route(self.views.chosen_product, { product_id: this.params.productId });
            });
            this.get('#collections/', function() { self.route(self.views.collections) });
            this.get('#discover/', function() { self.route(self.views.discover) });
            this.get('', function() { self.route(self.views.discover) });
        }).run();


    };

    /*** sketch on how to make masterView a general app-router:

        var location_patterns = [
            {
             'name': 'chosen_product',
             'view': new product.ProductView("chosen_product.html", item_repo),
             'location': '#:productThumb/:productId',
             // reverse_location is required if can activate view given some data
             'reverse_location': function(product) {
                 // getSlug from speakingurl
                 return getSlug(product.thumb_title) + "/" + product.id;
             },
             // view_args_from_location: is required if view needs data args from location
             'view_args_from_location': function(location_params) {
                return { product_id: location_params.productId }
              }
            },
            {
             'name': 'discover',
             'view': new discover.DiscoverView("discover.html", item_repo)
             'location': '#discover'
             // by default: reverse_location is created returning location
            },
        ]

        // in index.html we activate views (e.g. on click events) by view-name (reverse-location):

            app.activate(app.reverse_location('chosen_product', product));
            app.activate(app.reverse_location('discover'));

        // or by links:

            <a data-bind="attrib: {href: app.reverse_location('chosen_product', product)">Share link</a>

        // how ViewRouter does it:

            function reverse_location(name, data) {
                var pattern = self.locations_by_name[name];
                if (!pattern.reverse_location) {
                    return pattern.location;
                } else {
                    return pattern.reverse_location(data);
                }
            };

            function activate(location) {
                self.location.hash = location.location
            }

            for each pattern in location_patterns, we make sammy router:

              sammy.get(pattern.location, function() {
                    var data = {};
                    if (pattern.view_args_from_location) {
                        data = pattern.view_args_from_location(sammy.params)
                    }
                    pattern.view.load(data);
                    self.active_view(pattern.view);
              });

    ***/

});
