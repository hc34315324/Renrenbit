'use strict';

angular.module('copayApp.controllers').controller('tabsController', function($rootScope, $log, $scope, $state, $stateParams, $timeout, incomingData, lodash, popupService, gettextCatalog, localContactsService, messageService, renrenbitUserService) {

  $scope.onScan = function(data) {
    if (!incomingData.redir(data)) {
      popupService.showAlert(gettextCatalog.getString('Error'), gettextCatalog.getString('Invalid data'));
    }
  };

  $scope.setScanFn = function(scanFn) {
    $scope.scan = function() {
      $log.debug('Scanning...');
      scanFn();
    };
  };

  $scope.importInit = function() {
    $scope.fromOnboarding = $stateParams.fromOnboarding;
    $timeout(function() {
      $scope.$apply();
    }, 1);
  };

  $scope.$on("$ionicView.beforeEnter", function(event, data) {
      $rootScope.hideTabs = '';
  });

  /**
   * 来消息通知时的
   */
  $scope.$on("messagesChange", function(err, msgs) {
      console.log("tabs msg change " + msgs);
      var uid = renrenbitUserService.user.id;
      messageService.setTotalUnReadMsgCount(uid, 1);
      $timeout(function() {
          $scope.msgCounts = messageService.getTotalUnReadMsgCount(uid); 
          console.log($scope.msgCounts);
          $scope.messages = msgs;
          $scope.$apply();
      });
  });

  $scope.$on("newContacts", function(err, msg) {
      console.log("newContacts apply >> " + msg);
      var uid = renrenbitUserService.user.id;
      localContactsService.setNewFansApplyCount(uid, 1);
        
      $timeout(function() {
          $scope.newContacts = localContactsService.getNewFansApplyCount(uid);
          console.log($scope.newContacts);
          $scope.$apply();
      }, 20);
  });

  $scope.$on("initMessageNotice", function(err, msg) {
      console.log("initMessageCount init >> " + msg);
      var uid = renrenbitUserService.user.id;
      $timeout(function() {
          $scope.msgCounts = messageService.getTotalUnReadMsgCount(uid); 
          console.log($scope.msgCounts);
          $scope.$apply();
      }, 20);
  });

  $scope.$on("initContactsNotice", function(err, msg) {
      console.log("newContacts init >> " + msg);
      var uid = renrenbitUserService.user.id;
        
      $timeout(function() {
          $scope.newContacts = localContactsService.getNewFansApplyCount(uid);
          console.log($scope.newContacts);
          $scope.$apply();
      }, 20);
  });

});
