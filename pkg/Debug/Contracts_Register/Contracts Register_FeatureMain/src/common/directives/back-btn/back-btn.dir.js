(function () {
    'use strict';

    angular
        .module('dir.backbtn', [])
        .directive('backBtn', BackButtonDir);

    function BackButtonDir() {
        var ddo = {
            restrict: 'E',
            templateUrl: 'common/directives/back-btn/back-btn.tpl.html',
            scope: {
                title: '@',
                link: '@'
            }
            //controller: 'staffAdminMenuCtrl',
            //controllerAs: 'dirctrl',
            //bindToController: true
        };
        return ddo;
    }
})();