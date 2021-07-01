(function () {
    'use strict';

    angular
        .module('settings', [])
        .controller('settingsCtrl', SettingsCtrl);

    SettingsCtrl.$inject = ['$q', '$dialogConfirm', 'settingsSvc', 'spinnerService', 'UtilService', 'growl'];
    function SettingsCtrl($q, $dialogConfirm, settingsSvc, spinnerService, UtilService, growl) {
        var ctrl = this;
        ctrl.links = UtilService.getAppShortcutlinks(5, settingsSvc.hostWebUrl);
        spinnerService.show('spinner1');
        var promises = [];
        promises.push(settingsSvc.getSettings());

        $q
            .all(promises)
            .then(function (data) {
                ctrl.settings = data[0];
            })
            .catch(function (error) {
                growl.error(error);
            })
            .finally(function () {
                spinnerService.closeAll();
            });

        ctrl.changeStatus = function (setting) {
            if (setting.value == "Yes") {
                setting.value = "No";
            } else {
                setting.value = "Yes";
            }
        };

        ctrl.updateSettings = function () {
            $dialogConfirm('Update Settings?', 'Confirm Transaction')
                .then(function () {
                    spinnerService.show('spinner1');
                    settingsSvc
                        .UpdateItems(ctrl.settings)
                        .then(function (res) {
                            ctrl.settings = res;
                            growl.success("Settings Updated Successfully");
                        })
                        .catch(function (error) {
                            growl.success(error);
                        })
                        .finally(function () {
                            spinnerService.closeAll();
                        });
                });
        };
    }
})();