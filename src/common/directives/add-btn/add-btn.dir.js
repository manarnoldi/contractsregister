(function () {
    'use strict';

    angular
        .module('dir.addbtn', [])
        .directive('addBtn', AddButtonDir);

    function AddButtonDir() {
        var ddo = {
            restrict: 'E',
            templateUrl: 'common/directives/add-btn/add-btn.tpl.html',
            scope: {
                title: '@',
                link: '@'
            },
            //controller: 'staffAdminMenuCtrl',
            //controllerAs: 'dirctrl',
            //bindToController: true
        };
        return ddo;
    }
})();