(function () {
    'use strict';

    angular
        .module('dir.addsupplier', [])
        .directive('addSupplier', AddSupplierDir);

    function AddSupplierDir() {
        var ddo = {
            restrict: 'E',
            templateUrl: 'common/directives/add-supplier/add-supplier.tpl.html',
        };
        return ddo;
    }
})();