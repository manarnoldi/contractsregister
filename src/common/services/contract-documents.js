(function () {
    'use strict';

    angular
        .module('services.contract-documents', [])
        .service('contractDocumentsSvc', ContractDocumentsSvc);

    ContractDocumentsSvc.$inject = ['$q', 'ShptRestService'];
    function ContractDocumentsSvc($q, ShptRestService) {
        var svc = this;
        var listname = 'ContractDocuments';
        var curUserId = _spPageContextInfo.userId;
        svc.hostWebUrl = ShptRestService.appWebUrl;
        var contractDocumentsList = null;

        svc.getAllItems = function (contractid) {
            var defer = $q.defer();
            var queryParams = "$select=Id,Title,Contract/Id,Contract/Title,DocumentDetails,DocumentType/Id,DocumentType/Title,FileRef,FileLeafRef,Created,Author/Id,Author/Title&$" +
                "expand=DocumentType,Contract,Author&$filter=Contract/Id eq " + contractid;

            ShptRestService
                .getListItems(listname, queryParams)
                .then(function (data) {
                    contractDocumentsList = [];
                    _.forEach(data.results, function (o) {

                        var doc = {};
                        doc.id = o.Id;
                        doc.title = o.Title;
                        doc.details = o.DocumentDetails;
                        doc.contract = _.isNil(o.Contract) ? '' : { id: o.Contract.Id, title: o.Contract.Title };
                        doc.type = _.isNil(o.DocumentType) ? '' : { id: o.DocumentType.Id, title: o.DocumentType.Title };
                        doc.link = { href: o.FileRef, title: o.FileLeafRef };
                        doc.uploaddate = new Date(o.Created);
                        doc.uploadby = _.isNil(o.Author) ? '' : { id: o.Author.Id, title: o.Author.Title };
                        contractDocumentsList.push(doc);
                    });
                    defer.resolve(_.orderBy(contractDocumentsList, ['uploaddate'], ['desc']));
                })
                .catch(function (error) {
                    defer.reject("An error occured while getting the contract documents. Contact IT Service desk for support.");
                    console.log(error);
                });
            return defer.promise;
        };

        svc.AddItem = function (documents, contractid) {
            var deferAddDoc = $q.defer();
            var addProms = [];
            _.forEach(documents, function (doc) {
                var nameWithNoExt = doc.attachment.name.substring(0, doc.attachment.name.lastIndexOf('.'));
                var ext = doc.attachment.name.split('.').pop();
                doc.attachment.name = nameWithNoExt + "_" + Date.now() + "." + ext;

                var data = {
                    Title: doc.attachment.name,
                    DocumentDetails: doc.details,
                    DocumentTypeId: doc.type.id,
                    ContractId: contractid
                };
                addProms.push(ShptRestService.uploadFileToDocumentLibrary(listname, "/", doc.attachment, data));
            });
           
            $q
                .all(addProms)
                .then(function (response) {
                    deferAddDoc.resolve(true);
                })
                .catch(function (error) {
                    console.log(error);
                    deferAddDoc.reject("An error occured while adding the item. Contact IT Service desk for support.");
                });
            return deferAddDoc.promise;
        };

        svc.DeleteItem = function (id, contractid) {
            var defer = $q.defer();
            if (id) {
                ShptRestService
                    .deleteListItem(listname, id)
                    .then(function () {
                        svc
                            .getAllItems(contractid)
                            .then(function (documents) {
                                defer.resolve(_.orderBy(documents, ['uploaddate'], ['desc']));
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