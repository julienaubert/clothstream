require.register("scripts/hoverVisible", function(exports, require, module) {

// http://stackoverflow.com/questions/16309336/knockout-visible-binding-with-hover

ko.bindingHandlers.hoverTargetId = {};
ko.bindingHandlers.hoverVisible = {
    init: function(element, valueAccessor, allBindings, deprecated, bindingContext) {

        function showOrHideElement(show) {
            var canShow = ko.utils.unwrapObservable(valueAccessor());
            $(element).toggle(show && canShow);
        }

        var hideElement = showOrHideElement.bind(null, false);
        var showElement = showOrHideElement.bind(null, true);
        var $hoverTarget = $("#" + ko.utils.unwrapObservable(allBindings().hoverTargetId));
        ko.utils.registerEventHandler($hoverTarget, "mouseover", showElement);
        ko.utils.registerEventHandler($hoverTarget, "mouseout", hideElement);
        hideElement();
    }
};

});
