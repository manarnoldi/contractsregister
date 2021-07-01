(function () {
    'use strict';

    angular
        .module('app', ['ngRoute', 'ngAnimate', 'directives.dirPagination', 'ui.bootstrap', 'ui.bootstrap.dialogs', 'selectFile', 'services.utilities', 'spNgModule', 'sarsha.spinner',
            'angular-growl', 'sp-peoplepicker', 'datatables', 'services.contracts', 'services.costcenters', 'services.departments', 'services.currencies', 'services.doctypes', 'services.contract-suppliers',
            'services.contract-documents', 'services.settings', 'services.links', 'services.contract-renewals', 'dir.adminmenu', 'dir.backbtn', 'dir.addbtn', 'dir.contractdetails', 'dir.links','dir.adddocument', 'dir.addsupplier', 'departments', 'costcenters',
            'doctypes', 'currencies', 'settings', 'links', 'contracts', 'contractsAdd'])
        .constant("IS_APP_WEB", false)
        .config(['growlProvider', GrowlProvider])
        .config(['$routeProvider', RouteProvider]);

    RouteProvider.$inject = ['$routeprovider'];
    function RouteProvider($routeprovider) {
        $routeprovider
            .when('/dashboard/:teamid?/:status?/', {
                templateUrl: 'app/contracts-db/contracts-db.tpl.html',
                controller: 'contractsCtrl as ctrl'
            })
            .when('/addContract', {
                templateUrl: 'app/contract-dates/contract-dates-add.tpl.html',
                controller: 'contractsAddCtrl as ctrl',
                param: 'add'
            })
            .when('/detailsContract/:teamid?/:status?/:id', {
                templateUrl: 'app/contract-dates/contract-dates-add.tpl.html',
                controller: 'contractsAddCtrl as ctrl',
                param: 'details'
            })
            .when('/renewContract/:teamid?/:status?/:id', {
                templateUrl: 'app/contract-dates/contract-dates-add.tpl.html',
                controller: 'contractsAddCtrl as ctrl',
                param: 'renew'
            })
            //Manage Admin Departments
            .when('/listAdminDepartments', {
                templateUrl: 'app/adm-departments/departments-list.tpl.html',
                controller: 'departmentsCtrl as ctrl',
                param: 'list'
            })
            .when('/addAdminDepartments', {
                templateUrl: 'app/adm-departments/departments-add.tpl.html',
                controller: 'departmentsCtrl as ctrl'
            })
            .when('/editAdminDepartment/:id', {
                templateUrl: 'app/adm-departments/departments-add.tpl.html',
                controller: 'departmentsCtrl as ctrl',
                param: 'edit'
            })
            //Manage Admin CostCenters
            .when('/listAdminCostCenters', {
                templateUrl: 'app/adm-costcenters/costcenters-list.tpl.html',
                controller: 'costcentersCtrl as ctrl',
                param: 'list'
            })
            .when('/addAdminCostCenters', {
                templateUrl: 'app/adm-costcenters/costcenters-add.tpl.html',
                controller: 'costcentersCtrl as ctrl'
            })
            .when('/editAdminCostCenter/:id', {
                templateUrl: 'app/adm-costcenters/costcenters-add.tpl.html',
                controller: 'costcentersCtrl as ctrl',
                param: 'edit'
            })
            //Manage Admin Doc Types
            .when('/listAdminDocTypes', {
                templateUrl: 'app/adm-doctypes/doctypes-list.tpl.html',
                controller: 'doctypesCtrl as ctrl',
                param: 'list'
            })
            .when('/addAdminDocTypes', {
                templateUrl: 'app/adm-doctypes/doctypes-add.tpl.html',
                controller: 'doctypesCtrl as ctrl'
            })
            .when('/editAdminDocType/:id', {
                templateUrl: 'app/adm-doctypes/doctypes-add.tpl.html',
                controller: 'doctypesCtrl as ctrl',
                param: 'edit'
            })
            //Manage Admin Currencies
            .when('/listAdminCurrencies', {
                templateUrl: 'app/adm-currencies/currencies-list.tpl.html',
                controller: 'currenciesCtrl as ctrl',
                param: 'list'
            })
            .when('/addAdminCurrency', {
                templateUrl: 'app/adm-currencies/currencies-add.tpl.html',
                controller: 'currenciesCtrl as ctrl'
            })
            .when('/editAdminCurrency/:id', {
                templateUrl: 'app/adm-currencies/currencies-add.tpl.html',
                controller: 'currenciesCtrl as ctrl',
                param: 'edit'
            })
            /* Admin System Settings */
            .when('/listAdminSettings', {
                templateUrl: 'app/adm-settings/settings-list.tpl.html',
                controller: 'settingsCtrl as ctrl',
                param: 'list'
            })
            //Manage Admin Links
            .when('/listAdminLinks', {
                templateUrl: 'app/adm-links/links-list.tpl.html',
                controller: 'linksCtrl as ctrl',
                param: 'list'
            })
            .when('/addAdminLinks', {
                templateUrl: 'app/adm-links/links-add.tpl.html',
                controller: 'linksCtrl as ctrl'
            })
            .when('/editAdminLink/:id', {
                templateUrl: 'app/adm-links/links-add.tpl.html',
                controller: 'linksCtrl as ctrl',
                param: 'edit'
            })
            .otherwise({
                redirectTo: '/dashboard'
            });
    }

    GrowlProvider.$inject = ['growlProvider'];
    function GrowlProvider(growlProvider) {
        growlProvider.globalTimeToLive({ success: 20000, error: -1, warning: 20000, info: 20000 });
        //growlProvider.globalTimeToLive(-1);
        growlProvider.globalDisableCountDown(true);
    }
})();