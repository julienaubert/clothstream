require.register("scripts/homeView", function(exports, require, module) {

    var pageLoader = require('scripts/pageLoader')


    function Item(data) {
        this.thumb_title = ko.observable(data.thumb_title);
        this.thumb_image_url = ko.observable(data.thumb_image_url);
        this.link = ko.observable(data.link);
    }

    exports.HomeViewModel = function() {
        var self = this;
        self.items = ko.observableArray([]);
        self.items.extend({ infinitescroll: {} });
        self.grid = ko.observable();

        self.item_loader = new pageLoader.Sequential(
            {   url: "http://localhost:8000/item/items/",
                page_size: 20
            },
            function(props, page_loaded, data){
                ko.utils.arrayPushAll(self.items, data.results);
                self.items.valueHasMutated();
        });

        self.scrolled = function(data, event) {
            var scroller = self.items.infinitescroll;
            var elem = event.target;
            self.items.infinitescroll.scrollY($(elem).scrollTop());
            self.item_loader.loadUntilEntry(scroller.lastVisibleIndex() + 1 + scroller.numItemsPadding());
        };

        self.grid.subscribe(function (grid) {
            var scroller = self.items.infinitescroll;
            scroller.viewportWidth(grid.viewport.width);
            scroller.viewportHeight(grid.viewport.height);
            scroller.itemWidth(grid.itemport.width);
            scroller.itemHeight(grid.itemport.height);
            self.item_loader.loadUntilEntry(scroller.lastVisibleIndex() + 1 + scroller.numItemsPadding());
        });

        self.item_loader.load(1);
    };

});
