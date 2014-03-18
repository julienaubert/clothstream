var PageLoader = require('scripts/pageLoader');


describe('PageLoader.Sequential.loadPage', function() {
  it('should throw if load page 0', function() {
    var pageLoaderOpts = {url: "http://url", page_size: 20},
        target = new PageLoader.Sequential(pageLoaderOpts, function() {});
    expect(function () {target.loadPage(0)}).to.throw("Invalid page: '0'. Note: first page is '1'.");
  })
  it('should call callback with fetched results', function() {
    var callback = sinon.spy(),
        pageLoaderOpts = {url: "http://url", page_size: 20},
        dummyJsonReply = ["data"],
        pageLoaded = 1,
        target = new PageLoader.Sequential(pageLoaderOpts, callback);
    $.ajax = function(args) { args.success(dummyJsonReply); };
    target.loadPage(pageLoaded);
    expect(callback).to.have.been.calledWith(pageLoaderOpts, pageLoaded, dummyJsonReply);
  });
  it('should not load an already loaded page', function() {
    var callback = sinon.spy(),
        pageLoaderOpts = {url: "http://url", page_size: 20},
        dummyJsonReply = ["data"],
        pageLoaded = 1,
        target = new PageLoader.Sequential(pageLoaderOpts, callback);
    $.ajax = function(args) { args.success(dummyJsonReply); };
    target.loadPage(pageLoaded);
    target.loadPage(pageLoaded);
    expect(callback).to.have.been.calledOnce;
  });
  it('should mark no more pages if gets 404 on page', function() {
    var callback = sinon.spy(),
        pageLoaderOpts = {url: "http://url", page_size: 20},
        pageLoaded = 1,
        target = new PageLoader.Sequential(pageLoaderOpts, callback);
    $.ajax = function(args) { args.error({'status': 404}); };
    target.loadPage(pageLoaded);
    expect(callback).to.not.have.been.called;
    expect(target.no_more_pages).to.equal(true);
  });
  it('should mark pending response while waiting for ajax return', function() {
    var callback = sinon.spy(),
        pageLoaderOpts = {url: "http://url", page_size: 20},
        dummyJsonReply = ["data"],
        target = new PageLoader.Sequential(pageLoaderOpts, callback),
        lock = true;
    // TODO: this test is not so readable. loadPage should return promise and test use: chai-as-promised
    // see: http://martinfowler.com/articles/asyncJS.html
    $.ajax = function(args) {
        var waitForLock = function () {
            if (lock) {
                setTimeout(waitForLock, 0);
            }
        }
    };
    // in loadPage, ajax will asynchronously wait until lock=False
    target.loadPage(1);
    // while waiting, we expect response_pending
    expect(target.response_pending).to.equal(true);
    // now we unlock and we wait one interval
    lock = false;
    setTimeout(function() {
        // when we get here, execution gave the ajax waitForLock a chance to finish
        expect(target.response_pending).to.equal(false);
    }, 0);
  });
  it('should not load page if pending response', function() {
    var callback = sinon.spy(),
        pageLoaderOpts = {url: "http://url", page_size: 20},
        target = new PageLoader.Sequential(pageLoaderOpts, callback);
    $.ajax = sinon.spy();
    target.response_pending = true;
    target.loadPage(1);
    expect($.ajax).to.not.have.been.called;
  })
});

describe('PageLoader.Sequential.loadPageForEntry', function() {
  it('should load page 1 for index 0', function() {
    var callback = function() {},
        pageLoaderOpts = {url: "http://url", page_size: 20},
        target = new PageLoader.Sequential(pageLoaderOpts, callback);
    target.loadPage = sinon.spy();
    $.ajax = function(args) { };
    target.loadPageForEntry(0);
    expect(target.loadPage).to.have.been.calledWith(1);
  });
  it('should load page 2 for index = pageSize', function() {
    var callback = function() {},
        pageLoaderOpts = {url: "http://url", page_size: 20},
        target = new PageLoader.Sequential(pageLoaderOpts, callback);
    target.loadPage = sinon.spy();
    $.ajax = function(args) { };
    target.loadPageForEntry(pageLoaderOpts.page_size);
    expect(target.loadPage).to.have.been.calledWith(2);
  });
});
