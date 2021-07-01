(function () {
    'use strict';

    angular
        .module('services.contract-renewals', [])
        .service('contractRenewalsSvc', ContractRenewalsSvc);

    ContractRenewalsSvc.$inject = ['$q', 'ShptRestService'];
    function ContractRenewalsSvc($q, ShptRestService) {
        var svc = this;
        var listname = 'ContractRenewals';
        var curUserId = _spPageContextInfo.userId;
        svc.hostWebUrl = ShptRestService.appWebUrl;
        var contractRenewalsList = null;

        svc.getAllItems = function (contractid) {
            var defer = $q.defer();
            var queryParams = "$select=Id,Title,Contract/Id,Contract/Title,StartDate,EndDate,Currency/Id,Currency/Title,Value,Created,Author/Id,Author/Title&$" +
                "expand=Contract,Currency,Author&$filter=Contract/Id eq " + contractid;

            ShptRestService
                .getListItems(listname, queryParams)
                .then(function (data) {
                    contractRenewalsList = [];
                    _.forEach(data.results, function (o) {
                        var ren = {};
                        ren.id = o.Id;
                        ren.title = o.Title;
                        ren.value = o.Value;
                        ren.contract = _.isNil(o.Contract) ? '' : { id: o.Contract.Id, title: o.Contract.Title };
                        ren.startdate = new Date(o.StartDate);
                        ren.enddate = new Date(o.EndDate);
                        ren.currency = _.isNil(o.Currency) ? '' : { id: o.Currency.Id, title: o.Currency.Title };
                        ren.uploaddate = new Date(o.Created);
                        ren.uploadby = _.isNil(o.Author) ? '' : { id: o.Author.Id, title: o.Author.Title };
                        contractRenewalsList.push(ren);
                    });
                    defer.resolve(_.orderBy(contractRenewalsList, ['enddate'], ['desc']));
                })
                .catch(function (error) {
                    defer.reject("An error occured while getting the contract renewals. Contact IT Service desk for support.");
                    console.log(error);
                });
            return defer.promise;
        };

        svc.AddItem = function (renewal, contractid) {
            if (renewal && contractid) {
                var deferAddRenewal = $q.defer();
                svc
                    .getAllItems(contractid)
                    .then(function (renewals) {
                        var itemExists = _.some(renewals, function (r) {
                            return ((renewal.startdate <= r.enddate) || (renewal.enddate <= r.enddate));
                        });

                        if (itemExists) {
                            deferAddRenewal.reject("The renewal dates are already covered in previous dates. Contact IT Service desk for support.");
                        } else {
                            var data = {
                                Title: "Contract Renewal for Contract Id " + contractid,
                                Value: renewal.value,
                                StartDate: renewal.startdate,
                                EndDate: renewal.enddate,
                                CurrencyId: renewal.currency.id,
                                ContractId: contractid
                            };
                            ShptRestService
                                .createNewListItem(listname, data)
                                .then(function (results) {
                                    svc
                                        .getAllItems(contractid)
                                        .then(function (renewals) {
                                            deferAddRenewal.resolve(_.orderBy(renewals, ['startdate'], ['desc']));
                                        })
                                        .catch(function (error) {
                                            console.log(error);
                                            deferAddRenewal.reject("An error occured while getting the items. Contact IT Service desk for support.");
                                        });
                                })
                                .catch(function (error) {
                                    console.log(error);
                                    deferAddRenewal.reject("An error occured while adding the item. Contact IT Service desk for support.");
                                });
                        }
                    });
                return deferAddRenewal.promise;
            }
        };

        svc.DeleteItem = function (id, contractid) {
            var defer = $q.defer();
            if (id) {
                ShptRestService
                    .deleteListItem(listname, id)
                    .then(function () {
                        svc
                            .getAllItems(contractid)
                            .then(function (renewals) {
                                defer.resolve(_.orderBy(renewals, ['title'], ['asc']));
                            })
                            .catch(function (error) {
                                console.log(error);
                                defer.reject("An error occured while getting the items. Contact IT Service desk for support.");
                            });
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