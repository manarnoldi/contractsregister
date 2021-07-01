(function () {
    'use strict';

    angular
        .module('dir.adddocument', [])
        .directive('addDocument', AddDocumentDir);

    function AddDocumentDir() {
        var ddo = {
            restrict: 'E',
            templateUrl: 'common/directives/add-document/add-document.tpl.html',
        };
        return ddo;
    }
})();