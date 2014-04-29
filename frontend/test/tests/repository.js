var Repository = require('scripts/repository');

var detail_reply = {id: 1};
var list_reply = {results: [detail_reply]};

var requests = {};


describe('Repository.on_init', function() {
  it('when on_init is supplied, should call it once', function() {
      var spy = sinon.spy();
      var list_url_calls = 0;
      var target = new Repository.Repository({
          list_url: function() {
              list_url_calls += 1;
              return 'dummy_url';
          },
          detail_url: function() { return 'dummy_url'; },
          on_init: spy,
          requests: requests
      })
      requests.get = function(args) { args.success(detail_reply); };
      target.force_fetch(1, function() {});
      target.force_fetch(1, function() {});
      requests.get = function(args) { args.success(list_reply); };
      target.create_filter().apply_filter();
      // actually: very bad test: because need wait for apply_filter to have been called :( (todo: use promises)
      function wait_for_apply_filter() {
        if (list_url_calls < 1) {
            setTimeout(wait_for_apply_filter, 5);
        } else {
          expect(spy).to.have.been.calledOnce;
        }
      }
      wait_for_apply_filter();
  });
  it('when on_init makes an observable, should write to it on retrieving updates', function() {
      var spy = sinon.spy();
      var target = new Repository.Repository({
          detail_url: function() {return 'dummy_url'},
          on_init: function(object) {
              object.name = ko.observable(object.name);
          },
          requests: requests
      });
      var detail_reply1_jonn = {id: 1, name: 'jonn'};
      var detail_reply2_john = {id: 1, name: 'john'};
      requests.get = function(args) { args.success(detail_reply1_jonn); };
      target.fetch(1, function(object) {
          var subscribe_got_value;
          expect(object.name()).to.equal('jonn');
          object.name.subscribe(function(value) {
              subscribe_got_value = value;
          });
          requests.get = function(args) { args.success(detail_reply2_john); };
          target.force_fetch(1, function(object) {
              expect(object.name()).to.equal('john');
          });
          function wait_for_subscribe_trigger() {
              if (!subscribe_got_value) {
                  setTimeout(wait_for_subscribe_trigger, 5);
              } else {
                  expect(subscribe_got_value).to.equal('john');
              }
          }
          wait_for_subscribe_trigger();
      });
  });
  it('when called, object should already have a ko.observable field named _destroy', function() {
      var spy = sinon.spy();
      var target = new Repository.Repository({
          detail_url: function() {return 'dummy_url'},
          on_init: function(object) {
              spy();
              assert(ko.isObservable(object._destroy));
              expect(object._destroy()).to.equal(false);
          },
          requests: requests
      })
      var detail_reply = {id: 1};
      requests.get = function(args) { args.success(detail_reply); };
      target.fetch(1);
      expect(spy).to.have.been.called;
  });
});

describe('Repository.fetch', function() {
  var target;
  beforeEach(function() {
      target = new Repository.Repository({
        detail_url: function() {return 'dummy_url'},
        requests: requests
      });
  });
  it('when fetch twice, the second time it is cached', function() {
      requests.get = function(args) { args.success(detail_reply); };
      target.fetch(1, function(o1) {
          requests.get = sinon.spy();
          target.fetch(1, function(o1_again) {
              expect(requests.get).to.not.have.been.called;
              assert(o1 === o1_again);
          });
      });
  });
  it('when does not exist, calls failure callback with 404', function() {
      requests.get = function(args) { args.error({status:404}); };
      success = sinon.spy();
      failure = sinon.spy();
      target.fetch(1, success, failure);
      expect(success).to.not.have.been.called;
      expect(failure).to.have.been.calledOnce;
      expect(failure).to.have.been.calledWith({status:404});
  });
});

describe('Repository.force_fetch', function() {
  var list_reply = {results: [{id: 1}]};
  it('when force_fetch twice, it is still the same object (possibly updated with new values)', function() {
      var target = new Repository.Repository({
          detail_url: function() {return 'dummy_url'},
          requests: requests
      })
      requests.get = function(args) { args.success(detail_reply); };
      target.force_fetch(1, function(o1) {
          target.force_fetch(1, function(o1_again) {
              assert(o1 === o1_again);
          });
      });
  });
});

describe('Repository.register', function() {
  it('when register should store object)', function() {
      var target = new Repository.Repository({})
      var o1 = target.register({id: 2});
      target.fetch(2, function(o1_again) {
          assert(o1 === o1_again);
      });
  });
});

describe('Repository.create', function() {
  it('sanity check: references to objects are consistent (fetched vs create)', function() {
      var target = new Repository.Repository({
          create_url: function() {return 'dummy_url'},
          detail_url: function() {return 'dummy_url'},
          requests: requests
      });
      requests.post = function(url, payload, success) { success({id:2, owner:42}); };
      requests.get = function(args) { args.success(detail_reply); };
      var path_taken = false;
      target.create({}, function(object) {
          target.force_fetch(2, function(object_again) {
              assert(object === object_again);
              path_taken = true;
          });
      });
      assert(path_taken);
  });
  it('callback is optional', function() {
      var target = new Repository.Repository({
          create_url: function() {return 'dummy_url'},
          detail_url: function() {return 'dummy_url'},
          requests: requests
      });
      requests.post = function(url, payload, success) { success({id:2, owner:42}); };
      target.create({});
  })
});


describe('Repository.delete', function() {
  it('sanity check: references to objects are consistent (create, delete, create)', function() {
      var target = new Repository.Repository({
          create_url: function() {return 'dummy_url'},
          delete_url: function() {return 'dummy_url'},
          requests: requests
      });
      requests.post = function(url, payload, success) { success({id:2}); };
      var path_taken = false;
      target.create({}, function(object) {
         requests.delete = function(url, success, error) { success(); };
         target.delete(2, function() {
              target.create({}, function(object_again) {
                  assert(object === object_again);
                  path_taken = true;
              });
          })
      });
      assert(path_taken);
  });
  it('after delete, the delete-info is in cache, and so fetch should say no such object', function() {
      var target = new Repository.Repository({
          create_url: function() {return 'dummy_url'},
          detail_url: function() {return 'dummy_url'},
          delete_url: function() {return 'dummy_url'},
          requests: requests
      });
      requests.post = function(url, payload, success) { success({id:2}); };
      target.create({});
      requests.delete = function(url, success, error) { success(); };
      target.delete(2);
      requests.get = sinon.spy();
      success = sinon.spy();
      failure = sinon.spy();
      target.fetch(2, success, failure);
      expect(requests.get).to.not.have.been.called;
      expect(success).to.not.have.been.called;
      expect(failure).to.have.been.calledOnce;
      expect(failure).to.have.been.calledWith({status:404});
  });
  it('after delete, should write to ko.observable field named _destroy', function() {
      var target = new Repository.Repository({
          detail_url: function() {return 'dummy_url'},
          delete_url: function() {return 'dummy_url'},
          requests: requests
      });
      var path_taken = false;
      requests.get = function(args) { args.success({id:2}); };
      target.force_fetch(2, function(object) {
          expect(object._destroy()).to.equal(false);
          requests.delete = function(url, success, error) { success(); };
          target.delete(2);
          expect(object._destroy()).to.equal(true);
          path_taken = true;
      });
      assert(path_taken);
  });
});



describe('Repository.create_filter', function() {
  it('sanity check: references to objects are consistent (fetched object vs filtered-objects)', function() {
      var spy = sinon.spy();
      var list_url_calls = 0;
      var target = new Repository.Repository({
          list_url: function() {
              list_url_calls += 1;
              return 'dummy_url';
          },
          detail_url: function() { return 'dummy_url'; },
          on_init: spy,
          requests: requests
      });
      var path_taken = false;
      requests.get = function(args) { args.success(detail_reply); };
      var filter = target.create_filter();
      target.force_fetch(1, function(object) {
          // TODO: page loader in apply_filter still using $.ajax
          $.ajax = function(args) { args.success(list_reply); };
          filter.apply_filter();
          assert(filter.objects()[0] === object);
          path_taken = true;
      });
      assert(path_taken);
  });
});
