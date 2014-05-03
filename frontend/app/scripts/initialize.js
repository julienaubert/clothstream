require.register("scripts/initialize", function(exports, require, module) {
    var masterView = require('scripts/masterView')
    var auth = require('scripts/auth');
    var csrf = require('scripts/csrf');
    var scrollgrid = require('scripts/scrollgrid');
    var collections = require('scripts/collections');
    var discover = require('scripts/discover');
    var hover_visible = require('scripts/hoverVisible');
    var widget_bindings = require('scripts/widgetBindings');
    var dom_click = require('scripts/domClick');
    var profile = require('scripts/profile');

    $.csrfAjax = csrf.setup_csrf_ajax();

    var item_repo =  discover.construct_item_repo();
    var collection_repo = collections.construct_collection_repo(item_repo);
    var user_repo = auth.construct_user_repo(item_repo, collection_repo);

    ko.applyBindings(new masterView.MasterVM(
        auth.create_facebook_auth(user_repo, item_repo),
        item_repo,
        collection_repo,
        user_repo
    ));
});
