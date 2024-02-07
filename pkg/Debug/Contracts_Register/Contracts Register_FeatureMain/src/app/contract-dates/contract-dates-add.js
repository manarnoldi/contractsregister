(function () {
    'use strict';

    angular
        .module('contractsAdd', [])
        .controller('contractsAddCtrl', ContractsCtrlFunction);

    ContractsCtrlFunction.$inject = ['$q', '$route', '$routeParams', '$dialogConfirm', '$dialogAlert', '$location', 'contractSuppliersSvc', 'contractDocumentsSvc',
        'contractsSvc', 'currenciesSvc', 'departmentsSvc', 'costCentersSvc', 'docTypesSvc', 'settingsSvc', 'contractRenewalsSvc', 'spinnerService', 'growl'];
    function ContractsCtrlFunction($q, $route, $routeParams, $dialogConfirm, $dialogAlert, $location, contractSuppliersSvc, contractDocumentsSvc,
        contractsSvc, currenciesSvc, departmentsSvc, costCentersSvc, docTypesSvc, settingsSvc, contractRenewalsSvc, spinnerService, growl) {
        var ctrl = this;
        ctrl.submitClicked = false;
        spinnerService.show('spinner1');
        ctrl.hostWebUrl = contractsSvc.hostWebUrl;
        ctrl.contract = {};

        ctrl.showsupplierdetails = true;
        ctrl.showcontractvalue = true;

        ctrl.showsuppliercontactname = false;
        ctrl.showsupplierphysicaladdress = false;
        ctrl.showsupplieremailandphone = false;


        ctrl.isAdmin = false;

        ctrl.confidential = false;

        ctrl.contract.suppliers = [];
        ctrl.contract.documents = [];
        ctrl.action = $route.current.$$route.param;
        ctrl.teamid = $routeParams.teamid;
        ctrl.status = $routeParams.status;

        var promises = [];
        promises.push(departmentsSvc.getAllItems());
        promises.push(costCentersSvc.getAllItems());
        promises.push(docTypesSvc.getAllItems());
        promises.push(currenciesSvc.getAllItems());
        promises.push(settingsSvc.getSettings());
        promises.push(settingsSvc.checkIfCurrentUserIsAdmin());

        if ($routeParams.id) {
            promises.push(contractsSvc.getContractById($routeParams.id));
            promises.push(contractSuppliersSvc.getAllItems($routeParams.id));
            promises.push(contractDocumentsSvc.getAllItems($routeParams.id));
            promises.push(contractRenewalsSvc.getAllItems($routeParams.id));
        }

        $q
            .all(promises)
            .then(function (results) {
                ctrl.departments = results[0];
                ctrl.costcenters = results[1];
                ctrl.documenttypes = results[2];
                ctrl.currencies = results[3];
                ctrl.settings = results[4];
                ctrl.isAdmin = results[5];

                ctrl.showsupplierdetails = (_.find(ctrl.settings, ['code', 'SR004'])).value == "Yes";
                ctrl.showcontractvalue = (_.find(ctrl.settings, ['code', 'SR005'])).value == "Yes";
                ctrl.showsuppliercontactnameconf = (_.find(ctrl.settings, ['code', 'SR006'])).value == "Yes";;
                ctrl.showsupplierphysicaladdressconf = (_.find(ctrl.settings, ['code', 'SR007'])).value == "Yes";;
                ctrl.showsupplieremailandphoneconf = (_.find(ctrl.settings, ['code', 'SR008'])).value == "Yes";;

                ctrl.statuses = ["Active", "Expired"]
                ctrl.types = ["Contract", "Framework Agreement", "Property Lease"];
                if ($routeParams.id) {
                    ctrl.contract = results[6];
                    ctrl.contract.suppliers = results[7];
                    ctrl.contract.documents = results[8];
                    ctrl.contract.renewals = results[9];
                    ctrl.contract.curusermanager = _.some(_.find(ctrl.departments, ['id', ctrl.contract.department.id]).managers, ['Id', _spPageContextInfo.userId]);
                } else {
                    ctrl.contract.status = "Active";
                    ctrl.contract.type = "Contract";
                }
            })
            .catch(function (error) {
                growl.error(error);
            })
            .finally(function () {
                spinnerService.closeAll();
            });

        ctrl.addSupplier = function () {
            if (!ctrl.suppliername) {
                $dialogAlert("Kindly provide the supplier name.", "Missing Details");
                return;
            } else if (!ctrl.suppliercontact) {
                $dialogAlert("Kindly provide the supplier contact.", "Missing Details");
                return;
            } else if (!ctrl.supplieraddress) {
                $dialogAlert("Kindly provide the supplier physical address.", "Missing Details");
                return;
            } else if (!ctrl.supplieremailphone) {
                $dialogAlert("Kindly provide the supplier email and phone details.", "Missing Details");
                return;
            } else if (!ctrl.salesforceid) {
                $dialogAlert("Kindly provide the supplier salesforce Id details.", "Missing Details");
                return;
            }

            if (ctrl.salesforceid.substr(0, 3).toLocaleLowerCase() != "per" && ctrl.salesforceid.substr(0, 3).toLocaleLowerCase() != "org") {
                $dialogAlert("Wrong saleforce id provided. Salesforce is in the following format: 'ORG­­­­xxxxxxx'. Where the supplier is an individual consultant, the format may be 'PERxxxxxxx'", "Missing Details");
                return;
            }

            var itemExists = _.some(ctrl.contract.suppliers, function (o) {
                return o.title == ctrl.suppliername && o.contacts == ctrl.suppliercontact;
            });

            if (itemExists) {
                $dialogAlert("The Supplier already exists.", "Missing Details");
                return;
            }
            var supplier = {};
            supplier.title = ctrl.suppliername;
            supplier.contacts = ctrl.suppliercontact;
            supplier.address = ctrl.supplieraddress;
            supplier.emailphone = ctrl.supplieremailphone;
            supplier.website = ctrl.website;
            supplier.salesforceid = ctrl.salesforceid;
            supplier.confidential = ctrl.confidential;

            if (ctrl.action == "add") {
                ctrl.contract.suppliers.push(supplier);
                ctrl.suppliername = "";
                ctrl.suppliercontact = "";
                ctrl.supplieraddress = "";
                ctrl.supplieremailphone = "";
                ctrl.website = "";
                ctrl.salesforceid = "";
                ctrl.confidential = false;
            } else {
                var supps = [];
                supps.push(supplier);
                $dialogConfirm('Add Supplier to the Contract?', 'Confirm Transaction')
                    .then(function () {
                        spinnerService.show('spinner1');
                        contractSuppliersSvc
                            .AddItem(supps, ctrl.contract.id)
                            .then(function (res) {
                                contractsSvc
                                    .getContractById($routeParams.id)
                                    .then(function (response) {
                                        ctrl.contract = response;
                                        ctrl.suppliername = "";
                                        ctrl.suppliercontact = "";
                                        ctrl.supplieraddress = "";
                                        ctrl.supplieremailphone = "";
                                        ctrl.website = "";
                                        ctrl.salesforceid = "";
                                        ctrl.confidential = false;
                                        growl.success('Supplier added to the contract successfully!');
                                    })
                                    .catch(function (error) {
                                        growl.error(error);
                                    });
                            })
                            .catch(function (error) {
                                growl.error(error);
                            })
                            .finally(function () {
                                spinnerService.closeAll();
                            });
                    });
            }
            spinnerService.closeAll();
        };

        ctrl.RemoveSupplier = function (supplier) {
            $dialogConfirm('Remove Supplier?', 'Confirm Transaction')
                .then(function () {
                    spinnerService.show('spinner1');
                    if (ctrl.action == "add") {
                        _.remove(ctrl.contract.suppliers, {
                            title: supplier.title
                        });
                    } else {
                        contractSuppliersSvc
                            .DeleteItem(supplier.id, ctrl.contract.id)
                            .then(function (supps) {
                                growl.success('Supplier removed from the contract successfully!');
                                ctrl.contract.suppliers = supps;
                            })
                            .catch(function (error) {
                                growl.error(error);
                            })
                            .finally(function () {
                                spinnerService.closeAll();
                            });
                    }
                    spinnerService.closeAll();
                });
        };

        ctrl.addDocument = function () {
            if (!ctrl.doctype) {
                $dialogAlert("Kindly provide the document type.", "Missing Details");
                return;
            } else if (!ctrl.docdetails) {
                $dialogAlert("Kindly provide the document details.", "Missing Details");
                return;
            } else if (!ctrl.docattachment) {
                $dialogAlert("Kindly attach the document you want to upload.", "Missing Details");
                return;
            }

            var itemExists = _.some(ctrl.contract.documents, function (o) {
                return o.type == ctrl.doctype && o.details == ctrl.docdetails;
            });

            if (itemExists) {
                $dialogAlert("The document already exists.", "Missing Details");
                return;
            }

            var doc = {};
            doc.type = ctrl.doctype;
            doc.details = ctrl.docdetails;
            doc.attachment = ctrl.docattachment;
            doc.confidential = ctrl.confidential;

            if (ctrl.action == "add") {
                ctrl.contract.documents.push(doc);
                ctrl.doctype = "";
                ctrl.docdetails = "";
                ctrl.docattachment = "";
            } else {
                var docs = [];
                docs.push(doc);
                $dialogConfirm('Add document to the Contract?', 'Confirm Transaction')
                    .then(function () {
                        spinnerService.show('spinner1');
                        contractDocumentsSvc
                            .AddItem(docs, ctrl.contract.id)
                            .then(function (res) {
                                contractsSvc
                                    .getContractById($routeParams.id)
                                    .then(function (response) {
                                        ctrl.contract = response;
                                        ctrl.doctype = "";
                                        ctrl.docdetails = "";
                                        ctrl.docattachment = "";
                                        growl.success('Document added to the contract successfully!');
                                    })
                                    .catch(function (error) {
                                        growl.error(error);
                                    });
                            })
                            .catch(function (error) {
                                growl.error(error);
                            })
                            .finally(function () {
                                spinnerService.closeAll();
                            });
                    });
            }
            spinnerService.closeAll();
        };

        ctrl.RemoveDocument = function (doc) {
            $dialogConfirm('Remove Document?', 'Confirm Transaction')
                .then(function () {
                    spinnerService.show('spinner1');
                    if (ctrl.action == "add") {
                        _.remove(ctrl.contract.documents, {
                            attachment: doc.attachment
                        });
                    } else {
                        contractDocumentsSvc
                            .DeleteItem(doc.id, ctrl.contract.id)
                            .then(function (docs) {
                                ctrl.contract.documents = docs;
                                growl.success('Document removed from the contract successfully!');
                            })
                            .catch(function (error) {
                                growl.error(error);
                            })
                            .finally(function () {
                                spinnerService.closeAll();
                            });
                    }
                    spinnerService.closeAll();
                });
        };

        ctrl.addContract = function () {
            if (!ctrl.contract.title) {
                $dialogAlert("Kindly provide the contract title.", "Missing Details");
                return;
            } else if (!ctrl.contract.status) {
                $dialogAlert("Kindly provide the contract status.", "Missing Details");
                return;
            } else if (!ctrl.contract.department) {
                $dialogAlert("Kindly provide the global or country team.", "Missing Details");
                return;
            } else if (!ctrl.contract.currency) {
                $dialogAlert("Kindly provide the currency.", "Missing Details");
                return;
            } else if (!ctrl.contract.value) {
                $dialogAlert("Kindly provide the contract value.", "Missing Details");
                return;
            } else if (!ctrl.contract.costcenter) {
                $dialogAlert("Kindly provide the cost center details.", "Missing Details");
                return;
            } else if (!ctrl.contract.noticeperiod) {
                $dialogAlert("Kindly provide the contract notice period.", "Missing Details");
                return;
            } else if (!ctrl.contract.startdate) {
                $dialogAlert("Kindly provide the contract start date.", "Missing Details");
                return;
            } else if (!ctrl.contract.enddate) {
                $dialogAlert("Kindly provide the contract end date.", "Missing Details");
                return;
            } else if (ctrl.contract.managers.length <= 0) {
                $dialogAlert("Kindly provide the contract manager/s.", "Missing Details");
                return;
            }

            if ((_.find(ctrl.settings, ['code', 'SR001'])).value == "No" && ctrl.contract.suppliers.length <= 0) {
                $dialogAlert("Kindly enter supplier details.", "Missing Details");
                return;
            }

            if ((_.find(ctrl.settings, ['code', 'SR002'])).value == "No" && ctrl.contract.documents.length <= 0) {
                $dialogAlert("Kindly choose a file to attach in the CONTRACT DOCUMENTS section and click Add Attachments.", "Missing Details");
                return;
            }

            if ((_.find(ctrl.settings, ['code', 'SR003'])).value == "No" && !ctrl.contract.procdocslink) {
                $dialogAlert("Kindly provide the link to the procurement file/s on a SharePoint team site.", "Missing Details");
                return;
            }

            var missingDocs = checkRequiredDocumentTypes("New", ctrl.contract.type);
            if (missingDocs.length > 0) {
                $dialogAlert("Kindly ensure you attach document type/s: [" + missingDocs.join() + "] on the contract documents section before adding the contract.", "Missing Details");
                return;
            }

            contractsSvc
                .checkIfContractExists(ctrl.contract.title, ctrl.contract.department.id, ctrl.contract.startdate, ctrl.contract.enddate)
                .then(function (itemExists) {
                    if (itemExists) {
                        $dialogAlert("The contract specified already exists in the system.", "Contact IT Service desk for support");
                        return;
                    } else {
                        $dialogConfirm('Add Contract?', 'Confirm Transaction')
                            .then(function () {
                                ctrl.submitClicked = true;
                                spinnerService.show('spinner1');
                                contractsSvc
                                    .addContract(ctrl.contract)
                                    .then(function (res) {
                                        growl.success('Record added successfully!');
                                        $location.path("/dashboard");
                                    })
                                    .catch(function (error) {
                                        growl.error(error);
                                    })
                                    .finally(function () {
                                        ctrl.submitClicked = false;
                                        spinnerService.closeAll();
                                    });
                            });
                    }
                })
                .catch(function (error) {
                    addContractdefer.reject("An error occured while checking if contract exists. Contact IT Service desk for support.");
                    console.log(error);
                });
        };

        ctrl.addRenewal = function () {
            if (!ctrl.renewal.startdate) {
                $dialogAlert("Kindly provide the extension start date.", "Missing Details");
                return;
            } else if (!ctrl.renewal.enddate) {
                $dialogAlert("Kindly provide the extension end date.", "Missing Details");
                return;
            } else if (!ctrl.renewal.value) {
                $dialogAlert("Kindly provide the extension contract value.", "Missing Details");
                return;
            } else if (!ctrl.renewal.currency) {
                $dialogAlert("Kindly provide the extension currency.", "Missing Details");
                return;
            }

            var missingDocs = checkRequiredDocumentTypes("Extension", ctrl.contract.type);
            if (missingDocs.length > 0) {
                $dialogAlert("Kindly ensure you attach document type/s: [" + missingDocs.join() + "] on the contract documents section before adding the contract extension.", "Missing Details");
                return;
            }

            $dialogConfirm('Add Contract extension?', 'Confirm Transaction')
                .then(function () {
                    spinnerService.show('spinner1');
                    contractRenewalsSvc
                        .AddItem(ctrl.renewal, ctrl.contract)
                        .then(function (rens) {
                            ctrl.contract.renewals = rens;
                            growl.success('Contract extension added successfully!');
                            ctrl.renewal.startdate = "";
                            ctrl.renewal.enddate = "";
                            ctrl.renewal.value = "";
                            ctrl.renewal.currency = "";
                        })
                        .catch(function (error) {
                            growl.error(error);
                        })
                        .finally(function () {
                            spinnerService.closeAll();
                        });
                });
        };

        ctrl.RemoveRenewal = function (ren) {
            $dialogConfirm('Remove extension?', 'Confirm Transaction')
                .then(function () {
                    spinnerService.show('spinner1');
                    contractRenewalsSvc
                        .DeleteItem(ren.id, ctrl.contract)
                        .then(function (rens) {
                            ctrl.contract.renewals = rens;
                            growl.success('Extension removed from the contract successfully!');
                        })
                        .catch(function (error) {
                            growl.error(error);
                        })
                        .finally(function () {
                            spinnerService.closeAll();
                        });
                });
        };

        ctrl.updateContract = function () {
            if (!ctrl.contract.title) {
                $dialogAlert("Kindly provide the contract title.", "Missing Details");
                return;
            } else if (!ctrl.contract.status) {
                $dialogAlert("Kindly provide the contract status.", "Missing Details");
                return;
            } else if (!ctrl.contract.department) {
                $dialogAlert("Kindly provide the global or country team.", "Missing Details");
                return;
            } else if (!ctrl.contract.currency) {
                $dialogAlert("Kindly provide the currency.", "Missing Details");
                return;
                ctrl.contract.value
            } else if (!ctrl.contract.value) {
                $dialogAlert("Kindly provide the contract value.", "Missing Details");
                return;
            } else if (!ctrl.contract.costcenter) {
                $dialogAlert("Kindly provide the cost center details.", "Missing Details");
                return;
            } else if (!ctrl.contract.noticeperiod) {
                $dialogAlert("Kindly provide the contract notice period.", "Missing Details");
                return;
            } else if (!ctrl.contract.startdate) {
                $dialogAlert("Kindly provide the contract start date.", "Missing Details");
                return;
            } else if (!ctrl.contract.enddate) {
                $dialogAlert("Kindly provide the contract end date.", "Missing Details");
                return;
            } else if (ctrl.contract.managers.length <= 0) {
                $dialogAlert("Kindly provide the contract manager/s.", "Missing Details");
                return;
            }

            //if ((_.find(ctrl.settings, ['code', 'SR001'])).value == "No" && ctrl.contract.suppliers.length <= 0) {
            //    $dialogAlert("Kindly enter supplier details.", "Missing Details");
            //    return;
            //}

            //if ((_.find(ctrl.settings, ['code', 'SR002'])).value == "No" && ctrl.contract.documents.length <= 0) {
            //    $dialogAlert("Kindly choose a file to attach in the CONTRACT DOCUMENTS section and click Add Attachments.", "Missing Details");
            //    return;
            //}

            //if ((_.find(ctrl.settings, ['code', 'SR003'])).value == "No" && !ctrl.contract.procdocslink) {
            //    $dialogAlert("Kindly provide the link to the procurement file/s on a SharePoint team site.", "Missing Details");
            //    return;
            //}

            var missingDocs = checkRequiredDocumentTypes("New", ctrl.contract.type);
            if (missingDocs.length > 0) {
                $dialogAlert("Kindly ensure you attach document type/s: [" + missingDocs.join() + "] on the contract documents section before updating the contract details.", "Missing Details");
                return;
            }

            contractsSvc
                .checkIfContractExists(ctrl.contract.title, ctrl.contract.department.id, ctrl.contract.startdate, ctrl.contract.enddate)
                .then(function (itemExists) {
                    if (itemExists) {
                        $dialogAlert("The contract specified details already exists in the system.", "Contact IT Service desk for support");
                        return;
                    } else {
                        $dialogConfirm('Update contract main details?', 'Confirm Transaction')
                            .then(function () {
                                spinnerService.show('spinner1');

                                contractsSvc
                                    .updateContract(ctrl.contract)
                                    .then(function (res) {
                                        contractsSvc
                                            .getContractById($routeParams.id)
                                            .then(function (response) {
                                                ctrl.contract = response;
                                                growl.success('Contract main details updated added successfully!');
                                                $location.path("/dashboard");
                                            })
                                            .catch(function (error) {
                                                growl.error(error);
                                            });

                                    })
                                    .catch(function (error) {
                                        growl.error(error);
                                    })
                                    .finally(function () {
                                        spinnerService.closeAll();
                                    });
                            });
                    }
                })
                .catch(function (error) {
                    addContractdefer.reject("An error occured while checking if contract exists. Contact IT Service desk for support.");
                    console.log(error);
                });            
        };

        ctrl.removeContractManager = function (managerId) {
            $dialogConfirm('Remove contract manager?', 'Confirm Transaction')
                .then(function () {
                    spinnerService.show('spinner1');
                    contractsSvc
                        .removeContractManager(managerId, ctrl.contract.id)
                        .then(function () {
                            _.remove(ctrl.contract.managersview, function (m) {
                                return m.id == managerId;
                            });
                            growl.success('Contract manager removed successfully!');
                        })
                        .catch(function (error) {
                            growl.error(error);
                        })
                        .finally(function () {
                            spinnerService.closeAll();
                        });
                });
        };

        ctrl.deleteContract = id => {
            $dialogConfirm('Are you sure you want to delete the whole contract? This will delete the contract, any contract renewals available, all contract suppliers defined and any contract documents uploaded.', 'Confirm Transaction')
                .then(function () {
                    spinnerService.show('spinner1');
                    contractsSvc
                        .DeleteItem(id)
                        .then(function (res) {
                            growl.success("Contract record deleted successfully!");
                            $location.path("/dashboard");
                        })
                        .catch(function (error) {
                            growl.error(error);
                        })
                        .finally(function () {
                            spinnerService.closeAll();
                        })
                });
        };

        function checkRequiredDocumentTypes(step, agreementtype) {
            var missingDocs = [];
            _.forEach(ctrl.documenttypes, function (dcts) {
                if (dcts.required && _.includes(dcts.step, step) && _.includes(dcts.agreementtype, agreementtype)) {
                    var exists = false;
                    _.forEach(ctrl.contract.documents, function (dcs) {
                        if (dcs.type.id == dcts.id) {
                            exists = true;
                        }
                    });
                    if (!exists) {
                        missingDocs.push(dcts.title);
                    }
                }
            });
            return missingDocs;
        }
    }
})();