require.register("scripts/repository", function(exports, require, module) {
    // Simplify interacting with a restful resource: cache locally fetched objects, filters etc.
    //
    // How cache is handled:
    // - fetch: assumes local cache is not dirty
    // - force-fetch: assumes local cache is dirty
    // - apply-filter: assumes local cache is dirty
    // - when write to cache: object instance is invariant (i.e. use same object always and update its fields):
    //      var o1 = repo.fetch(1);
    //      var o1_again = repo.force_fetch(1);
    //      // o1 and o1_again are the same objects (i.e. o1 is updated)
    // - create/delete: only writes to cache once received success from server
    // - deleted objects are kept in cache with property _destroyed:
    //      makes it easy to subscribe to deletes,
    //      and, to maintain entity identity:
    //          obj = fetch pk 1,
    //          delete pk 1
    //          server creates pk 1 again,
    //          obj_again = force_fetch
    //          => obj===obj_again
    //
    // Main features:
    // - simple to hookup to a json api (list_url, detail_url. action urls to be supported)
    // - supports paging when reading lists
    // - supports caching
    // - memory efficient (by default, just store the returned json data, see on_init for making observables,
    //                     note: deleted objects will remain in cache with one observable though)
    // - easy hook-in to modify the objects (e.g. add fields or methods) (see on_init)
    //
    // Decision:
    // - no "local-querying", this is a dumb repository
    //  (however, maybe: js code mocking django-queryset, serialize as a param and django-app deserialize this param
    //   into a queryset and return list:
    //      var qs = Query("User", "django.contrib.auth.models").filter(pk__in=[1,2]))
    //      qs_repo = repo.create_filter(qs)
    //      (deserializing must take white-listed models/fields for security though)
    // - no "relations", you can set this up yourself in on_init
    //
    // TODO:
    // - use promises!!
    // - rename fetch to get / force_get
    // - think about filters and when objects are created - currently filters are not affected at all
    //      create filters - take optional callback which is called each time a new object is added to its source-repo
    //      that way can decide if include in filter and where to insert it (consider eg "new collection" which now
    //      manually is added to user.collections - a filtered repo)

    var pageLoader = require('scripts/pageLoader');
    var req = require('scripts/req');

    var FilteredRepo = function(repository, list_url, filter) {
        // Represents a filtered resource (from list_url), the filter is the params in the list_url
        // See repository.create_filter
        //
        // Shares cache with repository
        // will write to local cache (subsequent fetch will be O(1))
        // when loading filtered results, it will NOT read from local cache
        //
        // Decisions:
        // - no caching on filter:
        //      it may be faster in some cases to instead say: hey server give me each id for this filter,
        //      then locally filter out all id's we already know and ask server for only that data we do not have.
        //      that case is likely vary rare (possibly for low bandwidth when client has built-up large local cache).
        //      we are however, *totally ignorant* of this case. the typical case is that the round-trip is expensive
        //      and client does not have that much of the resulting-filter in cache). to be ignorant makes it less
        //      complex
        //
        // Todo:
        // - support cache filters, e.g. apply_filter(filter) and force_apply_filter(filter)
        //     so if ask apply same filter, will do e.g. self.objects(_filter_caches[hash_key_from_filter(filter)])

        var self = this;
        self.repo = repository;
        self.objects = ko.observableArray([]);

        var make_loader = function(filter) {
            var loader = new pageLoader.Sequential(
                20,
                function(page_size, page) {
                    return list_url(page_size, page, filter);
                },
                function(props, page_loaded, data){
                    var i;
                    var objs = [];
                    for (i = 0; i < data.results.length; i++) {
                        objs.push(self.repo._update(data.results[i]));
                    }
                    ko.utils.arrayPushAll(self.objects, objs);
                    self.objects.valueHasMutated();
            });
            return loader;
        }
        self.loader = make_loader(filter);

        self.load_until_entry= function(end_index) {
            self.loader.loadUntilEntry(end_index);
        };

        self.fetch = repository.fetch;
        self.force_fetch = repository.force_fetch;

        self.apply_filter = function(filter) {
            self.objects([]);
            self.loader = make_loader(filter);
            self.load_until_entry(20);
        }
    };


    var Repository = function(spec) {
        // Simplifies loading objects from a rest-api for read/delete purposes. Uses cache to avoid re-fetching.
        // spec:
        //  list_url: function(page_size, page, filter) returning an url to a restful backend giving a list of objects
        //  detail_url: function(db_id) returning a url to a restful backend giving object with db_id
        //  create_url: function(data) returning a url to a restful backend (data is the data to be sent)
        //  delete_url: function(db_id) returning a url to a restful backend to POST delete to
        //  [on_init]: function(target) called exactly once, the first time when object is created (is optional),
        //              target is the object you should update, you can make fields observables, add methods, subscribe
        //              to your observables etc. If, after on_init the same object is fetched again
        //              (e.g. force_fecth or apply_filter), on_init will NOT be called. However, repository will check
        //              type of fields and if they are observables, it will write to them the new data, so you can get
        //              changes the normal way (by subscribing to the observables).
        //  repo_relations: key-value where key is field and value is a repository instance, this is used to ensure
        //                  that nested-data is registered to other repositories as required.
        //                  for example, if we have a collection repository, and a collection has an array of items
        //                  where each item should be in an item_repository, then we declare:
        //                  { items: item_repo }
        //                  this repository will then ensure that item_repo.register(item_data) is called whenever
        //                  a collection is updated.
        //
        // Note: use on_init to make observables, or add additional fields/methods, example:
        //  spec['on_init'] = function(target) {
        //      target.first_name = ko.observable(target.first_name);
        //      target.last_name = ko.observable(target.last_name);
        //      target.full_name = ko.computed(function() {
        //          return target.first_name() + ' ' + target.last_name();
        //      });
        //  }
        // Note: each object has a _destroy ko.observable (delete will write true to it)
        var self = this;
        var _by_dbid = {};  // contains all objects ever loaded
        var _prev_filter = {};
        var _destroy_field = '_destroy';

        spec.requests = spec.requests || {};
        spec.requests.post = spec.requests.post || req.post;
        spec.requests.put = spec.requests.put || req.put;
        spec.requests.delete = spec.requests.delete || req.delete;
        spec.requests.get = spec.requests.get || req.get;

        self._delete = function(db_id) {
            var target = _by_dbid[db_id];
            target[_destroy_field](true);
        };

        self._update = function(data) {
            // We need preserve identity, e.g., force_fetch(1) === force_fetch(1) must be an invariant.
            // We guarantee this by always querying _by_dbid and making sure that an entry is created at most once.
            // Subsequent updates only updates the object (does not recreate it).
            // Since javascript is single-threaded, we do not need to consider re-entrance issues.
            // I.e, while code is being executed in _update, there is no chance some other thread will re-enter it.
            // Therefore, we need no locks, just simply check if _by_dbid[x] has been defined yet or not.
            // There seems to be some cases where this is not exactly true:
            // http://stackoverflow.com/questions/2734025/is-javascript-guaranteed-to-be-single-threaded
            // however, _update does not by itself cause any dom-events, nor brings up any modal dialogs - so should be
            // fine.
            var initial = !_by_dbid[data.id];
            _by_dbid[data.id] = _by_dbid[data.id] || {};
            var target = _by_dbid[data.id],
                field;
            for (field in data) {
                if (spec.repo_relations && spec.repo_relations[field]) {
                    var repo = spec.repo_relations[field];
                    if (data[field] instanceof Array) {
                        var i;
                        for (i = 0; i < data[field].length; ++i) {
                            data[field][i] = repo.register(data[field][i]);
                        }
                    } else {
                        data[field] = repo.register(data[field]);
                    }
                }
                if (ko.isWriteableObservable(target[field])) {
                    target[field](data[field]);
                } else {
                    target[field] = data[field];
                }
            }
            if (initial) {
                target[_destroy_field] = ko.observable(false);
            }
            if (initial && spec.on_init) {
                spec.on_init(target, data);
            }
            return target;
        };

        self.create_filter = function(filter) {
            // returns a FilteredRepo, which shares cache with this repository
            filter = filter || {};
            return new FilteredRepo(self, spec.list_url, filter);
        };

        self.cached = function(db_id) {
            return _by_dbid[db_id];
        };

        self.fetch = function(db_id, success, failure) {
            // will read and write to local cache (re-fetching will be O(1))
            if (_by_dbid[db_id]) {
                if (_by_dbid[db_id][_destroy_field]()) {
                    if (failure) {
                        failure({status: 404});
                    }
                } else {
                    if (success) {
                        success(_by_dbid[db_id]);
                    }
                }
            } else {
                self.force_fetch(db_id, success, failure);
            }
        };

        self.force_fetch = function(db_id, success, failure) {
            // will write to local cache (always goes to detail_url to read)
            spec.requests.get({
                url: spec.detail_url(db_id),
                success: function(result) {
                    self._update(result);
                    if (success) {
                        success(_by_dbid[db_id]);
                    }
                },
                error: function(jqXHR, textStatus, errorThrown) {
                    if (failure) {
                        failure({status:jqXHR.status})
                    }
                }
            });
        };

        self.register = function(obj_data) {
            // normally should use `create` or `force_fetch`, this should only be used if you have a complete/correct
            // json representation of the object (retrieved not via this repository) and you need to register it in this
            // repository's cache.
            // NOTE: use the returned object after calling, do not use the object 'obj_data'
            self._update(obj_data);
            return _by_dbid[obj_data.id];
        };

        self.create = function(data, callback) {
            spec.requests.post(spec.create_url(data), JSON.stringify(data), function(result) {
                self._update(result);
                if (callback) {
                    callback(_by_dbid[result.id]);
                }
            });
        };

        self.delete = function(db_id, callback) {
            // will write to _destroy observable
            var success = function() {
                self._delete(db_id);
                if (callback) {
                    callback();
                }
            };
            var error = function() {
            };
            spec.requests.delete(spec.delete_url(db_id), {}, success, error);
        };

    };

    exports.Repository = Repository;
});
