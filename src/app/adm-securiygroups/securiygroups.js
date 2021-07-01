(function () {
    'use strict';

    angular
        .module('countries', [])
        .controller('countriesCtrl', CountriesCtrl);

    CountriesCtrl.$inject = ['$q', '$dialogConfirm', '$route', '$location', 'countriesSvc', 'spinnerService', 'UtilService', 'growl'];
    function CountriesCtrl($q, $dialogConfirm, $route, $location, countriesSvc, spinnerService, UtilService, growl) {
        var ctrl = this;
        ctrl.country = {};
        ctrl.action = $route.current.$$route.param;
        ctrl.links = UtilService.getAppShortcutlinks(4);

        if (ctrl.action == 'list') {
            spinnerService.show('spinner1');
        }

        var promises = [];
        promises.push(countriesSvc.getAllItems());

        $q
            .all(promises)
            .then(function (data) {
                ctrl.countries = data[0];
            })
            .catch(function (error) {
                growl.error(error);
            })
            .finally(function () {
                spinnerService.closeAll();
            });

        ctrl.AddRecord = function () {
            if (!ctrl.country.title) {
                return;
            }

            $dialogConfirm('Add Record?', 'Confirm Transaction')
                .then(function () {
                    spinnerService.show('spinner1');
                    countriesSvc
                        .AddItem(ctrl.country)
                        .then(function (res) {
                            ctrl.countries = res;
                            growl.success('Record added successfully!');
                            $location.path("/listAdminCountries");
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
                    countriesSvc
                        .DeleteItem(id)
                        .then(function (res) {
                            ctrl.countries = res;
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