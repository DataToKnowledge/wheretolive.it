'use strict';

describe('Controller: FacetsearchCtrl', function () {

  // load the controller's module
  beforeEach(module('wheretoliveApp'));

  var FacetsearchCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    FacetsearchCtrl = $controller('FacetsearchCtrl', {
      $scope: scope
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(scope.awesomeThings.length).toBe(3);
  });
});
