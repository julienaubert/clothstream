require.register("scripts/initialize", function(exports, require, module) {

    var homeView = require('scripts/homeView')


    ko.bindingHandlers.grid = {
        init: function(element, valueAccessor, allBindings, viewModel, bindingContext) {
            observe = function (){
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

            // ensure accessor observes viewport-size and item-size once the grid-DOM is rendered
            var subscription = allBindings().foreach.subscribe(function (newValue) {
                observe();
                subscription.dispose();
            });

            // ensure accessor observes viewport-size and item-size when user resizes
            $(window).resize(function () {
                observe();
            });
        }
    }


    ko.applyBindings(new homeView.HomeViewModel());


});
