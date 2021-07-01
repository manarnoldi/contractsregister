(function () {
    'use strict';

    angular
        .module('costcenters', [])
        .controller('costcentersCtrl', CostCentersCtrl);

    CostCentersCtrl.$inject = ['$q', '$dialogConfirm', '$dialogAlert', '$routeParams', '$route', '$location', 'costCentersSvc', 'spinnerService', 'UtilService', 'growl'];
    function CostCentersCtrl($q, $dialogConfirm, $dialogAlert, $routeParams, $route, $location, costCentersSvc, spinnerService, UtilService, growl) {
        var ctrl = this;
        ctrl.costcenter = {};
        ctrl.action = $route.current.$$route.param;
        ctrl.links = UtilService.getAppShortcutlinks(2, costCentersSvc.hostWebUrl);
        ctrl.costcenterId = $routeParams.id;

        if (ctrl.action == 'list') {
            spinnerService.show('spinner1');
        }

        var promises = [];
        promises.push(costCentersSvc.getAllItems());

        $q
            .all(promises)
            .then(function (data) {
                ctrl.costcenters = data[0];
                if (ctrl.costcenterId && ctrl.action == 'edit') {
                    ctrl.costcenter = _.find(ctrl.costcenters, function (c) {
                        return c.id == ctrl.costcenterId;
                    });
                }
            })
            .catch(function (error) {
                growl.error(error);
            })
            .finally(function () {
                spinnerService.closeAll();
            });

        ctrl.AddRecord = function () {
            if (!ctrl.costcenter.title) {
                $dialogAlert("Kindly provide the costcenter name.", "Missing Details");
                return;
            } else if (!ctrl.costcenter.code) {
                $dialogAlert("Kindly provide the costcenter code.", "Missing Details");
                return;
            }

            $dialogConfirm(ctrl.action == "edit" ? "Update Record?" : "Add Record?", 'Confirm Transaction')
                .then(function () {
                    spinnerService.show('spinner1');

                    var updateProms = [];
                    if (ctrl.action == 'edit') {
                        updateProms.push(costCentersSvc.UpdateItem(ctrl.costcenter));
                    } else {
                        updateProms.push(costCentersSvc.AddItem(ctrl.costcenter));
                    }

                    $q
                        .all(updateProms)
                        .then(function (res) {
                            growl.success(ctrl.action == "edit" ? "Record updated successfully!" : "Record added successfully!");
                            $location.path("/listAdminCostCenters");
                        })
                        .catch(function (error) {
                            growl.error(error);
                        })
                        .finally(function () {
                            spinnerService.closeAll();
                        });
                });
        };

        ctrl.DeleteRecord = function (id) {
            $dialogConfirm('Delete Record?', 'Confirm Transaction')
                .then(function () {
                    spinnerService.show('spinner1');
                    costCentersSvc
                        .DeleteItem(id)
                        .then(function (res) {
                            ctrl.costcenters = res;
                            growl.success("Record deleted successfully!");
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