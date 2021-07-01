(function () {
    'use strict';

    angular
        .module('dir.contractdetails', [])
        .directive('contractDetails', ContractDetailsDir);

    function ContractDetailsDir() {
        var ddo = {
            restrict: 'E',
            templateUrl: 'common/directives/contract-details/contract-details.tpl.html',
        };
        return ddo;
    }
})();