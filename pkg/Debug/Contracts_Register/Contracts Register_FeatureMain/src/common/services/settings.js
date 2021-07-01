(function () {
    'use strict';

    angular
        .module('services.settings', [])
        .service('settingsSvc', SettingsSvc);

    SettingsSvc.$inject = ['$q', 'ShptRestService'];
    function SettingsSvc($q, ShptRestService) {
        var svc = this;
        var listname = 'SystemSettings';
        svc.userid = _spPageContextInfo.userId;
        var settingsList = null;
        svc.hostWebUrl = ShptRestService.hostWebUrl;

        svc.getSettings = function () {
            var defer = $q.defer();
            var queryParams = "$select=Id,Title,SettingCode,SettingValue";
            ShptRestService
                .getListItems(listname, queryParams)
                .then(function (data) {
                    settingsList = [];
                    _.forEach(data.results, function (o) {
                        var setting = {};
                        setting.id = o.Id;
                        setting.title = o.Title;
                        setting.code = o.SettingCode;
                        setting.value = o.SettingValue;
                        settingsList.push(setting);
                    });
                    defer.resolve(settingsList);
                })
                .catch(function (error) {
                    console.log(error);
                    defer.reject(error);
                });
            return defer.promise;
        };

        svc.UpdateItems = function (settings) {
            var setProms = [];
            var defEditSetting = $q.defer();
            _.forEach(settings, function (setting) {
                var data = {
                    SettingValue: setting.value
                };
                setProms.push(ShptRestService.updateListItem(listname, setting.id, data));
            });

            $q
                .all(setProms)
                .then(function (response) {
                    defEditSetting.resolve(settings);
                })
                .catch(function (error) {
                    console.log(error);
                    defEditSetting.reject("An error occured while editing the item. Contact IT Service desk for support.");
                });
            return defEditSetting.promise;
        };

        svc.checkIfCurrentUserIsAdmin = function () {
            var deferSettings = $q.defer();
            var qParams = "$select=Id";
            ShptRestService
                .getGroupMembers("Contracts Register Admins", qParams)
                .then(function (users) {
                    var userAdmin = _.some(users.results, ['Id', svc.userid]);
                    deferSettings.resolve(userAdmin);         
                })
                .catch(function (error) {
                    deferSettings.reject(error);
                });
            return deferSettings.promise;
        };
    }
})();