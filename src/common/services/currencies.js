(function(){
    'use strict';

    angular
        .module('services.currencies', [])
        .service('currenciesSvc', CurrenciesSvc);

    CurrenciesSvc.$inject = ['$q', 'ShptRestService'];
    function CurrenciesSvc($q, ShptRestService) {
        var svc = this;
        var listname = 'Currencies';
        var curUserId = _spPageContextInfo.userId;
        var currenciesList = null;
        svc.hostWebUrl = ShptRestService.hostWebUrl;

        svc.getAllItems = function () {
            var defer = $q.defer();
            var queryParams = "$select=Id,Title,Abbr";
            ShptRestService
                .getListItems(listname, queryParams)
                .then(function (data) {
                    currenciesList = [];
                    _.forEach(data.results, function (o) {
                        var currency = {};
                        currency.id = o.Id;
                        currency.title = o.Title;
                        currency.abbr = o.Abbr;
                        currenciesList.push(currency);
                    });
                    defer.resolve(_.orderBy(currenciesList, ['title'], ['asc']));
                })
                .catch(function (error) {
                    defer.reject(error);
                });
            return defer.promise;
        };

        svc.AddItem = function (currency) {
            var defer = $q.defer();
            var itemExists = _.some(currenciesList, ['title', currency.title]);
            if (itemExists) {
                defer.reject("The item specified already exists in the system. Contact IT Service desk for support.");
            } else {
                var data = {
                    Title: currency.title,
                    Abbr: currency.abbr
                };

                ShptRestService
                    .createNewListItem(listname, data)
                    .then(function (response) {
                        defer.resolve(true);
                    })
                    .catch(function (error) {
                        console.log(error);
                        defer.reject("An error occured while adding the item. Contact IT Service desk for support.");
                    });
            }
            return defer.promise;
        };

        svc.UpdateItem = function (currency) {
            var deferEdit = $q.defer();
            svc
                .getAllItems()
                .then(function (response) {
                    var itemExists = _.some(response, function (o) {
                        return o.id == currency.id;
                    });

                    if (!itemExists) {
                        deferEdit.reject("The item to be edited does not exist. Contact IT Service desk for support.");
                    } else {
                        var data = {
                            Title: currency.title,
                            Abbr: currency.abbr
                        };

                        ShptRestService
                            .updateListItem(listname, currency.id, data)
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
                        _.remove(currenciesList, {
                            id: id
                        });
                        defer.resolve(_.orderBy(currenciesList, ['title'], ['asc']));
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
}) ();