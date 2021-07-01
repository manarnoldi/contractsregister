(function () {
    'use strict';

    angular
        .module('services.costcenters', [])
        .service('costCentersSvc', CostCentersSvc);

    CostCentersSvc.$inject = ['$q', 'ShptRestService'];
    function CostCentersSvc($q, ShptRestService) {
        var svc = this;
        var listname = 'CostCenter';
        var curUserId = _spPageContextInfo.userId;
        var costcentersList = null;
        svc.hostWebUrl = ShptRestService.hostWebUrl;

        svc.getAllItems = function () {
            var defer = $q.defer();
            var queryParams = "$select=Id,Title,Code";
            ShptRestService
                .getListItems(listname, queryParams)
                .then(function (data) {
                    costcentersList = [];
                    _.forEach(data.results, function (o) {
                        var costcenter = {};
                        costcenter.id = o.Id;
                        costcenter.title = o.Title;
                        costcenter.code = o.Code;
                        costcentersList.push(costcenter);
                    });
                    defer.resolve(_.orderBy(costcentersList, ['code'], ['asc']));
                })
                .catch(function (error) {
                    defer.reject(error);
                });
            return defer.promise;
        };

        svc.AddItem = function (costcenter) {
            var defer = $q.defer();
            var itemExists = _.some(costcentersList, ['title', costcenter.title]);

            if (itemExists) {
                defer.reject("The item specified already exists in the system. Contact IT Service desk for support.");
            } else {

                var data = {
                    Title: costcenter.title,
                    Code: costcenter.code
                };

                ShptRestService
                    .createNewListItem(listname, data)
                    .then(function (response) {
                        costcenter.id = response.ID;
                        costcentersList.push(costcenter);
                        defer.resolve(_.orderBy(costcentersList, ['code'], ['asc']));
                    })
                    .catch(function (error) {
                        console.log(error);
                        defer.reject("An error occured while adding the item. Contact IT Service desk for support.");
                    });
            }
            return defer.promise;
        };

        svc.UpdateItem = function (costcenter) {
            var deferEdit = $q.defer();
            svc
                .getAllItems()
                .then(function (response) {
                    var itemExists = _.some(response, function (o) {
                        return o.id == costcenter.id;
                    });

                    if (!itemExists) {
                        deferEdit.reject("The item to be edited does not exist. Contact IT Service desk for support.");
                    } else {
                        var data = {
                            Title: costcenter.title,
                            Code: costcenter.code
                        };

                        ShptRestService
                            .updateListItem(listname, costcenter.id, data)
                            .then(function (response) {
                                deferEdit.resolve(true);
                            })
                            .catch(function (error) {
                                console.log(error);
                                deferEdit.reject("An error occured while adding the item. Contact IT Service desk for support.");
                            });
                    }
                })
                .catch(function (error) {
                    deferEdit.reject("An error occured while retrieving the items. Contact IT Service desk for support.");
                    console.log(error);
                });
            return deferEdit.promise;
        };

        svc.DeleteItem = function (id) {
            var defer = $q.defer();
            if (id) {
                ShptRestService
                    .deleteListItem(listname, id)
                    .then(function () {
                        _.remove(costcentersList, {
                            id: id
                        });
                        defer.resolve(_.orderBy(costcentersList, ['code'], ['asc']));
                    })
                    .catch(function (error) {
                        console.log(error);
                        defer.reject("An error occured while deleting the item. Contact IT Service desk for support.");
                    });
            } else {
                defer.reject('Item to be deleted is missing Id. Contact IT Service desk for support.');
            }
            return defer.promise;
        };
    }
})();