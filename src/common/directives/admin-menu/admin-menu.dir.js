(function () {
    'use strict';

    angular
        .module('dir.adminmenu', [])
        .directive('adminMenu', AdminMenuDir)
        .controller('adminMenuCtrl', AdminMenuCtrl);

    function AdminMenuDir() {
        var ddo = {
            restrict: 'E',
            templateUrl: 'common/directives/admin-menu/admin-menu.tpl.html',
            scope: {
                menuItems: '='
            },
            controller: 'adminMenuCtrl',
            controllerAs: 'dirctrl',
            bindToController: true
        };
        return ddo;
    }

    function AdminMenuCtrl() {
        var dirctrl = this;

    }
})();