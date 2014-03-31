require.register("scripts/domClick", function(exports, require, module) {

ko.bindingHandlers.domClick = {
    init: function(element, valueAccessor, allBindings, deprecated, bindingContext) {
        ko.applyBindingAccessorsToNode(element, {
//  note expected to use click but must use event (bug in ko?) https://github.com/knockout/knockout/issues/1377
//            click: function() {return true;},
            event: function() {return { 'click': function() {return true;}}},
            clickBubble: function() {return false;}
        }, bindingContext);
    }
}

});
