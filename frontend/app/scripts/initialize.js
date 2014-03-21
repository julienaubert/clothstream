require.register("scripts/initialize", function(exports, require, module) {

    var homeView = require('scripts/homeView')


    ko.bindingHandlers.grid = {
        init: function(element, valueAccessor, allBindings, deprecated, bindingContext) {
            items =  bindingContext.$data.items

            ko.applyBindingAccessorsToNode(element, {
                foreach: function() { return bindingContext.$data.items },
                event: function () { return { scroll: bindingContext.$data.scrolled } }
            }, bindingContext);

            observe_once_item_ready = function () {
                item_ready = $(element).children(":first").outerHeight(true);
                if (!item_ready) {
                    setTimeout(observe_once_item_ready, 5);
                } else {
                    var value = valueAccessor();
                    value({
                        viewport: {
                            width: $(element).width(),
                            height: $(element).height()
                        },
                        itemport: {
                            width: $(element).children(":first").outerWidth(true),
                            height: $(element).children(":first").outerHeight(true)
                        }
                    });
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


    ko.applyBindings(new homeView.HomeViewModel());


});
