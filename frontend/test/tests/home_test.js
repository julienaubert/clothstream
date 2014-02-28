var HomeView = require('scripts/homeView');

describe('HomeView', function() {
  it('Full name should be first name followed by last name', function() {
    target = new HomeView.HomeViewModel('John', 'Smith');
    expect(target.firstName()).to.equal('John');
    expect(target.lastName()).to.equal('Smith');
    expect(target.fullName()).to.equal('John Smith');
  });
});
