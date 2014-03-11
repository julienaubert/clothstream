require.register("scripts/pageLoader", function(exports, require, module) {

    exports.Sequential = function (props, callback)
    {
        // props: {
        //  page_size: <int>,
        // }
        // callback: function(props, page_loaded, json_data)
        //
        var self = this,
            pages_loaded = 0,
            response_pending = false,
            no_more_pages = false;

        self.loadPage = function(page) {
            // calls callback(data) on success.
            // promise callback(data) called max once per successful page
            //  i.e. does not call if loadPage is called again with same page, or if page is beyond available pages
            var already_loaded = page <= pages_loaded;
            if (already_loaded || response_pending || no_more_pages)
            {
                return;
            }
            response_pending = true;
            url = props.url + "?" +
                  "page_size=" + props.page_size +
                  "&page=" + page;
            // guaranteed to load one at a time, as user cannot scroll down further until last request successful
            $.ajax({
                url: url, dataType: 'json', async: true,
                success: function(data) {
                    pages_loaded += 1;
                    callback(props, pages_loaded, data);
                    response_pending = false;
                },
                error: function (xhr, status, exc) {
                    switch (xhr.status) {
                        case 404:
                            self.no_more_pages = true;
                            break;
                    }
                    response_pending = false;
                }
            });
        }
        self.loadPageForEntry = function(index) {
            self.loadPage(1 + Math.floor(index / props.page_size));
        }
    }

});
