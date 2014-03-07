require.register("scripts/homeView", function(exports, require, module) {


    function Item(data) {
        this.thumb_title = ko.observable(data.thumb_title);
        this.thumb_image_url = ko.observable(data.thumb_image_url);
        this.link = ko.observable(data.link);
    }

    exports.HomeViewModel = function(first, last) {
        var self = this;

        this.firstName = ko.observable(first);
        this.lastName = ko.observable(last);

        this.items = ko.observableArray([]);

        $.getJSON("http://localhost:8000/item/items/", function(allData) {
            var mappedItems = $.map(allData.results, function(item) { return new Item(item) });
            self.items(mappedItems);
        });


        this.fullName = ko.computed(function() {
            // Knockout tracks dependencies automatically. It knows that fullName depends on firstName and lastName, because these get called when evaluating fullName.
            if (this.firstName() && this.lastName())
            {
                return this.firstName() + " " + (this.lastName() || "");
            }
        }, this);
    };

});
