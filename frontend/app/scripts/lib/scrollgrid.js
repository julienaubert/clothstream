require.register("scripts/scrollgrid", function(exports, require, module) {

    ko.bindingHandlers.scrollgrid = {
        init: function(element, valueAccessor, allBindings, deprecated, bindingContext) {
            var items = valueAccessor()['items'];
            if (!ko.isObservable(items)) {
                throw "scrollgrid must be passed an observable array";
            }
            var scroller = items.infinitescroll;
            items.extend({infinitescroll: {}});
            scroller = items.infinitescroll;

            var item_ready = false;

            scrolled = function(data, event) {
                scroller.scrollY($(event.target).scrollTop());
            };

            ko.applyBindingAccessorsToNode(element, {
                // TODO: make a test where we do data-bind="scrollgrid: someObservable().anobservableArray"
                // if we do:                 foreach: function() { return items; },
                // then the foreach does not subscribe to changes in the someObservable
                // therefore we must really do:                 foreach: function() { return valueAccessor(); },
                foreach: function() { return valueAccessor()['items']; },
                event: function () { return { scroll: scrolled } }
            }, bindingContext);

            observe_once_item_ready = function () {
                item_ready = $(element).children(":first").outerHeight(true);
                if (!item_ready) {
                    setTimeout(observe_once_item_ready, 5);
                } else {
                    scroller.viewportWidth($(element).width());
                    scroller.viewportHeight($(element).height());
                    scroller.itemWidth($(element).children(":first").outerWidth(true));
                    scroller.itemHeight($(element).children(":first").outerHeight(true));
                }
            };
            observe_once_item_ready();

            scroller.lastVisibleIndex.subscribe(function (last_visible_index) {
                if (last_visible_index == -1) {
                    return;
                }
                var callback = valueAccessor()['on_scroll'];
                if (callback) {
                    callback(scroller.lastVisibleIndex() + 1 + scroller.numItemsPadding());
                }
            });

            // ensure accessor observes viewport-size and item-size when user resizes
            $(window).resize(function () {
                observe_once_item_ready();
            });
            return { controlsDescendantBindings: true };
        }
    };

});
