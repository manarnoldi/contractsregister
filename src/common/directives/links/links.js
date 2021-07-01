(function () {
    'use strict';

    angular
        .module('dir.links', [])
        .directive('linksDir', LinksDir);

    function LinksDir() {
        var ddo = {
            restrict: 'E',
            templateUrl: 'common/directives/links/links.dir.html',
            scope: {
                links: '=',
            },
        };
        return ddo;
    }
})();