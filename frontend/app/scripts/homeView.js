require.register("scripts/homeView", function(exports, require, module) {

    var pageLoader = require('scripts/pageLoader')


    function Item(data) {
        this.thumb_title = ko.observable(data.thumb_title);
        this.thumb_image_url = ko.observable(data.thumb_image_url);
        this.link = ko.observable(data.link);
    }

    exports.HomeViewModel = function() {
        var self = this;

        self.json_page_size = 10
        self.items = ko.observableArray([]);
        self.items.extend({
            infinitescroll: {}
        });

        self.page_loader = new pageLoader.Sequential(
            {   url: "http://localhost:8000/item/items/",
                page_size: 10
            },
            function(props, page_loaded, data){
                var offset = (page_loaded - 1) * props.page_size,
                    i
                for (i = 0; i < data.results.length; i++)
                {
                    self.items()[i + offset] = new Item(data.results[i]);
                }
                self.items.valueHasMutated();
        });

        // detect resize
        $(window).resize(function() {
            // TODO: remove from view model (DOM should connect to ViewModel, not reverse (like event: scrolled)
            updateViewPortDimensions();
        });


        self.scrolled = function(data, event) {
            var elem = event.target;
            self.items.infinitescroll.scrollY(elem.scrollTop);
            self.page_loader.loadPageForEntry(self.items.infinitescroll.lastVisibleIndex());
        };

        // update dimensions of infinite-scroll viewport and item
        function updateViewPortDimensions() {
            var itemsRef = $('#items'),
                itemRef = $('.item').first(),
                itemsWidth = itemsRef.width(),
                itemsHeight = itemsRef.height(),
                itemWidth = itemRef.outerWidth(),
                itemHeight = itemRef.outerHeight();

            self.items.infinitescroll.viewportWidth(itemsWidth);
            self.items.infinitescroll.viewportHeight(itemsHeight);
            self.items.infinitescroll.itemWidth(itemWidth);
            self.items.infinitescroll.itemHeight(itemHeight);
        };


        updateViewPortDimensions();
        self.page_loader.loadPage(1);
    };

});
