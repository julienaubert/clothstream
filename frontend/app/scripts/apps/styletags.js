require.register("scripts/styletags", function(exports, require, module) {
    var repository = require('scripts/repository');

    var construct_styletag_repo = function(item_repo) {
        var repo = new repository.Repository({
            list_url: function(page_size, page, filter) {
                var url = "http://localhost:8000/api/styletags/?" +
                           "page_size=" + page_size +
                           "&page=" + page;
                return url;
            }
        });
        return repo;
    };

    exports.construct_styletag_repo = construct_styletag_repo;
});
