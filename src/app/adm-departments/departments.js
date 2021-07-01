(function () {
    'use strict';

    angular
        .module('departments', [])
        .controller('departmentsCtrl', DepartmentsCtrl);

    DepartmentsCtrl.$inject = ['$q', '$dialogConfirm','$dialogAlert', '$route', '$routeParams', '$location', 'departmentsSvc', 'spinnerService', 'UtilService', 'growl'];
    function DepartmentsCtrl($q, $dialogConfirm, $dialogAlert, $route, $routeParams, $location, departmentsSvc, spinnerService, UtilService, growl) {
        var ctrl = this;
        ctrl.department = {};
        ctrl.action = $route.current.$$route.param;
        ctrl.links = UtilService.getAppShortcutlinks(1, departmentsSvc.hostWebUrl);
        ctrl.departmentId = $routeParams.id;
        ctrl.hostWebUrl = departmentsSvc.hostWebUrl;
        if (ctrl.action == 'list') {
            spinnerService.show('spinner1');
        }

        var promises = [];
        promises.push(departmentsSvc.getAllItems());

        $q
            .all(promises)
            .then(function (data) {
                ctrl.departments = data[0];
                if (ctrl.departmentId && ctrl.action == 'edit') {
                    ctrl.department = _.find(ctrl.departments, function (c) {
                        return c.id == ctrl.departmentId;
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
            if (!ctrl.department.title) {
                $dialogAlert("Kindly provide the Global/Country Team name.", "Missing Details");
                return;
            }

            $dialogConfirm(ctrl.action == "edit" ? "Update Record?" : "Add Record?", 'Confirm Transaction')
                .then(function () {
                    spinnerService.show('spinner1');

                    var updateProms = [];
                    if (ctrl.action == 'edit') {
                        updateProms.push(departmentsSvc.UpdateItem(ctrl.department));
                    } else {
                        updateProms.push(departmentsSvc.AddItem(ctrl.department));
                    }

                    $q
                        .all(updateProms)
                        .then(function (res) {
                            growl.success(ctrl.action == "edit" ? "Record updated successfully!" : "Record added successfully!");
                            $location.path("/listAdminDepartments");
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
                    departmentsSvc
                        .DeleteItem(id)
                        .then(function (res) {
                            ctrl.departments = res;
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