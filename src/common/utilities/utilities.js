angular
    .module('services.utilities', [])
    .factory('ArrayUtils', function () {
        /*
         Utility function to remove an item from an array of objects based on a property value
        */
        var arrayUtils = {};
        arrayUtils.removeByAttr = function (arr, attr, value) {
            var i = arr.length;
            while (i--) {
                if (arr[i]
                    && arr[i].hasOwnProperty(attr)
                    && (arguments.length > 2 && arr[i][attr] === value)) {
                    arr.splice(i, 1);
                }
            }
            return arr;
        };

        arrayUtils.updateByAttr = function (arr, attr, value, newValue) {
            var i = arr.length;
            while (i--) {
                if (arr[i]
                    && arr[i].hasOwnProperty(attr)
                    && (arguments.length > 3 && arr[i][attr] === value)) {
                    arr[i] = newValue;
                }
            }
            return arr;
        };

        arrayUtils.recordExists = function (arr, attr, value) {
            var i = arr.length;
            var found = false;
            while (i-- && found === false) {
                if (arr[i]
                    && arr[i].hasOwnProperty(attr)
                    && (arguments.length > 2 && arr[i][attr] === value)) {
                    found = true;
                }
            }
            return arr;
        };

        arrayUtils.containsObject = function (arr, attr, obj) {
            var i;
            for (i = 0; i < arr.length; i++) {
                if (arr[i][attr] === obj[attr]) {
                    return true;
                }
            }
        };

        /*
        * Update an item inside an array
        * @param {array} - The array containing the object to be updated
        * @param {object} - The updated object that needs to be updated in the array
        * @param {predicate} - A condition than determines the exact position of the object to be updated within the array 
        * @returns {array} - The updated array
        **/
        arrayUtils.updateItemInArray = function (arr, updatedItem, predicate) {
            var index = _.findIndex(arr, predicate);
            arr[index] = updatedItem;
            return arr;
        };
        return arrayUtils;
    })

    .factory('UtilService', ['$q', function ($q) {
        var utilService = {};

        /**
         * A function for returning value of a provided string parameter.
         * @param  {} urlParameterKey is the key provided.
         */
        utilService.getQueryStringParameter = function (urlParameterKey) {
            var params = document.URL.split('?')[1].split('&');
            for (var i = 0; i < params.length; i = i + 1) {
                var singleParam = params[i].split('=');
                if (singleParam[0] == urlParameterKey)
                    return singleParam[1];
            }
        };

        /**
         * A funciton that ensures sp.js file is loaded.
         */
        utilService.waitForScriptsToLoad = function () {
            var deferred = $q.defer();
            var context;
            SP.SOD.executeOrDelayUntilScriptLoaded(function () {
                context = SP.ClientContext.get_current();
                // $.getScript(context.get_url() + "/_layouts/15/sp.runtime.js", function () {
                deferred.resolve(context);
                //})
            }, 'sp.js');
            return deferred.promise;
        };

        /**
          * A function that returns the shortcut links.
          */
        utilService.getAppShortcutlinks = function (activeLinkId, hostWebUrl) {
            var links = [
                { 'id': 1, title: 'Country Office/Global Teams', icon: 'fa-building', url: '#listAdminDepartments', class: '', target:'_parent' },
                { 'id': 2, title: 'Cost Centers', icon: 'fa-eur', url: '#listAdminCostCenters', class: '', target:'_parent' },
                { 'id': 3, title: 'Document Types', icon: 'fa-files-o ', url: '#listAdminDocTypes', class: '', target:'_parent' },
                { 'id': 4, title: 'Currencies', icon: 'fa-wrench', url: '#listAdminCurrencies', class: '', target:'_parent' },
                { 'id': 5, title: 'System Settings', icon: 'fa-cogs', url: '#listAdminSettings', class: '', target: '_parent' },
                { 'id': 6, title: 'System Links', icon: 'fa-cogs', url: '#listAdminLinks', class: '', target: '_parent' }            ];

            var activeLink = _.find(links, ['id', activeLinkId]);
            activeLink.class = "button-active";
            return links;
        };

        /**
         * A function that returns the admin menu links.
         */
        utilService.getAppAdminlinks = function (activeLinkId, type, useradmin) {
            var adminMenu = {}
            var links = [];
            if (type == 'reports') {
                adminMenu.adminMenuTitle = "REPORTS MENU";
                links = [];
                links.push({ 'id': 1, title: 'MY TRAININGS', class: '', url: '#listTrainingList/1' });
                if (useradmin) {
                    links.push({ 'id': 2, title: 'ATTENDANCES', class: '', url: '#listTrainingAttendance/2' });
                    links.push({ 'id': 3, title: 'MATRIX', class: '', url: '#listTrainingMatrix/3' });
                }
            } else {
                adminMenu.adminMenuTitle = "STAFF ADMIN MENU";
                links = [
                    { 'id': 1, title: 'STAFF MEMBERS', class: '', url: '#listPeople' }
                    // { 'id': 2, title: 'DEPARTMENTS', class: '', url: '#listDepartments' },
                    // { 'id': 3, title: 'LOCATIONS', class: '', url: '#listLocations' },
                    // { 'id': 4, title: 'POSITIONS', class: '', url: '#listPositions' }
                ];
            }

            var activeLink = _.find(links, function (link) {
                return link.id == activeLinkId;
            });
            activeLink.class = "active";
            adminMenu.links = links;
            return adminMenu;
        };

        /**
         * A function that shows a success message on the UI.
         * @param  {} domSelector part of the UI where the message will be appended.
         * @param  {} message the message that will be displayed.
         */
        utilService.showSuccessMessage = function (domSelector, message) {
            $(domSelector).append($('<div/>', { class: 'myCustomAlerts' }).addClass('alert alert-success').append(message));
            setTimeout(function () {
                $(".myCustomAlerts").fadeTo(4000, 0).slideUp(500, function () {
                    $(this).alert('close');
                });
            }, 1000);
        };

        /**
         * A function that shows an error message on the UI.
         * @param  {} domSelector part of the UI where the message will be appended.
         * @param  {} message the message that will be displayed.
         */
        utilService.showErrorMessage = function (domSelector, message) {
            $(domSelector).append($('<div/>', { class: 'myCustomAlerts' }).addClass('alert alert-danger').append(message));
            setTimeout(function () {
                $(".myCustomAlerts").fadeTo(8000, 0).slideUp(500, function () {
                    $(this).alert('close');
                });
            }, 1000);
        };
        return utilService;
    }])

    .factory('TermStoreService', ['$q', '$log', 'UtilService', function ($q, $log, UtilService) {
        var termStoreService = {};
        const TERM_STORE_NAME = 'Baraza Dev Managed Metadata Service';
        //const TERM_STORE_NAME = 'UAT Baraza Metadata Service';
        //const TERM_STORE_NAME = 'Baraza Metadata Service';
        termStoreService.getTermStore = function (spContext) {
            var deferred = $q.defer();
            var taxSession = SP.Taxonomy.TaxonomySession.getTaxonomySession(spContext);
            //Term Stores
            var termStores = taxSession.get_termStores();
            //Term Store under which to create the term.
            var termStore = termStores.getByName(TERM_STORE_NAME);
            spContext.load(taxSession);
            spContext.load(termStore);
            spContext.executeQueryAsync(function () {
                deferred.resolve(termStore);
            }, function (error) {
                console.log(error);
                deferred.reject('Unable to fetch Term Store \'' + TERM_STORE_NAME + '\'. Please contact system admin');
            });
            return deferred.promise;
        };

        termStoreService.addTerm = function (termName, termSetId) {
            var deferred = $q.defer();
            UtilService.waitForScriptsToLoad().then(function (spContext) {
                termStoreService.getTermStore(spContext).then(function (termStore) {
                    var newGuid = new SP.Guid.newGuid();
                    var termSet = termStore.getTermSet(termSetId);
                    var newTerm = termSet.createTerm(termName, 1033, newGuid.toString());
                    spContext.load(newTerm);
                    spContext.executeQueryAsync(function () {
                        deferred.resolve({ Id: newTerm.get_id().toString(), title: termName });
                    }, function (sender, args) {
                        $log.error('Failed to add ' + termName + ': ' + args.get_message());
                        deferred.reject(args.get_message());
                    });
                });
            });
            return deferred.promise;
        };

        termStoreService.removeTerm = function (termSetId, termId) {
            var deferred = $q.defer();
            UtilService.waitForScriptsToLoad().then(function (spContext) {
                termStoreService.getTermStore(spContext).then(function (termStore) {
                    var termSet = termStore.getTermSet(termSetId);
                    var term = termSet.getTerm(termId);
                    term.deleteObject();
                    spContext.executeQueryAsync(function () {
                        deferred.resolve("Deleted Successully");
                    }, function (sender, args) {
                        $log.error('Failed: ' + args.get_message());
                        deferred.reject(args.get_message());
                    });
                });
            });
            return deferred.promise;
        };

        termStoreService.loadTerms = function (TermSetGuid) {
            var deferred = $q.defer();
            /*
            /* Retrieve Taxonomy terms using JQuery SPServices.
            /* Code borrowed from 
            /* http://sympmarc.com/2013/10/11/spservices-stories-18-retrieve-managed-metadata-using-javascript-and-spservices/
            */
            UtilService.waitForScriptsToLoad().then(function (spContext) {
                termStoreService.getTermStore(spContext).then(function (termStore) {
                    $().SPServices({
                        operation: "GetChildTermsInTermSet",
                        sspId: termStore.get_id().toString(),
                        termSetId: TermSetGuid,
                        lcid: 1033,
                        completefunc: function (xData, Status) {
                            if (Status == "success") {
                                terms = new Array();
                                xmlData = xData;
                                // Fix for different XML parsing in IE and Chrome
                                termsContent = $.parseXML(xmlData.responseText).firstChild.textContent == undefined ?
                                    $.parseXML(xmlData.responseText).text :
                                    $.parseXML(xmlData.responseText).firstChild.textContent;
                                termsXML = $.parseXML(termsContent);
                                $termsXML = $(termsXML);
                                childTerms = $termsXML.find("T");
                                parentTermId = null;

                                for (i = 0; i < childTerms.length; i++) {
                                    var tsTerm = {};
                                    termName = $(childTerms[i]).find("TL");
                                    // Requesting actual term id
                                    tsTerm.ID = $(childTerms[i]).attr("a9");
                                    // Requesting term name
                                    tsTerm.Name = termName.attr("a32");
                                    terms[i] = tsTerm;
                                }
                                deferred.resolve(terms);
                            } else {
                                deferred.reject("Error. Unable to fetch terms");
                            }
                        }
                    });

                }).catch(function (error) {
                    deferred.reject(error);
                });
            });
            return deferred.promise;
        };
        return termStoreService;
    }])

    .factory('ShptRestService', ['$q', '$http', '$log', 'UtilService', function ($q, $http, $log, UtilService) {
        var shptService = {};
        shptService.appWebUrl = decodeURIComponent(UtilService.getQueryStringParameter('SPAppWebUrl')).split('#')[0];
        shptService.hostWebUrl = decodeURIComponent(UtilService.getQueryStringParameter('SPHostUrl')).split('#')[0];

        shptService.getListItemById = function (listTitle, itemId, queryParams) {
            var deferred = $q.defer();
            $http({
                method: 'GET',
                url: shptService.appWebUrl + '/_api/SP.AppContextSite(@target)/web/Lists/getByTitle(\'' + listTitle + '\')/Items(' + itemId + ')?' + queryParams + '&@target=\'' + shptService.hostWebUrl + '\'',
                headers: { Accept: 'application/json;odata=verbose' }
            }).then(function sendResponseData(response) {
                deferred.resolve(response.data.d);
            }).catch(function handleError(response) {
                deferred.reject(response.data.error.message.value);
            });
            return deferred.promise;
        };

        shptService.getListItems = function (listTitle, queryParams) {
            var deferred = $q.defer();
            $http({
                method: 'GET',
                url: shptService.appWebUrl + '/_api/SP.AppContextSite(@target)/web/Lists/getByTitle(\'' + listTitle + '\')/Items?' + queryParams + '&$top=5000&@target=\'' + shptService.hostWebUrl + '\'',
                headers: { Accept: 'application/json;odata=verbose' }
            }).then(function sendResponseData(response) {
                deferred.resolve(response.data.d);
            }).catch(function handleError(response) {
                deferred.reject(response.data.error.message.value);
            });
            return deferred.promise;
        };

        shptService.getGroupMembers = function (groupName, queryParams) {
            var deferred = $q.defer();
            $http({
                method: 'GET',
                url: shptService.appWebUrl + '/_api/SP.AppContextSite(@target)/web/SiteGroups/GetByName(\'' + groupName + '\')/users?' + queryParams + '&$top=5000&@target=\'' + shptService.hostWebUrl + '\'',
                headers: { Accept: 'application/json;odata=verbose' }
            }).then(function sendResponseData(response) {
                deferred.resolve(response.data.d);
            }).catch(function handleError(response) {
                deferred.reject(response.data.error.message.value);
            });
            return deferred.promise;
        };

        /*
        * Concept borrowed from 
        * http://www.c-sharpcorner.com/UploadFile/Vipul.Kelkar/properly-retrieve-single-select-managed-metadata-field-using/
        */
        shptService.getListItemsWithCaml = function (listTitle, queryParams) {
            var deferred = $q.defer();
            shptService.retrieveFormDigest().then(function (formDigestValue) {
                $http({
                    method: 'POST',
                    url: shptService.appWebUrl + '/_api/SP.AppContextSite(@target)/web/Lists/getByTitle(\'' + listTitle + '\')/GetItems(query=@qry)?@qry={\'ViewXml\':\'' + queryParams + '\'}&@target=\'' + shptService.hostWebUrl + '\'',
                    headers: {
                        "Accept": 'application/json;odata=verbose',
                        "Content-Length": 0,
                        "X-RequestDigest": formDigestValue,
                    }
                }).then(function sendResponseData(response) {
                    deferred.resolve(response.data.d);
                }).catch(function handleError(response) {
                    $log.error('http request error: ' + response.data.error.message.value);
                    deferred.reject(response);
                });
            });
            return deferred.promise;
        };

        shptService.getListProperties = function (listTitle, queryParams) {
            var deferred = $q.defer();
            $http({
                method: 'GET',
                url: shptService.appWebUrl + '/_api/SP.AppContextSite(@target)/web/Lists/getByTitle(\'' + listTitle + '\')?' + queryParams + '&@target=\'' + shptService.hostWebUrl + '\'',
                headers: { Accept: 'application/json;odata=verbose' }
            }).then(function sendResponseData(response) {
                deferred.resolve(response.data.d);
            }).catch(function handleError(response) {
                var errMessage = "Error retrieving list properties for " + listTitle + ". "
                    + response.data.error.message.value + "";
                deferred.reject('Error: ' + response.status + '. ' + errMessage);
            });
            return deferred.promise;
        };

        shptService.getListFields = function (listTitle, queryParams) {
            var deferred = $q.defer();
            $http({
                method: 'GET',
                url: shptService.appWebUrl + '/_api/SP.AppContextSite(@target)/web/Lists/getByTitle(\'' + listTitle + '\')/fields?' + queryParams + '&@target=\'' + shptService.hostWebUrl + '\'',
                headers: { 'Accept': 'application/json;odata=verbose' }
            }).then(function sendResponseData(response) {
                deferred.resolve(response.data.d);
            }).catch(function handleError(response) {
                var errMessage = "Error retrieving list fields for " + listTitle + ". "
                    + response.data.error.message.value + "";
                deferred.reject('Error: ' + response.status + '. ' + errMessage);
            });
            return deferred.promise;
        };

        shptService.getListFieldById = function (listTitle, listFieldId) {
            var deferred = $q.defer();
            $http({
                method: 'GET',
                url: shptService.appWebUrl + '/_api/SP.AppContextSite(@target)/web/Lists/getByTitle(\'' + listTitle + '\')/fields(guid\'' + listFieldId + '\')?@target=\'' + shptService.hostWebUrl + '\'',
                headers: { 'Accept': 'application/json;odata=verbose' }
            }).then(function sendResponseData(response) {
                deferred.resolve(response.data.d);
            }).catch(function handleError(response) {
                $log.error(response);
                var errMessage = "Error retrieving list fields for " + listTitle + ". "
                    + response.data.error.message.value + "";
                deferred.reject('Error: ' + response.status + '. ' + errMessage);
            });
            return deferred.promise;
        };

        shptService.getItemTypeForListName = function (listTitle) {
            var deferred = $q.defer();
            shptService.getListProperties(listTitle, '$select=ListItemEntityTypeFullName').then(function (data) {
                deferred.resolve(data.ListItemEntityTypeFullName);
            }).catch(function (response) {
                $log.error(response);
                deferred.reject(response);
            });
            return deferred.promise;
        };

        shptService.retrieveFormDigest = function () {
            var contextInfoUri = shptService.appWebUrl + '/_api/contextinfo?$select=FormDigestValue';
            var deferred = $q.defer();
            $http({
                url: contextInfoUri,
                method: "POST",
                headers: { "Accept": "application/json; odata=verbose" }
            }).then(function (response) {
                formDigestValue = response.data.d.GetContextWebInformation.FormDigestValue;
                deferred.resolve(formDigestValue);
            }).catch(function (response) {
                var errMsg = "Error retrieving the form digest value: "
                    + response.data.error.message.value;
                $log.error(errMsg);
                deferred.reject('Error: ' + response.status + '. ' + errMsg);
            });
            return deferred.promise;
        }

        shptService.retrieveETagValue = function (operationUri) {
            var deferred = $q.defer();
            $http({
                url: operationUri,
                method: "GET",
                headers: { "Accept": "application/json; odata=verbose" }
            }).then(function (response) {
                eTag = response.data.d.__metadata["etag"];
                deferred.resolve(eTag);
            }).catch(function (response) {
                $log.error(response);
                var errMsg = "Error retrieving ETag value: "
                    + response.data.error.message.value;
                $log.error(errMsg);
                deferred.reject('Error: ' + response.status + '. ' + errMsg);
            });
            return deferred.promise;
        };

        shptService.getListItemEntityTypeFullName = function (listName) {
            var deferred = $q.defer();
            shptService.getListProperties(listName, '$select=ListItemEntityTypeFullName').then(function (response) {
                deferred.resolve(response.ListItemEntityTypeFullName);
            });
            return deferred.promise;
        };

        shptService.createNewListItem = function (listTitle, bodyContent) {
            var operationUri, deferred, itemTypeForListName;
            var promises = [];
            promises.push(shptService.retrieveFormDigest());
            promises.push(shptService.getItemTypeForListName(listTitle));
            deferred = $q.defer();
            $q.all(promises).then(function (promiseResults) {
                formDigestValue = promiseResults[0];
                itemTypeForListName = promiseResults[1];
                operationUri = shptService.appWebUrl + "/_api/SP.AppContextSite(@target)/web/Lists/getByTitle('" + listTitle + "')/Items"
                    + '?@target=\'' + shptService.hostWebUrl + '\'';
                bodyContent.__metadata = { 'type': itemTypeForListName };
                $http({
                    url: operationUri,
                    method: "POST",
                    headers: {
                        "Accept": "application/json;odata=verbose",
                        "Content-Type": "application/json;odata=verbose",
                        "Content-Length": bodyContent.length,
                        "X-RequestDigest": formDigestValue
                    },
                    data: JSON.stringify(bodyContent)
                }).then(function (response) {
                    deferred.resolve(response.data.d);
                }).catch(function (response) {
                    var errMessage = "Error adding List Item '"
                        + response.data.error.message.value + "'";
                    $log.error(errMessage)
                    deferred.reject('Error: ' + response.status + '. ' + errMessage);
                });
            });
            return deferred.promise;
        };

        shptService.uploadFileToDocumentLibrary = function (listTitle, folderUrl, file, bodyContent) {
            var operationUri, defFiles, itemTypeForListName;
            defFiles = $q.defer();
            shptService
                .getFileBuffer(file._file)
                .then(function (buffer) {
                    var promises = [];
                    promises.push(shptService.retrieveFormDigest());
                    promises.push(shptService.getItemTypeForListName(listTitle));

                    $q
                        .all(promises)
                        .then(function (promiseResults) {
                            formDigestValue = promiseResults[0];
                            itemTypeForListName = promiseResults[1];
                            operationUri = shptService.appWebUrl + "/_api/SP.AppContextSite(@target)/web/getfolderbyserverrelativeurl('" + listTitle + "/" + folderUrl + "')/files"
                                + "/add(overwrite=false, url='" + file.name + "')?@target='" + shptService.hostWebUrl + "'";
                            $http({
                                url: operationUri,
                                method: "POST",
                                binaryStringRequestBody: true,
                                data: buffer,
                                processData: false,
                                transformRequest: angular.identity,
                                headers: {
                                    "Accept": "application/json;odata=verbose",
                                    "Content-Type": "application/json;odata=verbose",
                                    "Content-Length": file.byteLength,
                                    "X-RequestDigest": formDigestValue
                                }
                            }).then(function (response) {
                                shptService
                                    .getUploadedFile(response.data.d.ListItemAllFields.__deferred.uri)
                                    .then(function (upFile) {
                                        var fileId = upFile.Id;
                                        shptService
                                            .updateUploadedFile(upFile.__metadata, bodyContent)
                                            .then(function (fileRes) {
                                                defFiles.resolve(fileId);
                                            })
                                            .catch(function (res) {
                                                defFiles.reject('Error: Response Status: ' + res.status + '. Erro Message: ' + res.data.error.message.value);
                                            });
                                    })
                                    .catch(function (response) {
                                        defFiles.reject('Error: Response Status: ' + response.status + '. Erro Message: ' + response.data.error.message.value);
                                    });

                            }).catch(function (response) {
                                defFiles.reject('Error: Response Status: ' + response.status + '. Erro Message: ' + response.data.error.message.value);
                            });
                        });
                });
            return defFiles.promise;
        };

        shptService.getFileBuffer = function (file) {
            var deferred = $q.defer();
            var reader = new FileReader();
            reader.onload = function (e) {
                deferred.resolve(e.target.result);
            };
            reader.onerror = function (e) {
                deferred.reject(e.target.error);
            };
            reader.readAsArrayBuffer(file);
            return deferred.promise;
        };

        shptService.getUploadedFile = function (fileListItemUri) {
            var deferFileUpload = $q.defer();
            fileListItemUri = fileListItemUri.replace(shptService.hostWebUrl, '{0}');
            fileListItemUri = fileListItemUri.replace('_api/Web', '_api/sp.appcontextsite(@target)/web');
            var listItemAllFieldsEndpoint = String.format(fileListItemUri + "?@target='{1}'", shptService.appWebUrl, shptService.hostWebUrl);
            $http({
                url: listItemAllFieldsEndpoint,
                method: "GET",
                headers: {
                    "Accept": "application/json;odata=verbose",
                }
            }).then(function (response) {
                deferFileUpload.resolve(response.data.d);
            }).catch(function (response) {
                deferFileUpload.reject('Error: Response Status: ' + response.status + '. Erro Message: ' + response.data.error.message.value);
            });
            return deferFileUpload.promise;
        };

        shptService.updateUploadedFile = function (itemMetadata, bodyContent) {
            var listItemUri = itemMetadata.uri.replace('_api/Web', '_api/sp.appcontextsite(@target)/web');
            var listItemEndpoint = String.format(listItemUri + "?@target='{0}'", shptService.hostWebUrl);
            var deferUpdateFileMetadata = $q.defer();

            var promises = [];
            promises.push(shptService.retrieveFormDigest());
            promises.push(shptService.retrieveETagValue(listItemEndpoint));

            $q
                .all(promises)
                .then(function (promiseResults) {
                    formDigestValue = promiseResults[0];
                    eTag = promiseResults[1];
                    bodyContent.__metadata = {
                        'type': itemMetadata.type
                    };
                    $http({
                        url: listItemEndpoint,
                        method: "POST",
                        headers: {
                            "Accept": "application/json;odata=verbose",
                            "content-type": "application/json;odata=verbose",
                            "content-length": bodyContent.length,
                            "X-RequestDigest": formDigestValue,
                            "X-HTTP-Method": "MERGE",
                            "IF-MATCH": eTag
                        },
                        data: JSON.stringify(bodyContent)
                    }).then(function (response) {
                        deferUpdateFileMetadata.resolve(response);
                    }).catch(function (response) {
                        deferUpdateFileMetadata.reject('Error: Response Status: ' + response.status + '. Erro Message: ' + response.data.error.message.value);
                    });
                });
            return deferUpdateFileMetadata.promise;
        };

        shptService.updateListItem = function (listTitle, itemId, bodyContent) {
            var operationUri, deferred, itemTypeForListName;
            var promises = [];
            deferred = $q.defer();
            operationUri = shptService.appWebUrl +
                "/_api/SP.AppContextSite(@target)/web/lists/GetByTitle('" + listTitle + "')/Items(" +
                itemId + ")" + '?@target=\'' + shptService.hostWebUrl + '\'';
            promises.push(shptService.retrieveFormDigest());
            promises.push(shptService.getItemTypeForListName(listTitle));
            promises.push(shptService.retrieveETagValue(operationUri));

            $q.all(promises).then(function (promiseResults) {
                formDigestValue = promiseResults[0];
                itemTypeForListName = promiseResults[1];
                eTag = promiseResults[2];
                bodyContent.__metadata = { 'type': itemTypeForListName };
                $http({
                    url: operationUri,
                    method: "POST",
                    headers: {
                        "Accept": "application/json;odata=verbose",
                        "content-type": "application/json;odata=verbose",
                        "content-length": bodyContent.length,
                        "X-RequestDigest": formDigestValue,
                        "X-HTTP-Method": "MERGE",
                        "IF-MATCH": eTag
                    },
                    data: JSON.stringify(bodyContent)
                }).then(function (response) {
                    deferred.resolve('Response Status: ' + response.status);
                }).catch(function (response, errorCode, errorMessage) {
                    var errMsg = "Error updating list item: " + response.data.error.message.value;
                    $log.error(errMsg);
                    deferred.reject('Error: ' + response.status + '. ' + errMsg);
                });
            });
            return deferred.promise;
        };

        shptService.deleteListItem = function (listTitle, itemId, bodyContent) {
            var operationUri = shptService.appWebUrl + "/_api/SP.AppContextSite(@target)/web/lists/GetByTitle('" + listTitle + "')/Items(" + itemId + ")" + '?@target=\'' + shptService.hostWebUrl + '\'';;
            var deferred = $q.defer();

            shptService.retrieveFormDigest().then(function (formDigestValue) {
                shptService.retrieveETagValue(operationUri).then(function (eTag) {
                    $http({
                        url: operationUri,
                        method: "POST",
                        headers: {
                            "Accept": "application/json;odata=verbose",
                            "content-type": "application/json;odata=verbose",
                            "X-RequestDigest": formDigestValue,
                            "X-HTTP-Method": "DELETE",
                            "IF-MATCH": eTag
                        }
                    }).then(function (response) {
                        $log.info('Deleted successfully');
                        deferred.resolve(response);
                    }).catch(function (response) {
                        var errMessage = "Error deleting item: '" + response.data.error.message.value + "'";
                        deferred.reject('Error: ' + errMessage);
                    });
                }).catch(function (error) {
                    deferred.reject(error);
                });
            });
            return deferred.promise;
        };

        //shptService.getListItems = function (listTitle, queryParams) {
        //    return $http({
        //        method: 'GET',
        //        url: shptService.appWebUrl + '/_api/SP.AppContextSite(@target)/web/Lists/getByTitle(\'' + listTitle + '\')/Items?' + queryParams + '&$top=5000&@target=\'' + shptService.hostWebUrl + '\'',
        //        headers: { Accept: 'application/json;odata=verbose' }
        //    }).then(function sendResponseData(response) {
        //        return response.data.d;
        //    }).catch(function handleError(response) {
        //        $log.error(response);
        //        return $q.reject(response.data.error.message.value);
        //    });
        //};

        shptService.getUserById = function (id) {
            var user = {};
            var operationUri = shptService.appWebUrl + '/_api/SP.AppContextSite(@target)/web/GetUserById(' + id + ')?$expand=groups&@target=\'' + shptService.hostWebUrl;
            return $http({
                method: 'GET',
                url: operationUri,
                headers: { "Accept": "application/json; odata=verbose" }
            }).then(function sendResponseData(d) {
                user.id = id;
                user.displayName = d.d.title;
                user.name = d.d.LoginName;
                user.email = d.d.Email;
                user.username = d.d.LoginName.split('|')[1];
                user.groups = d.d.Groups.results;
                return user;
            }).catch(function handleError(err) {
                return $q.reject(err.data.error.message.value);
            });
        };

        /**
        * This function adds a user to this site collection if they don't exist
        * @param {string} a logon name of the user in the format 'i:0#.f|membership|kochieng@kwtrp.org' or 'kwtrp\kochieng' 
        * @returns {object} user object
        */
        shptService.ensureUser = function (loginName) {
            var deferred = $q.defer();
            var payload = { 'logonName': loginName };

            shptService.retrieveFormDigest().then(function (formDigestValue) {
                $http({
                    method: 'POST',
                    url: shptService.appWebUrl + '/_api/SP.AppContextSite(@target)/web/ensureuser?@target=\'' + shptService.hostWebUrl + '\'',
                    data: JSON.stringify(payload),
                    headers: {
                        "Accept": "application/json;odata=verbose",
                        "content-type": "application/json;odata=verbose",
                        "X-RequestDigest": formDigestValue
                    }
                }).then(function sendResponseData(response) {
                    deferred.resolve(response.data.d);
                }).catch(function handleError(response) {
                    deferred.resolve(false);
                });
            });
            return deferred.promise;
        }

        /*
        * Get the hidden internal field name for a Multi-value taxonomy field
        * @param {string} listname - The name of the list in which the field resides 
        * @param {string} multivalueTaxonomyfieldName - Multi-value taxonomy field internal name
        * @returns {string} The hidden internal field name for the malti-value taxonomy field 
        */
        shptService.getMultiValueTaxonomyHiddenNoteFieldName = function (listName, multivalueTaxonomyfieldName) {
            var deferred = $q.defer();
            /*
            * To update a multi-value taxonomy field via REST api, check out this link
            * http://www.jrjlee.com/2017/01/getting-or-setting-multi-value-metadata.html
            * http://www.aerieconsulting.com/blog/update-using-rest-to-update-a-multi-value-taxonomy-field-in-sharepoint
            */
            shptService.getListFields(listName, '$select=TextField&$filter=InternalName eq \'' +
                multivalueTaxonomyfieldName + '\'').then(function (response) {
                    var hiddenNoteFieldId = response.results[0].TextField;

                    shptService.getListFieldById(listName, hiddenNoteFieldId).then(function (response) {
                        var hiddenNoteFieldName = response.InternalName;
                        deferred.resolve(hiddenNoteFieldName);
                    }).catch(function (error) {
                        deferred.reject(error);
                    });
                }).catch(function (error) {
                    deferred.reject(error);
                });
            return deferred.promise;
        };

        //To be implemented
        shptService.getTaxonomyPermissions = function (TermName) {
            var deferred = $q.defer();
            var permissions = {};
            permissions.canDelete = true;
            permissions.canEdit = true;
            permissions.canAdd = true;
            deferred.resolve(permissions);
            return deferred.promise;
        };

        shptService.getListUserEffectivePermissions = function (listTitle) {
            var deferred = $q.defer();
            $http({
                method: 'GET',
                url: shptService.appWebUrl + '/_api/SP.AppContextSite(@target)/web/Lists/getByTitle(\'' + listTitle + '\')/EffectiveBasePermissions' + '?@target=\'' + shptService.hostWebUrl + '\'',
                headers: { Accept: 'application/json;odata=verbose' }
            })
                .then(function sendResponseData(response) {
                    var permissions = new SP.BasePermissions();
                    permissions.initPropertiesFromJson(response.data.d.EffectiveBasePermissions);
                    var permLevels = [];

                    for (var permLevelName in SP.PermissionKind.prototype) {
                        if (SP.PermissionKind.hasOwnProperty(permLevelName)) {
                            var permLevel = SP.PermissionKind.parse(permLevelName);
                            if (permissions.has(permLevel)) {
                                permLevels.push(permLevelName);
                            }
                        }
                    }

                    var permissions = {};
                    permissions.canDelete = permLevels.indexOf('deleteListItems') > -1;
                    permissions.canEdit = permLevels.indexOf('editListItems') > -1;
                    permissions.canAdd = permLevels.indexOf('addListItems') > -1;
                    deferred.resolve(permissions);
                }).catch(function handleError(response) {
                    $log.error(response);
                    var errMessage = "Error retrieving list permissions for " + listTitle + ". " +
                        response.data + "";
                    deferred.reject('Error: ' + response.status + '. ' + errMessage);
                });
            return deferred.promise;
        };
        return shptService;
    }]);