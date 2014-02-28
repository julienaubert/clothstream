var HomeView = require('scripts/homeView');

describe('Regression HomeView', function() {
  it('Full name should be undefined if missing last name', function() {
    target = new HomeView.HomeViewModel('John');
    expect(target.lastName()).to.undefined;
    expect(target.fullName()).to.undefined;
  });
});
