'use strict';

/**
 * @ngdoc service
 * @name wheretoliveApp.esService
 * @description
 * # esService
 * Service in the wheretoliveApp.
 */
angular.module('wheretoliveApp')
  .service('esService', function (esFactory) {
    return esFactory({
      host: 'wheretolive.it:9200',
      log: 'trace'
    });
  });
