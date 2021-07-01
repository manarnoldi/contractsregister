(function () {
    'use strict';

    angular
        .module('services.contract-suppliers', [])
        .service('contractSuppliersSvc', ContractSuppliersSvc);

    ContractSuppliersSvc.$inject = ['$q', 'ShptRestService'];
    function ContractSuppliersSvc($q, ShptRestService) {
        var svc = this;
        var listname = 'ContractSuppliers';
        var curUserId = _spPageContextInfo.userId;
        svc.hostWebUrl = ShptRestService.appWebUrl;
        var contractSuppliersList = null;

        svc.getAllItems = function (contractid) {
            var defer = $q.defer();
            var queryParams = "$select=Id,Title,SupplierContact,PhysicalAddress,EmailPhone,Website,Contract/Id,Contract/Title,Created,Author/Id,Author/Title,SalesforceId&$expand=Contract,Author&$filter=Contract/Id eq " + contractid;
            ShptRestService
                .getListItems(listname, queryParams)
                .then(function (data) {
                    contractSuppliersList = [];
                    _.forEach(data.results, function (o) {
                        var supplier = {};
                        supplier.id = o.Id;
                        supplier.title = o.Title;
                        supplier.contract = _.isNil(o.Contract) ? "" : { id: o.Contract.Id, title: o.Contract.Title };
                        supplier.contacts = o.SupplierContact;
                        supplier.address = o.PhysicalAddress;
                        supplier.emailphone = o.EmailPhone;
                        supplier.website = o.Website;
                        supplier.salesforceid = o.SalesforceId;
                        supplier.uploaddate = new Date(o.Created);
                        supplier.uploadby = _.isNil(o.Author) ? '' : { id: o.Author.Id, title: o.Author.Title };
                        contractSuppliersList.push(supplier);
                    });
                    defer.resolve(_.orderBy(contractSuppliersList, ['title'], ['asc']));
                })
                .catch(function (error) {
                    defer.reject("An error occured while getting the contract suppliers. Contact IT Service desk for support.");
                    console.log(error);
                });
            return defer.promise;
        };

        svc.AddItem = function (suppliers, contractid) {
            if (suppliers && contractid) {
                var deferAddSuplier = $q.defer();
                var addProms = [];
                _.forEach(suppliers, function (supplier) {
                    var data = {
                        Title: supplier.title,
                        SupplierContact: supplier.contacts,
                        PhysicalAddress: supplier.address,
                        EmailPhone: supplier.emailphone,
                        Website: supplier.website,
                        SalesforceId: supplier.salesforceid,
                        ContractId: contractid
                    };
                    addProms.push(ShptRestService.createNewListItem(listname, data));
                });
                $q
                    .all(addProms)
                    .then(function (res) {
                        deferAddSuplier.resolve(true);
                    })
                    .catch(function (error) {
                        console.log(error);
                        deferAddSuplier.reject("An error occured while adding the item. Contact IT Service desk for support.");
                    });
                return deferAddSuplier.promise;
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
                            .then(function (suppliers) {
                                defer.resolve(_.orderBy(suppliers, ['title'], ['asc']));
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