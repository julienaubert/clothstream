require.register("scripts/widgetBindings", function(exports, require, module) {

ko.bindingHandlers.textInput = {
    init: function(element, valueAccessor, allBindings, deprecated, bindingContext) {
        var $target = $(element);
        var mouseOver = function(event) {
            $target.focus();
            $target.select();
        };
        var mouseOut = function(event) {
            $target.blur();
        };
        var keyUp = function(event) {
            var enter_key = 13;
            var tab_key = 9;
            if (event.which == enter_key || event.which == tab_key) {
                $target.blur();
            }
        };
        ko.utils.registerEventHandler(element, "mouseover", mouseOver);
        ko.utils.registerEventHandler(element, "mouseout", mouseOut);
        ko.utils.registerEventHandler(element, "keydown", keyUp);
    }
};


ko.bindingHandlers.confirmDialog = {
    init: function(element, valueAccessor, allBindings, deprecated, bindingContext) {
        ko.applyBindingAccessorsToNode(element, {
            dialog: function() {
                return {
                    autoOpen: true,
                    draggable: false,
                    resizable: false,
                    dialogClass: 'no-close',
                    closeOnEscape: true,
                    title: valueAccessor()['title'],
                    buttons: [{
                            text: valueAccessor()['cancel_text'],
                            click: function(event) {
                                valueAccessor()['target'](null);
                            }
                        }, {
                            text: valueAccessor()['confirm_text'],
                            click: function(event) {
                                valueAccessor()['confirm_click'](valueAccessor()['target'], event);
                            }
                        }
                    ]
                };
            }
        }, bindingContext);
        return { controlsDescendantBindings: true };
    }
};

});
