(function () {
    'use strict';

    angular
        .module('currencies', [])
        .controller('currenciesCtrl', CurrenciesCtrl);

    CurrenciesCtrl.$inject = ['$q', '$dialogConfirm', '$dialogAlert', '$route','$routeParams', '$location', 'currenciesSvc', 'spinnerService', 'UtilService', 'growl'];
    function CurrenciesCtrl($q, $dialogConfirm, $dialogAlert, $route, $routeParams, $location, currenciesSvc, spinnerService, UtilService, growl) {
        var ctrl = this;
        ctrl.currency = {};
        ctrl.action = $route.current.$$route.param;
        ctrl.links = UtilService.getAppShortcutlinks(4, currenciesSvc.hostWebUrl);
        ctrl.currencyId = $routeParams.id;

        if (ctrl.action == 'list') {
            spinnerService.show('spinner1');
        }

        var promises = [];
        promises.push(currenciesSvc.getAllItems());

        $q
            .all(promises)
            .then(function (data) {
                ctrl.currencies = data[0];
                if (ctrl.currencyId && ctrl.action == 'edit') {
                    ctrl.currency = _.find(ctrl.currencies, function (c) {
                        return c.id == ctrl.currencyId;
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
            if (!ctrl.currency.title) {
                $dialogAlert("Kindly provide the currency name.", "Missing Details");
                return;
            } else if (!ctrl.currency.abbr) {
                $dialogAlert("Kindly provide the currency abbreviation.", "Missing Details");
                return;
            }

            $dialogConfirm(ctrl.action == "edit" ? "Update Record?" : "Add Record?", 'Confirm Transaction')
                .then(function () {
                    spinnerService.show('spinner1');

                    var updateProms = [];
                    if (ctrl.action == 'edit') {
                        updateProms.push(currenciesSvc.UpdateItem(ctrl.currency));
                    } else {
                        updateProms.push(currenciesSvc.AddItem(ctrl.currency));
                    }

                    $q
                        .all(updateProms)
                        .then(function (res) {
                            growl.success(ctrl.action == "edit" ? "Record updated successfully!" : "Record added successfully!");
                            $location.path("/listAdminCurrencies");
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
                    currenciesSvc
                        .DeleteItem(id)
                        .then(function (res) {
                            ctrl.currencies = res;
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