(function () {
    'use strict';

    angular
        .module('contracts', [])
        .controller('contractsCtrl', ContractsCtrlFunction);

    ContractsCtrlFunction.$inject = ['$q', '$route', '$routeParams', 'linksSvc', '$dialogConfirm', '$location', 'contractsSvc',
        'departmentsSvc', 'contractSuppliersSvc', 'spinnerService', 'growl', 'settingsSvc'];
    function ContractsCtrlFunction($q, $route, $routeParams, linksSvc, $dialogConfirm, $location, contractsSvc, departmentsSvc,
        contractSuppliersSvc, spinnerService, growl, settingsSvc) {
        var ctrl = this;
        var suppliers = [];
        spinnerService.show('spinner1');
        ctrl.expiryninetydays = 0;
        ctrl.expirysixetydays = 0;
        ctrl.expirythirtydays = 0;
        ctrl.expiryexpired = 0;
        ctrl.allcontracts = 0;
        ctrl.contracts = [];
        ctrl.datesreadonly = false;
        ctrl.isAdmin = false;
        ctrl.showsupplierdetails = true;
        ctrl.showcontractvalue = true;
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
        promises.push(settingsSvc.getSettings());
        promises.push(contractSuppliersSvc.getAllItems());

        $q
            .all(promises)
            .then(function (results) {
                ctrl.departments = results[0];
                ctrl.department = _.find(ctrl.departments, ['id', ctrl.teamid]);
                ctrl.isAdmin = results[1];
                ctrl.contracts = results[2];
                suppliers = results[5];
                for (var c = 0; c < ctrl.contracts.length; c++) {
                    ctrl.contracts[c].suppliers = _.filter(suppliers, function (supplier) { return supplier.contract.id == ctrl.contracts[c].id });
                    ctrl.contracts[c].curusermanager = _.some(_.find(ctrl.departments, ['id', ctrl.contracts[c].department.id]).managers, ['Id', _spPageContextInfo.userId]);
                }
                ctrl.guideslinks = results[3];
                ctrl.showsupplierdetails = (_.find(results[4], ['code', 'SR004'])).value == "Yes";
                ctrl.showcontractvalue = (_.find(results[4], ['code', 'SR005'])).value == "Yes";
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

        ctrl.deleteContract = id => {
            $dialogConfirm('Are you sure you want to delete the whole contract? This will delete the contract, any contract renewals available, all contract suppliers defined and any contract documents uploaded.', 'Confirm Transaction')
                .then(function () {
                    spinnerService.show('spinner1');
                    contractsSvc
                        .DeleteItem(id)
                        .then(function (res) {
                            growl.success("Contract record deleted successfully!");
                            $location.path("/dashboard");
                        })
                        .catch(function (error) {
                            growl.error(error);
                        })
                        .finally(function () {
                            spinnerService.closeAll();
                        })
                });
        };
    }
})();