require.register("scripts/homeView", function(exports, require, module) {


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

        // detect resize
        $(window).resize(function() {
            // TODO: remove from view model (DOM should connect to ViewModel, not reverse (like event: scrolled)
            updateViewPortDimensions();
        });

        self.scrolled = function(data, event) {
            var elem = event.target;
            self.items.infinitescroll.scrollY(elem.scrollTop);
            if (self.items.peek().length - self.items.infinitescroll.lastVisibleIndex.peek() <= self.json_page_size) {
                populateItems();
            }
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

        function populateItems() {
            var last_json_page = 1 + Math.floor(self.items.infinitescroll.lastVisibleIndex() / self.json_page_size),
                url = "http://localhost:8000/item/items/?" +
                      "page_size=" + self.json_page_size +
                      "&page=" + last_json_page;
            // guaranteed to load one at a time, as user cannot scroll down further until last request successful
            $.ajax({
                url: url, dataType: 'json', async: true,
                success: function(data) {
                    var offset = (last_json_page - 1) * self.json_page_size,
                        i
                    for (i = 0; i < data.results.length; i++)
                    {
                        self.items()[i + offset] = new Item(data.results[i]);
                    }
                    self.items.valueHasMutated();
                }
            });
        }

        updateViewPortDimensions();
        populateItems();
    };

});
