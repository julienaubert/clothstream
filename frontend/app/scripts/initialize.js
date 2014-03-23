require.register("scripts/initialize", function(exports, require, module) {

    var masterView = require('scripts/masterView')

    ko.bindingHandlers.scrollgrid = {
        init: function(element, valueAccessor, allBindings, deprecated, bindingContext) {
            items = valueAccessor()

            scrolled = function(data, event) {
                items.infinitescroll.scrollY($(event.target).scrollTop());
            }

            ko.applyBindingAccessorsToNode(element, {
                foreach: function() { return bindingContext.$data.items },
                event: function () { return { scroll: scrolled } }
            }, bindingContext);

            observe_once_item_ready = function () {
                item_ready = $(element).children(":first").outerHeight(true);
                if (!item_ready) {
                    setTimeout(observe_once_item_ready, 5);
                } else {
                    var scroller = items.infinitescroll;
                    scroller.viewportWidth($(element).width());
                    scroller.viewportHeight($(element).height());
                    scroller.itemWidth($(element).children(":first").outerWidth(true));
                    scroller.itemHeight($(element).children(":first").outerHeight(true));
                }
            }
            observe_once_item_ready();

            // ensure accessor observes viewport-size and item-size when user resizes
            $(window).resize(function () {
                observe_once_item_ready();
            });
            return { controlsDescendantBindings: true };
        }
    }

    ko.applyBindings(new masterView.MasterViewModel());
});
