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
    // cancel and OK button, cancel button only if cancel_text is provided
    // target: typically an observable, writes null to it if cancel, if confirm, then calls confirm_click and passes it
    // confirm_click: function, which is passed target and event (in that order) if user clicks the confirm button
    init: function(element, valueAccessor, allBindings, deprecated, bindingContext) {

        ko.applyBindingAccessorsToNode(element, {
            dialog: function() {
                var buttons = [];
                var target = valueAccessor()['target'] || function() {};
                if (valueAccessor()['cancel_text']) {
                    buttons.push(
                        {
                            text: valueAccessor()['cancel_text'],
                            click: function(event) {
                                target(null);
                            }
                        }
                    );
                }
                buttons.push(
                    {
                        text: valueAccessor()['confirm_text'],
                        click: function(event) {
                            valueAccessor()['confirm_click'](target, event);
                        }
                    }
                );
                return {
                    autoOpen: true,
                    draggable: false,
                    resizable: false,
                    dialogClass: 'no-close',
                    closeOnEscape: true,
                    title: valueAccessor()['title'],
                    buttons: buttons
                };
            }
        }, bindingContext);
        return { controlsDescendantBindings: true };
    }
};

});
