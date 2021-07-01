(function () {
    'use strict';

    angular
        .module('links', [])
        .controller('linksCtrl', LinksCtrl);

    LinksCtrl.$inject = ['$q', '$dialogConfirm', '$dialogAlert', '$routeParams', '$route', '$location', 'linksSvc', 'spinnerService', 'UtilService', 'growl'];
    function LinksCtrl($q, $dialogConfirm, $dialogAlert, $routeParams, $route, $location, linksSvc, spinnerService, UtilService, growl) {
        var ctrl = this;
        ctrl.link = {};
        ctrl.action = $route.current.$$route.param;
        ctrl.menulinks = UtilService.getAppShortcutlinks(6, linksSvc.hostWebUrl);
        ctrl.linkId = $routeParams.id;

        if (ctrl.action == 'list') {
            spinnerService.show('spinner1');
        }

        var promises = [];
        promises.push(linksSvc.getAllItems());

        $q
            .all(promises)
            .then(function (data) {
                ctrl.links = data[0];
                if (ctrl.linkId && ctrl.action == 'edit') {
                    ctrl.link = _.find(ctrl.links, function (l) {
                        return l.id == ctrl.linkId;
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
            if (!ctrl.link.title) {
                $dialogAlert("Kindly provide the link title.", "Missing Details");
                return;
            } else if (!ctrl.link.url) {
                $dialogAlert("Kindly provide the link url.", "Missing Details");
                return;
            } else if (!ctrl.link.icon) {
                $dialogAlert("Kindly provide the link icon.", "Missing Details");
                return;
            } else if (!ctrl.link.target) {
                $dialogAlert("Kindly provide the link target.", "Missing Details");
                return;
            }

            $dialogConfirm(ctrl.action == "edit" ? "Update Record?" : "Add Record?", 'Confirm Transaction')
                .then(function () {
                    spinnerService.show('spinner1');

                    var updateProms = [];
                    if (ctrl.action == 'edit') {
                        updateProms.push(linksSvc.UpdateItem(ctrl.link));
                    } else {
                        updateProms.push(linksSvc.AddItem(ctrl.link));
                    }

                    $q
                        .all(updateProms)
                        .then(function (res) {
                            growl.success(ctrl.action == "edit" ? "Record updated successfully!" : "Record added successfully!");
                            $location.path("/listAdminLinks");
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
                    linksSvc
                        .DeleteItem(id)
                        .then(function (res) {
                            ctrl.links = res;
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