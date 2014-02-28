require.register("scripts/initialize", function(exports, require, module) {

    var homeView = require('scripts/homeView')

    ko.applyBindings(new homeView.HomeViewModel("Planet", "Earth"));

});
