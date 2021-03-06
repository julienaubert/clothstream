require.register("scripts/pageLoader", function(exports, require, module) {


    exports.Sequential = function (page_size, url_callback, result_callback)
    {
        // Loads pages from a json webservice: calls url_callback(page, page_size) to get an url, once get the response
        // calls result_callback with (page_size, page, result)
        //
        // PLANS:
        //  - separate as its own open-sourced component
        //  - have configurable expectations on webservice for page-traversal
        //      - provide defaults for django-restful-framework conventions
        //      - e.g. get initial url, but do not send page param, instead use the "next" link
        //      - benefit: avoid making that last 404 request to know page is out, more dynamic for backend to change
        //                 api
        //      - minimize nr requests: loadRange(1,8) can use the page_size to make minimum amount of requests
        //  - use promise API
        //      - makes it easier to test
        //      - allows making function loadRange(1,8) and which could make several http request async
        //        and cache those results, and still call the callbacks in order
        //      - makes it easier to have a helper: a loadPagesUpToIndex(x) which will ensure all pages loads,
        //        not only the page x is on (but needs to be in order, so promise is perfect for this)
        var self = this,
            pages_loaded = 0;

        self.response_pending = false;
        self.no_more_pages = false;

        self.load = function(page) {
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
            url = url_callback(page_size, page);
            // guaranteed to load one at a time, as user cannot scroll down further until last request successful
            $.ajax({
                url: url, dataType: 'json', async: true,
                success: function(data) {
                    pages_loaded += 1;
                    result_callback(page_size, pages_loaded, data);
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
        self.loadRange = function(start, end) {
            var i;
            for (i = start; i < end; i++)
            {
                function wait(page) {
                    if (self.response_pending) {
                       setTimeout(function() {
                           wait(page)
                       }, 0);
                    } else {
                       self.load(page);
                    }
                }
                wait(i);
            }
        }
        self.pageFromEntry = function(index) {
            return 1 + Math.floor(index / page_size);
        }
        self.loadForEntry = function(index) {
            self.load(self.pageFromEntry(index));
        }
        self.loadUntilEntry = function(index) {
            self.loadRange(1, self.pageFromEntry(index) + 1);
        }
    }

});
