(function () {
    'use strict';

    angular
        .module('services.links', [])
        .service('linksSvc', LinksSvc);

    LinksSvc.$inject = ['$q', 'ShptRestService'];
    function LinksSvc($q, ShptRestService) {
        var svc = this;
        var listname = 'SystemLinks';
        svc.userid = _spPageContextInfo.userId;
        var systemLinksList = null;
        svc.hostWebUrl = ShptRestService.hostWebUrl;

        svc.getAllItems = function () {
            var defer = $q.defer();
            var queryParams = "$select=Id,Title,Icon,Url,Target";
            ShptRestService
                .getListItems(listname, queryParams)
                .then(function (data) {
                    systemLinksList = [];
                    _.forEach(data.results, function (o) {
                        var link = {};
                        link.id = o.Id;
                        link.title = o.Title;
                        link.icon = o.Icon;
                        link.url = o.Url;
                        link.target = o.Target;
                        systemLinksList.push(link);
                    });
                    defer.resolve(_.orderBy(systemLinksList, ['title'], ['asc']));
                })
                .catch(function (error) {
                    console.log(error);
                    defer.reject(error);
                });
            return defer.promise;
        };

        svc.AddItem = function (link) {
            var defer = $q.defer();
            var itemExists = _.some(systemLinksList, ['title', link.title]);

            if (itemExists) {
                defer.reject("The item specified already exists in the system. Contact IT Service desk for support.");
            } else {
                var data = {
                    Title: link.title,
                    Icon: link.icon,
                    Url: link.url,
                    Target: link.target
                };

                ShptRestService
                    .createNewListItem(listname, data)
                    .then(function (response) {
                        link.id = response.ID;
                        systemLinksList.push(link);
                        defer.resolve(_.orderBy(systemLinksList, ['title'], ['asc']));
                    })
                    .catch(function (error) {
                        console.log(error);
                        defer.reject("An error occured while adding the item. Contact IT Service desk for support.");
                    });
            }
            return defer.promise;
        };

        svc.UpdateItem = function (link) {
            var deferEdit = $q.defer();
            var itemExists = _.some(systemLinksList, ['id', link.id]);

            if (!itemExists) {
                deferEdit.reject("The item to be edited does not exist. Contact IT Service desk for support.");
            } else {
                var data = {
                    Title: link.title,
                    Icon: link.icon,
                    Url: link.url,
                    Target: link.target
                };

                ShptRestService
                    .updateListItem(listname, link.id, data)
                    .then(function (response) {
                        _.forEach(systemLinksList, function (l) {
                            if (link.id == l.id) {
                                l.title = l.title;
                                l.icon = l.icon;
                                l.url = l.url;
                                l.target = l.target;
                            }
                        });
                        deferEdit.resolve(_.orderBy(systemLinksList, ['title'], ['asc']));
                    })
                    .catch(function (error) {
                        console.log(error);
                        deferEdit.reject("An error occured while adding the item. Contact IT Service desk for support.");
                    });
            }
            return deferEdit.promise;
        };

        svc.DeleteItem = function (id) {
            var defer = $q.defer();
            if (id) {
                ShptRestService
                    .deleteListItem(listname, id)
                    .then(function () {
                        _.remove(systemLinksList, {
                            id: id
                        });
                        defer.resolve(_.orderBy(systemLinksList, ['title'], ['asc']));
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