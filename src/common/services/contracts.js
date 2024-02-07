(function () {
    'use strict';

    angular
        .module('services.contracts', [])
        .service('contractsSvc', ContractsSvc);

    ContractsSvc.$inject = ['$q', 'ShptRestService', 'contractSuppliersSvc', 'contractDocumentsSvc', 'contractRenewalsSvc', 'departmentsSvc'];
    function ContractsSvc($q, ShptRestService, contractSuppliersSvc, contractDocumentsSvc, contractRenewalsSvc, departmentsSvc) {
        var svc = this;
        var listname = 'Contracts';
        var curUserId = _spPageContextInfo.userId;
        svc.hostWebUrl = ShptRestService.appWebUrl;
        var contractsList = null;

        svc.getAllItems = function () {
            var defer = $q.defer();
            var queryParams = "$select=Id,Title,StartDate,EndDate,Value,ContractStatus,Department/Id,Department/Title,CostCenter/Id,CostCenter/Title,CostCenter/Code,Comments,ProcDocsLink," +
                "Currency/Id,Currency/Title,Currency/Abbr,ContractManagers/Id,ContractManagers/Title,ContractManagers/Name,ContractTerminationNoticePeriod,ContractType,ExtentionMonths,ExtentionsPossible,ExtentionValue," +
                "ExtensionEndDate,ShowExtensionEndDate&$expand=Department,CostCenter,ContractManagers,Currency";
            ShptRestService
                .getListItems(listname, queryParams)
                .then(function (data) {
                    contractsList = [];
                    //var supplierProms = [];
                    //var documentsProms = [];
                    //var renewalProms = [];
                    //var checkManagerProms = [];
                    _.forEach(data.results, function (o) {
                        var contract = {};
                        contract.id = o.Id;
                        contract.title = o.Title;
                        contract.startdate = new Date(o.StartDate);
                        contract.enddate = new Date(o.EndDate);
                        contract.value = o.Value;
                        contract.status = o.ContractStatus;
                        contract.type = o.ContractType;
                        contract.department = _.isNil(o.Department) ? "" : { id: o.Department.Id, title: o.Department.Title };
                        contract.costcenter = _.isNil(o.CostCenter) ? "" : { id: o.CostCenter.Id, title: o.CostCenter.Title, code: o.CostCenter.Code };
                        contract.currency = _.isNil(o.Currency) ? "" : { id: o.Currency.Id, title: o.Currency.Title, abbr: o.Currency.Abbr };
                        contract.comments = o.Comments;
                        contract.procdocslink = o.ProcDocsLink;
                        contract.noticeperiod = o.ContractTerminationNoticePeriod;
                        contract.extentionmonths = o.ExtentionMonths;
                        contract.extentionspossible = o.ExtentionsPossible;
                        contract.extentionvalue = o.ExtentionValue;
                        contract.curusermanager = false;
                        contract.extensionenddate = new Date(o.ExtensionEndDate);
                        contract.showextensionenddate = o.ShowExtensionEndDate;
                        contract.managers = [];
                        contract.managersview = [];
                        contract.suppliers = [];
                        contract.documents = [];
                        contract.renewals = [];
                        //if (o.ContractManagers.hasOwnProperty(results)) {
                        _.forEach(o.ContractManagers.results, function (manager) {
                            contract.managers.push({ id: manager.Id, title: manager.Title, Login: manager.Name });
                        });
                        contract.managersview = contract.managers;
                        contract.managersedited = false;
                        contract.curusereditor = _.some(contract.managers, ['id', curUserId]);;
                        //}
                        //supplierProms.push(contractSuppliersSvc.getAllItems(o.Id));
                        //documentsProms.push(contractDocumentsSvc.getAllItems(o.Id));
                        //renewalProms.push(contractRenewalsSvc.getAllItems(o.Id));
                        //checkManagerProms.push(departmentsSvc.currentUserManager(o.Department.Id));
                        contractsList.push(contract);
                    });

                    defer.resolve(_.orderBy(contractsList, ['id'], ['desc']));

                    //$q
                    //    .all(supplierProms)
                    //    .then(function (supplierRes) {
                    //        for (var i = 0; i < supplierRes.length; i++) {
                    //            contractsList[i].suppliers = supplierRes[i];
                    //        }
                    //        $q
                    //            .all(checkManagerProms)
                    //            .then(function (checkMngRes) {
                    //                for (var z = 0; z < checkMngRes.length; z++) {
                    //                    contractsList[z].curusermanager = checkMngRes[z];
                    //                }
                    //                defer.resolve(_.orderBy(contractsList, ['startdate'], ['desc']));
                    //            })
                    //            .catch(function (error) {
                    //                defer.reject(error);
                    //            });
                    //        //$q
                    //        //    .all(documentsProms)
                    //        //    .then(function (docsRes) {
                    //        //        for (var j = 0; j < docsRes.length; j++) {
                    //        //            contractsList[j].documents = docsRes[j];
                    //        //        }
                    //        //        $q
                    //        //            .all(renewalProms)
                    //        //            .then(function (renRes) {
                    //        //                for (var x = 0; x < renRes.length; x++) {
                    //        //                    contractsList[x].renewals = renRes[x];
                    //        //                }

                    //        //            })
                    //        //            .catch(function (error) {
                    //        //                defer.reject(error);
                    //        //            });
                    //        //    })
                    //        //    .catch(function (error) {
                    //        //        defer.reject(error);
                    //        //    });

                    //    })
                    //    .catch(function (error) {
                    //        defer.reject(error);
                    //    });
                })
                .catch(function (error) {
                    defer.reject("An error occured while getting the items.");
                    defer.reject(error);
                });
            return defer.promise;
        };

        svc.checkIfContractExists = (contractTitle, deptId, startDate, endDate) => {
            startDate.setUTCHours(0, 0, 0, 0);
            endDate.setUTCHours(0, 0, 0, 0);

            var deferCheck = $q.defer();
            var queryParamsCheck = "$select=Id,Title,StartDate,EndDate,Department/Id&$expand=Department&$filter=Title eq '" + contractTitle + "' and Department/Id eq " +
                deptId + " and StartDate eq '" + startDate.toISOString() + "' and EndDate eq '" + endDate.toISOString() + "'";
            ShptRestService
                .getListItems(listname, queryParamsCheck)
                .then(function (checkResp) {
                    deferCheck.resolve(checkResp.length > 0);
                })
                .catch(function (error) {
                    deferCheck.reject(error);
                    console.log(error);
                });
            return deferCheck.promise;
        };

        svc.getContractsSearched = function (deptid, status) {
            var deferContract = $q.defer();
            svc
                .getAllItems()
                .then(function (contracts) {
                    if (!deptid && !status) {
                        deferContract.resolve(contracts);
                    }
                    else if (!deptid && status) {
                        deferContract.resolve(_.filter(contracts, function (c) {
                            return c.status == status;
                        }));
                    } else if (deptid && !status) {
                        deferContract.resolve(_.filter(contracts, function (c) {
                            return c.department.id == deptid;
                        }));
                    } else if (deptid && status) {
                        deferContract.resolve(_.filter(contracts, function (c) {
                            return c.status == status && c.department.id == deptid;
                        }));
                    }
                })
                .catch(function (error) {
                    deferContract.reject(error);
                    console.log(error);
                });
            return deferContract.promise;
        };

        svc.getContractById = function (contrId) {
            var idDefer = $q.defer();
            if (contrId) {
                var qryParams = "$select=Id,Title,StartDate,EndDate,Value,ContractStatus,Department/Id,Department/Title,CostCenter/Id,CostCenter/Title,CostCenter/Code,Comments,ProcDocsLink," +
                    "Currency/Id,Currency/Title,Currency/Abbr,ContractManagers/Id,ContractManagers/Title,ContractManagers/Name,ContractTerminationNoticePeriod,ContractType,ExtentionMonths,ExtentionsPossible,ExtentionValue," +
                    "ExtensionEndDate,ShowExtensionEndDate&$expand=Department,CostCenter,ContractManagers,Currency";

                var contrById = {};
                ShptRestService
                    .getListItemById(listname, contrId, qryParams)
                    .then(function (cont) {
                        //var contrByIdProms = [];
                        contrById.id = cont.Id;
                        contrById.title = cont.Title;
                        contrById.startdate = new Date(cont.StartDate);
                        contrById.enddate = new Date(cont.EndDate);
                        contrById.value = cont.Value;
                        contrById.status = cont.ContractStatus;
                        contrById.type = cont.ContractType;
                        contrById.department = _.isNil(cont.Department) ? "" : { id: cont.Department.Id, title: cont.Department.Title };
                        contrById.costcenter = _.isNil(cont.CostCenter) ? "" : { id: cont.CostCenter.Id, title: cont.CostCenter.Title, code: cont.CostCenter.Code };
                        contrById.currency = _.isNil(cont.Currency) ? "" : { id: cont.Currency.Id, title: cont.Currency.Title, abbr: cont.Currency.Abbr };
                        contrById.comments = cont.Comments;
                        contrById.procdocslink = cont.ProcDocsLink;
                        contrById.noticeperiod = cont.ContractTerminationNoticePeriod;
                        contrById.extentionmonths = cont.ExtentionMonths;
                        contrById.extentionspossible = cont.ExtentionsPossible;
                        contrById.extentionvalue = cont.ExtentionValue;
                        contrById.curusermanager = false;
                        contrById.extensionenddate = new Date(cont.ExtensionEndDate);
                        contrById.showextensionenddate = cont.ShowExtensionEndDate;
                        contrById.managers = [];
                        contrById.managersview = [];
                        contrById.suppliers = [];
                        contrById.documents = [];
                        contrById.renewals = [];
                        //if (cont.ContractManagers.hasOwnProperty(results)) {
                        _.forEach(cont.ContractManagers.results, function (manager) {
                            contrById.managers.push({ id: manager.Id, title: manager.Title, Login: manager.Name });
                        });
                        contrById.managersview = contrById.managers;
                        contrById.managersedited = false;
                        contrById.curusereditor = _.some(contrById.managers, ['id', curUserId]);
                        idDefer.resolve(contrById);
                        //}
                        //contrByIdProms.push(contractSuppliersSvc.getAllItems(contrId));
                        //contrByIdProms.push(contractDocumentsSvc.getAllItems(contrId));
                        //contrByIdProms.push(contractRenewalsSvc.getAllItems(contrId));
                        //contrByIdProms.push(departmentsSvc.currentUserManager(contrById.department.id));

                        //$q
                        //    .all(contrByIdProms)
                        //    .then(function (contrByIdRes) {
                        //        contrById.suppliers = contrByIdRes[0];
                        //        contrById.documents = contrByIdRes[1];
                        //        contrById.renewals = contrByIdRes[2];
                        //        contrById.curusermanager = contrByIdRes[3];
                        //        idDefer.resolve(contrById);
                        //    })
                        //    .catch(function (error) {
                        //        idDefer.reject(error);
                        //    });
                    })
                    .catch(function (error) {
                        idDefer.reject(error);
                    });

            } else {
                idDefer.reject("Contract is not defined. Contact the system administrator.");
            }
            return idDefer.promise;
        };

        svc.getRenewals = function (contractid) {
            var deferRenewals = $q.defer();
            var queryParams = "$select=Id,Title,Code";
            ShptRestService
                .getListItems("ContractRenewals", queryParams)
                .then(function (data) {
                    costcentersList = [];
                    _.forEach(data.results, function (o) {
                        var costcenter = {};
                        costcenter.id = o.Id;
                        costcenter.title = o.Title;
                        costcenter.code = o.Code;
                        costcentersList.push(costcenter);
                    });
                    deferRenewals.resolve(_.orderBy(costcentersList, ['code'], ['asc']));
                })
                .catch(function (error) {
                    deferRenewals.reject(error);
                });
            return deferRenewals.promise;
        };

        svc.addContract = function (contract) {
            var addContractdefer = $q.defer();
            var personids = [];
            _.forEach(contract.managers, function (value, key) {
                personids.push(ShptRestService.ensureUser(value.Login));
            });

            $q
                .all(personids)
                .then(function (data) {
                    var idstosave = [];
                    _.forEach(data, function (dt) {
                        idstosave.push(dt.Id);
                    });

                    var data = {
                        Title: contract.title,
                        StartDate: contract.startdate,
                        EndDate: contract.enddate,
                        Value: contract.value,
                        ContractStatus: contract.status,
                        ContractType: contract.type,
                        DepartmentId: contract.department.id,
                        CostCenterId: contract.costcenter.id,
                        CurrencyId: contract.currency.id,
                        Comments: contract.comments,
                        ProcDocsLink: contract.procdocslink,
                        ContractTerminationNoticePeriod: contract.noticeperiod,
                        ExtentionMonths: contract.extentionmonths,
                        ExtentionsPossible: contract.extentionspossible,
                        ExtentionValue: contract.extentionvalue,
                        ExtensionEndDate: contract.enddate,
                        ContractManagersId: { "results": idstosave }
                    };

                    ShptRestService
                        .createNewListItem(listname, data)
                        .then(function (response) {
                            var additionalAddProms = [];
                            additionalAddProms.push(contractSuppliersSvc.AddItem(contract.suppliers, response.ID));
                            additionalAddProms.push(contractDocumentsSvc.AddItem(contract.documents, response.ID));
                            $q
                                .all(additionalAddProms)
                                .then(function (addRes) {
                                    addContractdefer.resolve(true);
                                })
                                .catch(function (error) {
                                    console.log(error);
                                    addContractdefer.reject("An error occured while adding the item. Contact IT Service desk for support.");
                                });
                        })
                        .catch(function (error) {
                            console.log(error);
                            addContractdefer.reject("An error occured while adding the item. Contact IT Service desk for support.");
                        });

                })
                .catch(function (error) {
                    addContractdefer.reject("An error occured while getting the User Ids. Contact IT Service desk for support.");
                    console.log(error);
                });
            return addContractdefer.promise;
        };

        svc.updateContract = function (contract) {
            var updateContractdefer = $q.defer();
            if (contract.id) {
                var personids = [];
                _.forEach(contract.managers, function (value, key) {
                    personids.push(ShptRestService.ensureUser(value.Login));
                });

                $q
                    .all(personids)
                    .then(function (data) {
                        var idstosave = [];
                        _.forEach(data, function (dt) {
                            idstosave.push(dt.Id);
                        });

                        if (contract.managersview.length > 0) {
                            _.forEach(contract.managersview, function (mn) {
                                if (!_.includes(idstosave, mn.id)) {
                                    idstosave.push(mn.id);
                                }
                            });
                        }

                        //var personExists = _.intersection(personids, idstosave);
                        //if (personExists.length > 0) {
                        //    updateContractdefer.reject("Some managers already. Contact IT Service desk for support.");
                        //}

                        var data = {
                            Title: contract.title,
                            StartDate: contract.startdate,
                            EndDate: contract.enddate,
                            Value: contract.value,
                            ContractStatus: contract.status,
                            ContractType: contract.type,
                            DepartmentId: contract.department.id,
                            CostCenterId: contract.costcenter.id,
                            CurrencyId: contract.currency.id,
                            Comments: contract.comments,
                            ProcDocsLink: contract.procdocslink,
                            ContractTerminationNoticePeriod: contract.noticeperiod,
                            ExtentionMonths: contract.extentionmonths,
                            ExtentionsPossible: contract.extentionspossible,
                            ExtentionValue: contract.extentionvalue,
                            ExtensionEndDate: contract.enddate,
                            ContractManagersId: { "results": idstosave }
                        };

                        ShptRestService
                            .updateListItem(listname, contract.id, data)
                            .then(function (response) {
                                updateContractdefer.resolve(true);
                            })
                            .catch(function (error) {
                                console.log(error);
                                updateContractdefer.reject("An error occured while adding the item. Contact IT Service desk for support.");
                            });

                    })
                    .catch(function (error) {
                        updateContractdefer.reject("An error occured while getting the User Ids. Contact IT Service desk for support.");
                        console.log(error);
                    });
            }
            return updateContractdefer.promise;
        };

        svc.removeContractManager = function (managerId, contractId) {
            var defManager = $q.defer();
            var qParams = "$select=Id,Title,ContractManagers/Id,ContractManagers/Title,ContractManagers/Name&$expand=ContractManagers";
            ShptRestService
                .getListItemById("Contracts", contractId, qParams)
                .then(function (resp) {
                    var ids = [];
                    _.forEach(resp.ContractManagers.results, function (rsp) {
                        ids.push(rsp.Id);
                    });
                    _.remove(ids, function (id) {
                        return id == managerId;
                    });
                    var datas = {
                        ContractManagersId: { "results": ids }
                    };

                    ShptRestService
                        .updateListItem(listname, contractId, datas)
                        .then(function (res) {
                            defManager.resolve(true);
                        })
                        .catch(function (error) {
                            console.log(error);
                            defManager.reject("An error occured while removing the manager. Contact IT Service desk for support.");
                        });
                })
                .catch(function (error) {
                    console.log(error);
                    defManager.reject("An error occured while removing the manager. Contact IT Service desk for support.");
                });
            return defManager.promise;
        };

        svc.DeleteItem = function (contractid) {
            var deferDelete = $q.defer();
            if (contractid) {
                var delProms = [];
                //Get Delete contract documents
                delProms.push(contractDocumentsSvc.getAllItems(contractid));

                //Get Delete contract renewals
                delProms.push(contractRenewalsSvc.getAllItems(contractid));

                //Get Delete contract suppliers
                delProms.push(contractSuppliersSvc.getAllItems(contractid));

                $q
                    .all(delProms)
                    .then(function (contractData) {
                        delProms = [];
                        _.forEach(contractData[0], function (cd) {
                            delProms.push(contractDocumentsSvc.DeleteItem(cd.id, contractid));
                        });

                        _.forEach(contractData[1], function (cr) {
                            delProms.push(contractRenewalsSvc.DeleteItem(cr.id, contractid));
                        });

                        _.forEach(contractData[2], function (cs) {
                            delProms.push(contractSuppliersSvc.DeleteItem(cs.id, contractid));
                        });
                        delProms.push(ShptRestService.deleteListItem(listname, contractid));

                        $q
                            .all(delProms)
                            .then(function (rt) {
                                deferDelete.resolve(true);
                            })
                            .catch(function (error) {
                                console.log(error);
                                deferDelete.reject("An error occured while deleting the item. Contact IT Service desk for support.");
                            });
                    })
                    .catch(function (error) {
                        console.log(error);
                        deferDelete.reject("An error occured!. Contact IT Service desk for support.");
                    });
            } else {
                deferDelete.reject('Item to be deleted is missing Id. Contact IT Service desk for support.');
            }
            return deferDelete.promise;
        };
    }
})();