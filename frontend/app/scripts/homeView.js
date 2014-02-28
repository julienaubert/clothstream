require.register("scripts/homeView", function(exports, require, module) {

    exports.HomeViewModel = function(first, last) {
        this.firstName = ko.observable(first);
        this.lastName = ko.observable(last);

        this.fullName = ko.computed(function() {
            // Knockout tracks dependencies automatically. It knows that fullName depends on firstName and lastName, because these get called when evaluating fullName.
            if (this.firstName() && this.lastName())
            {
                return this.firstName() + " " + (this.lastName() || "");
            }
        }, this);
    };

});
