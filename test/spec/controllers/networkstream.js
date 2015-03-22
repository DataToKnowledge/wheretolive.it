'use strict';

describe('Controller: NetworkstreamCtrl', function () {

  // load the controller's module
  beforeEach(module('wheretoliveApp'));

  var NetworkstreamCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    NetworkstreamCtrl = $controller('NetworkstreamCtrl', {
      $scope: scope
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(scope.awesomeThings.length).toBe(3);
  });
});
