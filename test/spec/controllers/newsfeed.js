'use strict';

describe('Controller: NewsfeedCtrl', function () {

  // load the controller's module
  beforeEach(module('wheretoliveApp'));

  var NewsfeedCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    NewsfeedCtrl = $controller('NewsfeedCtrl', {
      $scope: scope
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(scope.awesomeThings.length).toBe(3);
  });
});
