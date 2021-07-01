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
                "Currency/Id,Currency/Title,Currency/Abbr,ContractManagers/Id,ContractManagers/Title,ContractManagers/Name,ContractTerminationNoticePeriod,ContractType,ExtentionMonths,ExtentionsPossible,ExtentionValue" +
                "&$expand=Department,CostCenter,ContractManagers,Currency";
            ShptRestService
                .getListItems(listname, queryParams)
                .then(function (data) {
                    contractsList = [];
                    var supplierProms = [];
                    var documentsProms = [];
                    var renewalProms = [];
                    var checkManagerProms = [];
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
                        supplierProms.push(contractSuppliersSvc.getAllItems(o.Id));
                        documentsProms.push(contractDocumentsSvc.getAllItems(o.Id));
                        renewalProms.push(contractRenewalsSvc.getAllItems(o.Id));
                        checkManagerProms.push(departmentsSvc.currentUserManager(o.Department.Id));
                        contractsList.push(contract);
                    });

                    $q
                        .all(supplierProms)
                        .then(function (supplierRes) {
                            for (var i = 0; i < supplierRes.length; i++) {
                                contractsList[i].suppliers = supplierRes[i];
                            }
                            $q
                                .all(documentsProms)
                                .then(function (docsRes) {
                                    for (var j = 0; j < docsRes.length; j++) {
                                        contractsList[j].documents = docsRes[j];
                                    }
                                    $q
                                        .all(renewalProms)
                                        .then(function (renRes) {
                                            for (var x = 0; x < renRes.length; x++) {
                                                contractsList[x].renewals = renRes[x];
                                            }
                                            $q
                                                .all(checkManagerProms)
                                                .then(function (checkMngRes) {
                                                    for (var z = 0; z < checkMngRes.length; z++) {
                                                        contractsList[z].curusermanager = checkMngRes[z];
                                                    }
                                                    defer.resolve(_.orderBy(contractsList, ['startdate'], ['desc']));
                                                })
                                                .catch(function (error) {
                                                    defer.reject(error);
                                                });
                                        })
                                        .catch(function (error) {
                                            defer.reject(error);
                                        });
                                })
                                .catch(function (error) {
                                    defer.reject(error);
                                });
                        })
                        .catch(function (error) {
                            defer.reject(error);
                        });
                })
                .catch(function (error) {
                    defer.reject("An error occured while getting the items.");
                    defer.reject(error);
                });
            return defer.promise;
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

        svc.getContractById = function (id) {
            var idDefer = $q.defer();
            if (id) {
                svc
                    .getAllItems()
                    .then(function (conts) {
                        idDefer.resolve(_.find(conts, function (c) {
                            return c.id == id;
                        }));
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
            svc
                .getAllItems()
                .then(function (currentcontracts) {
                    var itemExists = _.some(currentcontracts, function (c) {
                        return c.title == contract.title && contract.department.id == c.department.id && contract.startdate == c.startdate && contract.enddate == c.enddate;
                    });

                    if (itemExists) {
                        defer.reject("The item specified already exists in the system. Contact IT Service desk for support.");
                    } else {
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
                    }
                })
                .catch(function (error) {
                    addContractdefer.reject("An error occured while adding the item. Contact IT Service desk for support.");
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
    }
})();