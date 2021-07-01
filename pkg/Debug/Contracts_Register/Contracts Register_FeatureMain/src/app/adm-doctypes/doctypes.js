(function () {
    'use strict';

    angular
        .module('doctypes', [])
        .controller('doctypesCtrl', DocTypesCtrl);

    DocTypesCtrl.$inject = ['$q', '$dialogConfirm', '$dialogAlert','$route','$routeParams', '$location', 'docTypesSvc', 'spinnerService', 'UtilService', 'growl'];
    function DocTypesCtrl($q, $dialogConfirm, $dialogAlert, $route, $routeParams, $location, docTypesSvc, spinnerService, UtilService, growl) {
        var ctrl = this;
        ctrl.doctype = {};
        ctrl.action = $route.current.$$route.param;
        ctrl.links = UtilService.getAppShortcutlinks(3, docTypesSvc.hostWebUrl);
        ctrl.doctype.required = false;
        ctrl.step = {};
        ctrl.agreementtype = {};
        ctrl.doctypeId = $routeParams.id;

        if (ctrl.action == 'list') {
            spinnerService.show('spinner1');
        }

        var promises = [];
        promises.push(docTypesSvc.getAllItems());

        $q
            .all(promises)
            .then(function (data) {
                ctrl.doctypes = data[0];
                if (ctrl.doctypeId && ctrl.action == 'edit') {
                    ctrl.doctype = _.find(ctrl.doctypes, function (c) {
                        return c.id == ctrl.doctypeId;
                    });

                    ctrl.agreementtype.contract = false;
                    ctrl.agreementtype.frameworkagreement = false;
                    ctrl.agreementtype.propertylease = false;

                    ctrl.step.new = false;
                    ctrl.step.extension = false;

                    if (_.includes(ctrl.doctype.step,"New")) {
                        ctrl.step.new = true;
                    }
                    if (_.includes(ctrl.doctype.step, "Extension")) {
                        ctrl.step.extension = true;
                    }

                    if (_.includes(ctrl.doctype.agreementtype, "Contract")) {
                        ctrl.agreementtype.contract = true;
                    }
                    if (_.includes(ctrl.doctype.agreementtype, "Framework Agreement")) {
                        ctrl.agreementtype.frameworkagreement = true;
                    }
                    if (_.includes(ctrl.doctype.agreementtype, "Property Lease")) {
                        ctrl.agreementtype.propertylease = true;
                    }
                }                
            })
            .catch(function (error) {
                growl.error(error);
            })
            .finally(function () {
                spinnerService.closeAll();
            });

        ctrl.AddRecord = function () {
            if (!ctrl.doctype.title) {
                $dialogAlert("Kindly provide the Document Type name.", "Missing Details");
                return;
            }

            $dialogConfirm(ctrl.action == "edit" ? "Update Record?" : "Add Record?", 'Confirm Transaction')
                .then(function () {
                    spinnerService.show('spinner1');
                    ctrl.doctype.step = [];
                    ctrl.doctype.agreementtype = [];
                    if (ctrl.step.new) {
                        ctrl.doctype.step.push("New");
                    }
                    if (ctrl.step.extension) {
                        ctrl.doctype.step.push("Extension");
                    }

                    if (ctrl.agreementtype.contract) {
                        ctrl.doctype.agreementtype.push("Contract");
                    }
                    if (ctrl.agreementtype.frameworkagreement) {
                        ctrl.doctype.agreementtype.push("Framework Agreement");
                    }
                    if (ctrl.agreementtype.propertylease) {
                        ctrl.doctype.agreementtype.push("Property Lease");
                    }

                    var updateProms = [];
                    if (ctrl.action == 'edit') {
                        updateProms.push(docTypesSvc.UpdateItem(ctrl.doctype));
                    } else {
                        updateProms.push(docTypesSvc.AddItem(ctrl.doctype));
                    }

                    $q
                        .all(updateProms)
                        .then(function (res) {
                            growl.success(ctrl.action == "edit" ? "Record updated successfully!" : "Record added successfully!");
                            $location.path("/listAdminDocTypes");
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
                    docTypesSvc
                        .DeleteItem(id)
                        .then(function (res) {
                            ctrl.doctypes = res;
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

        ctrl.changeRequiredValue = function () {
            ctrl.doctype.required = !ctrl.doctype.required;
        };
    }
})();