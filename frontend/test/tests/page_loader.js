var PageLoader = require('scripts/pageLoader');


describe('PageLoader.Sequential.load', function() {
  it('should throw if load page 0', function() {
    var pageLoaderOpts = {url: "http://url", page_size: 20},
        target = new PageLoader.Sequential(pageLoaderOpts, function() {});
    expect(function () {target.load(0)}).to.throw("Invalid page: '0'. Note: first page is '1'.");
  })
  it('should call callback with fetched results', function() {
    var callback = sinon.spy(),
        pageLoaderOpts = {url: "http://url", page_size: 20},
        dummyJsonReply = ["data"],
        pageLoaded = 1,
        target = new PageLoader.Sequential(pageLoaderOpts, callback);
    $.ajax = function(args) { args.success(dummyJsonReply); };
    target.load(pageLoaded);
    expect(callback).to.have.been.calledWith(pageLoaderOpts, pageLoaded, dummyJsonReply);
  });
  it('should not load an already loaded page', function() {
    var callback = sinon.spy(),
        pageLoaderOpts = {url: "http://url", page_size: 20},
        dummyJsonReply = ["data"],
        pageLoaded = 1,
        target = new PageLoader.Sequential(pageLoaderOpts, callback);
    $.ajax = function(args) { args.success(dummyJsonReply); };
    target.load(pageLoaded);
    target.load(pageLoaded);
    expect(callback).to.have.been.calledOnce;
  });
  it('should mark no more pages if gets 404 on page', function() {
    var callback = sinon.spy(),
        pageLoaderOpts = {url: "http://url", page_size: 20},
        pageLoaded = 1,
        target = new PageLoader.Sequential(pageLoaderOpts, callback);
    $.ajax = function(args) { args.error({'status': 404}); };
    target.load(pageLoaded);
    expect(callback).to.not.have.been.called;
    expect(target.no_more_pages).to.equal(true);
  });
  it('should mark pending response while waiting for ajax return', function() {
    var callback = sinon.spy(),
        pageLoaderOpts = {url: "http://url", page_size: 20},
        dummyJsonReply = ["data"],
        target = new PageLoader.Sequential(pageLoaderOpts, callback),
        lock = true;
    // TODO: this test is not so readable. load should return promise and test use: chai-as-promised
    // see: http://martinfowler.com/articles/asyncJS.html
    $.ajax = function(args) {
        var waitForLock = function () {
            if (lock) {
                setTimeout(waitForLock, 0);
            }
        }
    };
    // in load, ajax will asynchronously wait until lock=False
    target.load(1);
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
    target.load(1);
    expect($.ajax).to.not.have.been.called;
  })
});

describe('PageLoader.Sequential.loadForEntry', function() {
  it('should load page 1 for index 0', function() {
    var callback = function() {},
        pageLoaderOpts = {url: "http://url", page_size: 20},
        target = new PageLoader.Sequential(pageLoaderOpts, callback);
    target.load = sinon.spy();
    $.ajax = function(args) { };
    target.loadForEntry(0);
    expect(target.load).to.have.been.calledWith(1);
  });
  it('should load page 2 for index = pageSize', function() {
    var callback = function() {},
        pageLoaderOpts = {url: "http://url", page_size: 20},
        target = new PageLoader.Sequential(pageLoaderOpts, callback);
    target.load = sinon.spy();
    $.ajax = function(args) { };
    target.loadForEntry(pageLoaderOpts.page_size);
    expect(target.load).to.have.been.calledWith(2);
  });
});

describe('PageLoader.Sequential.loadRange', function() {
  it('should give page 1 for index 0', function() {
    var callback = function() {},
        pageLoaderOpts = {url: "http://url", page_size: 20},
        target = new PageLoader.Sequential(pageLoaderOpts, callback);
    expect(target.pageFromEntry(0)).to.equal(1);
  });
  it('should give page 2 for index = page_size', function() {
    var callback = function() {},
        pageLoaderOpts = {url: "http://url", page_size: 20},
        target = new PageLoader.Sequential(pageLoaderOpts, callback);
    expect(target.pageFromEntry(pageLoaderOpts.page_size)).to.equal(2);
  });
  it('should give page 2 for index = 2*page_size-1', function() {
    var callback = function() {},
        pageLoaderOpts = {url: "http://url", page_size: 20},
        target = new PageLoader.Sequential(pageLoaderOpts, callback);
    expect(target.pageFromEntry(2*pageLoaderOpts.page_size-1)).to.equal(2);
  });
  it('should wait for pending response', function() {
    // TODO: ugly test.. once implemented with promise's can be fixed
    var callback = sinon.spy(),
        pageLoaderOpts = {url: "http://url", page_size: 20},
        target = new PageLoader.Sequential(pageLoaderOpts, callback),
        num_load_calls = 0;
    target.load = function() {
        target.response_pending = true;
        num_load_calls += 1;
    }
    target.loadRange(1, 3);
    expect(num_load_calls).to.equal(1);
    target.response_pending = false;
    waitForLoad = function() {
        if (num_load_calls != 2) {
            setTimeout(waitForLoad, 10);
        } else {
            expect(num_load_calls).to.equal(2);
        }
    }
    waitForLoad();
  });

});

describe('PageLoader.Sequential.loadRange', function() {
  it('should load page 1,2 for range 1,3', function() {
    var callback = function() {},
        pageLoaderOpts = {url: "http://url", page_size: 20},
        target = new PageLoader.Sequential(pageLoaderOpts, callback);
    target.load = sinon.spy();
    $.ajax = function(args) { };
    target.loadRange(1, 3);
    expect(target.load).to.have.been.calledTwice;
    expect(target.load).to.have.been.calledWith(1);
    expect(target.load).to.have.been.calledWith(2);
  });
});


describe('PageLoader.Sequential.loadUntilEntry', function() {
  it('should load page 1,2 for index page_size', function() {
    var callback = function() {},
        pageLoaderOpts = {url: "http://url", page_size: 20},
        target = new PageLoader.Sequential(pageLoaderOpts, callback);
    target.load = sinon.spy();
    $.ajax = function(args) { };
    target.loadUntilEntry(pageLoaderOpts.page_size);
    expect(target.load).to.have.been.calledTwice;
    expect(target.load).to.have.been.calledWith(1);
    expect(target.load).to.have.been.calledWith(2);
  });
});
