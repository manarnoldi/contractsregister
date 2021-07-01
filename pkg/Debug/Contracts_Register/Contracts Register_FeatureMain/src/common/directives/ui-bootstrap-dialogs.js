angular.module('ui.bootstrap.dialogs', ['ui.bootstrap'])

.factory('$dialogConfirm', function ($uibModal) {

    return function (message, title) {

        var modal = $uibModal.open({
            size: 'sm',
            template: '<div class="modal-header">\
                            <h4 class="modal-title" ng-bind="title"></h4>\
                        </div>\
                        <div class="modal-body" ng-bind="message"></div>\
                        <div class="modal-footer">\
                            <button class="btn btn-success" ng-click="modal.close()">Yes</button>\
                            <button class="btn btn-warning" ng-click="modal.dismiss()">No</button>\
                        </div>',
            controller: function ($scope, $uibModalInstance) {
          
                 $scope.modal = $uibModalInstance;
          
                if (angular.isObject(message)) {
                    angular.extend($scope, message);
                } else {
                    $scope.message = message;
                    $scope.title = angular.isUndefined(title) ? 'Message' : title;
                }
            }
        });

        return modal.result;
    }
})

.factory('$dialogAlert', function ($uibModal) {

    return function (message, title) {

        var modal = $uibModal.open({
            size: 'sm',
            template: '<div class="modal-header">\
                        <h4 class="modal-title" ng-bind="title"></h4></div>\
                        <div class="modal-body" ng-bind="message"></div>\
                        <div class="modal-footer">\
                            <button class="btn btn-success" ng-click="modal.close()">OK</button>\
                        </div>',
            controller: function ($scope, $uibModalInstance) {
                $scope.modal = $uibModalInstance;
                if (angular.isObject(message)) {
                    angular.extend($scope, message);
                } else {
                    $scope.message = message;
                    $scope.title = angular.isUndefined(title) ? 'Message' : title;
                }
            }
        });

        return modal.result;
    }
})
 
.factory('$dialog', function ($uibModal) {
    return function (templateUrl, size, dataWrapper) {
      
      size = size || 'md';
      
      var modal = $uibModal.open({
        size: size,
        templateUrl: templateUrl, // loads the template
        backdrop: 'static', // setting backdrop allows us to close the modal window on clicking outside the modal window
        windowClass: 'modal-fit', // windowClass - additional CSS class(es) to be added to a modal window template
        controller: function ($scope, $injector, $uibModalInstance, $log, data) {
            
            if (!angular.equals(data, {})) {

                $scope[data.scopeVariableName] = data.dataObject;

            }

            $scope.submit = function (frm, data) {

              if (frm.$valid) {
                
                $uibModalInstance.close(data); // dismiss(reason) - a method that can be used to dismiss a modal, passing a reason
                
              }
                
            }

            $scope.cancel = function () {
                $uibModalInstance.dismiss('cancel'); 
            };

        },
        resolve: { 
            data: function () {
                return dataWrapper || {};
            }
        }
    });//end of modal.open
    
    return modal.result;
    
  } 

  
})
