require.register("scripts/pageLoader", function(exports, require, module) {


    exports.Sequential = function (props, callback)
    {
        // PLANS:
        //  - tie it to django-restful-framework conventions:
        //      - get initial url, but do not send page param, instead use the "next" link
        //      - benefit: avoid making that last 404 request to know page is out, more dynamic for backend to change
        //                 api
        //  - use promise API
        //      - makes it easier to test
        //      - allows making function loadRange(1,8) and which could make several http request async
        //        and cache those results, and still call the callbacks in order
        //  - minimize nr requests: loadRange(1,8) can use the page_size to make minimum amount of requests
        //  - helper: have a loadPagesUpToIndex(x) which will ensure all pages loads, not only the page x is on

        // props: {
        //  page_size: <int>,
        // }
        // callback: function(props, page_loaded, json_data)
        //
        var self = this,
            pages_loaded = 0;

        self.response_pending = false;
        self.no_more_pages = false;

        self.loadPage = function(page) {
            // calls callback(data) on success.
            // promise callback(data) called max once per successful page
            //  i.e. does not call if loadPage is called again with same page, or if page is beyond available pages
            if (page < 1) {
                 throw new Error("Invalid page: '" + page + "'. Note: first page is '1'.");
            }
            var already_loaded = page <= pages_loaded;
            if (already_loaded || self.no_more_pages || self.response_pending)
            {
                return;
            }
            self.response_pending = true;
            url = props.url + "?" +
                  "page_size=" + props.page_size +
                  "&page=" + page;
            // guaranteed to load one at a time, as user cannot scroll down further until last request successful
            $.ajax({
                url: url, dataType: 'json', async: true,
                success: function(data) {
                    pages_loaded += 1;
                    callback(props, pages_loaded, data);
                    self.response_pending = false;
                },
                error: function (xhr, status, exc) {
                    switch (xhr.status) {
                        case 404:
                            self.no_more_pages = true;
                            break;
                    }
                    self.response_pending = false;
                }
            });
        }
        self.loadPageForEntry = function(index) {
            self.loadPage(1 + Math.floor(index / props.page_size));
        }
    }

});
