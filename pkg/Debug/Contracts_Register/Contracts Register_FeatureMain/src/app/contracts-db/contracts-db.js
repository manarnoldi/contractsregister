(function () {
    'use strict';

    angular
        .module('contracts', [])
        .controller('contractsCtrl', ContractsCtrlFunction);

    ContractsCtrlFunction.$inject = ['$q', '$route', '$routeParams', 'linksSvc', '$dialogAlert', 'contractsSvc', 'departmentsSvc', 'spinnerService', 'growl', 'settingsSvc'];
    function ContractsCtrlFunction($q, $route, $routeParams, linksSvc, $dialogAlert, contractsSvc, departmentsSvc, spinnerService, growl, settingsSvc) {
        var ctrl = this;
        spinnerService.show('spinner1');
        ctrl.expiryninetydays = 0;
        ctrl.expirysixetydays = 0;
        ctrl.expirythirtydays = 0;
        ctrl.expiryexpired = 0;
        ctrl.allcontracts = 0;
        ctrl.contracts = [];
        ctrl.datesreadonly = false;
        ctrl.isAdmin = false;
        ctrl.teamid = parseInt($routeParams.teamid);
        ctrl.status = $routeParams.status;

        ctrl.featureNotdeveloped = function () {
            growl.info("This feature is not fully developed yet. Check it out after a few hours/days for updates.");
        };

        var promises = [];
        promises.push(departmentsSvc.getAllItems());
        promises.push(settingsSvc.checkIfCurrentUserIsAdmin());
        promises.push(contractsSvc.getContractsSearched(ctrl.teamid, ctrl.status));
        promises.push(linksSvc.getAllItems());

        $q
            .all(promises)
            .then(function (results) {
                ctrl.departments = results[0];
                ctrl.department = _.find(ctrl.departments, ['id', ctrl.teamid]);
                ctrl.isAdmin = results[1];
                ctrl.contracts = results[2];
                ctrl.guideslinks = results[3];
                LoadSummaries(ctrl.contracts);
                ctrl.statuses = ["Active", "Expired"];
                ctrl.types = ["Contract", "Framework Agreement"];
                //ctrl.status = "Active";
                ctrl.type = "Contract";                
            })
            .catch(function (error) {
                growl.error(error);
            })
            .finally(function () {
                spinnerService.closeAll();
            });

        function LoadSummaries(contracts) {
            ctrl.contracts = contracts;
            ctrl.filterContracts = _.cloneDeep(contracts);
            var curDate = new Date();
            ctrl.allcontracts = contracts.length;
            ctrl.expiryninetydays = _.filter(contracts, function (c) {
                var days = Math.round((c.enddate - curDate) / (1000 * 60 * 60 * 24));
                return days >= 61 && days <= 90;
            }).length;
            ctrl.expirysixetydays = _.filter(contracts, function (c) {
                var days = Math.round((c.enddate - curDate) / (1000 * 60 * 60 * 24));
                return days >= 31 && days <= 60;
            }).length;
            ctrl.expirythirtydays = _.filter(contracts, function (c) {
                var days = Math.round((c.enddate - curDate) / (1000 * 60 * 60 * 24));
                return days >= 0 && days <= 30;
            }).length;
            ctrl.expiryexpired = _.filter(contracts, function (c) {
                var days = Math.round((c.enddate - curDate) / (1000 * 60 * 60 * 24));
                return days < 0;
            }).length;
        }

        ctrl.SearchContracts = function () {
            if (!ctrl.department) {
                ctrl.department = "all";
            }
            spinnerService.show('spinner1');
            contractsSvc
                .getContractsSearched(ctrl.department.id, ctrl.status)
                .then(function (contracts) {
                    LoadSummaries(contracts);
                })
                .catch(function (error) {
                    growl.error(error);
                })
                .finally(function () {
                    spinnerService.closeAll();
                });
        };

        ctrl.getContracts = function (max, min) {
            spinnerService.show('spinner1');
            ctrl.contracts = ctrl.filterContracts;
            var curDate = new Date();
            if (max == 1 && min == 1) {
                ctrl.contracts = ctrl.filterContracts;
            } else {
                ctrl.contracts = _.filter(ctrl.contracts, function (c) {
                    var days = Math.round((c.enddate - curDate) / (1000 * 60 * 60 * 24));
                    if (min == 0 && max == 0) {
                        return days <= min;
                    } else {
                        return days >= min && days <= max;
                    }
                });
            }
            spinnerService.closeAll();
        };
    }
})();