require.register("scripts/collections", function(exports, require, module) {
    var repository = require('scripts/repository');
    var req = require('scripts/req');
    var auth = require('scripts/auth');


    var put = function(target, payload, callback) {
        $.csrfAjax({
            type: 'PUT',
            url: target,
            async: true,
            contentType: "application/json; charset=utf-8",
            data: payload,
            success: function(data) {
                if (callback) {
                    callback(data);
                }
            }
        });
    };

    var CollectionsView = function(template_name, collection_repo, collection_owner) {
        var self = this;
        self.template_name = template_name;

        self.collections = collection_repo.create_filter();
        self.collections.objects.extend({ infinitescroll: {} });
        self.collections.objects.infinitescroll.lastVisibleIndex.subscribe(function (last_visible_index) {
            if (last_visible_index == -1) {
                return;
            }
            var scroller = self.collections.objects.infinitescroll;
            self.collections.load_until_entry(scroller.lastVisibleIndex() + 1 + scroller.numItemsPadding())
        });

        self.load = function(params) {
            self.collections.load_until_entry(20);
        };

        // TODO: duplicated code for deleting here and for deleting in CollectionView
        self.collection_to_delete = ko.observable(null);

        self.delete = function(collection) {
            self.collection_to_delete(collection);
        };

        self.confirm_delete = function(collection, event) {
            collection = ko.unwrap(collection);
            collection_repo.delete(ko.unwrap(collection.id), function() {
                self.collections.objects.remove(collection);
            });
            self.collection_to_delete(null);
        };

        self.create_new = function(params) {
            var data = {title: 'New collection', items: []};
            collection_repo.create(data, function(obj) {
                // no sorting / order does not matter, so push it immediately to be displayed
                self.collections.objects.unshift(obj);
            })
        };

        self.change_mine = function() {
            self.collections.apply_filter({'owner': collection_owner().id()});
        };

        self.change_all_public = function() {
            self.collections.apply_filter({'public': 'True'});
        };
    };

    var construct_collection_repo = function() {
        var _patch_json = function() {
            var c = this;
            return ko.toJS({
                items: _.map(c.items(), function(item) { return item.id; }),
                title: c.title,
                description: c.description,
                public: c.public
            });
        };
        var repo = new repository.Repository({
            list_url: function(page_size, page, filter) {
                var url = "http://localhost:8000/api/collections/?" +
                           "page_size=" + page_size +
                           "&page=" + page;
                if (filter.owner) {
                    url += "&owner=" + filter.owner;
                }
                if (filter.public) {
                    url += "&public=" + filter.public
                }
                return url;
            },
            detail_url: function(db_id) {
                return "http://localhost:8000/api/collections/" + db_id + "/";
            },
            create_url: function(data) {
                return '/api/collections/create/';
            },
            delete_url: function(db_id) {
                return "http://localhost:8000/api/collections/delete/" + db_id + "/";
            },
            on_init: function(collection) {
                collection.items = ko.observableArray(collection.items);
                collection.title = ko.observable(collection.title);
                collection.description = ko.observable(collection.description);
                collection.public = ko.observable(collection.public);
                collection._patch_json = _patch_json;

                var put_update = function(payload) {
                    req.put("/api/collections/update/" + collection.id + "/", payload, function() {
                    });
                };

                collection._last_patch_json = undefined;
                collection.dirty = ko.computed(function() {
                    // KO will fire also when we have no changes (only primitives are stopped if write same value)
                    // so e.g. if the same array was written, it will fire. we should not send such a patch to the
                    // server. Therefore we check that the stringified data actually differs from the last time we
                    // sent it.
                    // This has a cost in memory
                    var first_call = collection._last_patch_json === undefined;
                    if (first_call) {
                    // first call is the update when we got the object, skip post on that one
                        collection._last_patch_json = JSON.stringify(collection._patch_json()); // ensure we subscribe
                        return;
                    }
                    var new_patch = JSON.stringify(collection._patch_json());
                    if (new_patch != collection._last_patch_json) {
                        put_update(new_patch);
                        collection._last_patch_json = new_patch;
                    }
                });
                collection.dirty.extend({ rateLimit: {timeout: 500, method: "notifyWhenChangesStop" }});
            }
        });

        return repo;
    };

    exports.CollectionsView = CollectionsView;
    exports.construct_collection_repo = construct_collection_repo;
});
