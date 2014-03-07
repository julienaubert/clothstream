require.register("scripts/homeView", function(exports, require, module) {


    function Item(data) {
        this.thumb_title = ko.observable(data.thumb_title);
        this.thumb_image_url = ko.observable(data.thumb_image_url);
        this.link = ko.observable(data.link);
    }

    exports.HomeViewModel = function() {
        var self = this;

        self.debug = false;
        self.items = ko.observableArray([]);
        self.items.extend({
            infinitescroll: {}
        });

        // detect resize
        $(window).resize(function() {
            updateViewportDimensions();
        });

        // detect scroll
        $(items).scroll(function() {
            self.items.infinitescroll.scrollY($(items).scrollTop());

            // add more items if scroll reaches the last 100 items
            if (self.items.peek().length - self.items.infinitescroll.lastVisibleIndex.peek() <= 100) {
                populateItems(100);
            }
        });

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
        }

        function populateItems(numTotal) {
            $.getJSON("http://localhost:8000/item/items/", function(allData) {
                var mappedItems = $.map(allData.results, function(item) { return new Item(item) });
                self.items(mappedItems);
            });
        }

        updateViewPortDimensions();
        populateItems();

    };

});
