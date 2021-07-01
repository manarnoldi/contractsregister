(function () {
    'use strict';

    angular
        .module('services.departments', [])
        .service('departmentsSvc', DepartmentsSvc);

    DepartmentsSvc.$inject = ['$q', 'ShptRestService'];
    function DepartmentsSvc($q, ShptRestService) {
        var svc = this;
        var listname = 'Department';
        var curUserId = _spPageContextInfo.userId;
        var departmentsList = null;
        svc.hostWebUrl = ShptRestService.hostWebUrl;

        svc.getAllItems = function (deptid) {
            var defer = $q.defer();
            var queryParams = "";
            if (deptid) {
                queryParams = "$select=Id,Title,Managers/Id,Managers/Title,OrderBy&$expand=Managers&$filter=Id eq " + parseInt(deptid);
            } else {                
                queryParams = "$select=Id,Title,Managers/Id,Managers/Title,OrderBy&$expand=Managers";
            }

            ShptRestService
                .getListItems(listname, queryParams)
                .then(function (data) {
                    departmentsList = [];
                    _.forEach(data.results, function (o) {
                        var dept = {};
                        dept.id = o.Id;
                        dept.title = o.Title;                       
                        dept.managers = [];
                        _.forEach(o.Managers.results, function (m) {
                            dept.managers.push({ id: m.Id, title: m.Title });
                        });
                        dept.orderby = o.OrderBy;
                        departmentsList.push(dept);
                    });
                    defer.resolve(_.orderBy(departmentsList, ['orderby'], ['asc']));
                })
                .catch(function (error) {
                    defer.reject(error);
                });
            return defer.promise;
        };

        svc.currentUserManager = function (deptid) {
            var deferUserMng = $q.defer();
            if (deptid) {
                svc
                    .getAllItems(deptid)
                    .then(function (dept) {
                        deferUserMng.resolve(_.some(dept[0].managers, ['id', parseInt(curUserId)]));
                    })
                    .catch(function (error) {
                        deferUserMng.reject(error);
                    });
            }
            return deferUserMng.promise;
        };

        svc.AddItem = function (dept) {
            var defer = $q.defer();
            var itemExists = _.some(departmentsList, ['title', dept.title]);

            if (itemExists) {
                defer.reject("The item specified already exists in the system. Contact IT Service desk for support.");
            } else {

                var data = {
                    Title: dept.title
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

        svc.UpdateItem = function (dept) {
            var deferEdit = $q.defer();
            svc
                .getAllItems()
                .then(function (response) {
                    var itemExists = _.some(response, function (o) {
                        return o.id == dept.id;
                    });

                    if (!itemExists) {
                        deferEdit.reject("The item to be edited does not exist. Contact IT Service desk for support.");
                    } else {
                        var data = {
                            Title: dept.title
                        };

                        ShptRestService
                            .updateListItem(listname, dept.id, data)
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
                        _.remove(departmentsList, {
                            id: id
                        });
                        defer.resolve(_.orderBy(departmentsList, ['title'], ['asc']));
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