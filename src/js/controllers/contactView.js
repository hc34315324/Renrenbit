'use strict';

angular.module('copayApp.controllers').controller('contactViewController', function($scope, $state, $timeout, $stateParams, lodash, localContactsService, addressbookService, popupService, $ionicHistory, platformInfo, gettextCatalog, renrenbitUserService, ongoingProcess) {
  $scope.isChromeApp = platformInfo.isChromeApp;
  $scope.addressbookEntry = {};
  $scope.addressbookEntry.name = $stateParams.name;
  $scope.addressbookEntry.email = $stateParams.email;
  $scope.addressbookEntry.address = $stateParams.address;
  $scope.addressbookEntry.headimg = $stateParams.headimg;
  $scope.addressbookEntry.fUid = $stateParams.fUid;

  var user = renrenbitUserService.user;
  var lstFindUser = renrenbitUserService.lstFindUser;
  if(lstFindUser.id==undefined){
    lstFindUser.id = $scope.addressbookEntry.fUid;
    lstFindUser.nick_name = $scope.addressbookEntry.name;
    lstFindUser.headimg = $scope.addressbookEntry.headimg;
    lstFindUser.wallet_address = $scope.addressbookEntry.address;
  }

  $scope.sendTo = function() {
    $state.go('tabs.contacts.amount', {
      toAddress: $scope.addressbookEntry.address,
      toName: $scope.addressbookEntry.name,
      toEmail: $scope.addressbookEntry.email,
      from: "tabs-contacts"
    });
    // $ionicHistory.removeBackView();
    // $state.go('tabs.send');
    // $timeout(function() {
    //   $state.transitionTo('tabs.contacts.amount', {
    //     toAddress: $scope.addressbookEntry.address,
    //     toName: $scope.addressbookEntry.name,
    //     toEmail: $scope.addressbookEntry.email
    //   });
    // }, 100);
  };

  $scope.remove = function(addr) {
    var title = gettextCatalog.getString('Warning!');
    var message = gettextCatalog.getString('Are you sure you want to delete this contact?');
    popupService.showConfirm(title, message, null, null, function(res) {
      if (!res) return;
      addressbookService.remove(addr, function(err, ab) {
        if (err) {
          popupService.showAlert(gettextCatalog.getString('Error'), err);
          return;
        }
        $ionicHistory.goBack();
      });
    }); 
  };

  $scope.add = function(addr) {
    var url = "v1/user/follow";
    var params = { uid: user.id, fid: lstFindUser.id, uname: user.nick_name, fname: lstFindUser.nick_name, remark:"" };
    var response = renrenbitUserService.query(url, params); // 同步调用，获得承诺接口  
    ongoingProcess.set('addingContact', true);
    response.then(function(data) {  // 调用承诺API获取数据 .resolve  
        ongoingProcess.set('addingContact', false);
        console.log(data);  
        var status = data.status;
        if(status==1){
          popupService.showAlert(gettextCatalog.getString('提示'), "关注好友成功");
          $scope.isAddContact = true;
          
          var contacts = localContactsService.getAllContacts(user.id);
          var contact = {}
          contact.id = "";
          contact.follow_each_other = "0";
          contact.follower_id = lstFindUser.id;
          contact.follower_name = lstFindUser.nick_name;
          contact.headimg = lstFindUser.headimg;
          contact.remark = lstFindUser.nick_name;
          contact.role = lstFindUser.role;
          contact.sex = lstFindUser.sex;
          contact.telephone = lstFindUser.telephone;
          contact.uid = user.id;
          contact.wallet_address = lstFindUser.wallet_address;
          contacts.push(contact);
          localContactsService.init(user.id, contacts, function(){});

          $timeout(function() {
            $scope.$apply();
          });
        } else {
          popupService.showAlert(gettextCatalog.getString('提示'), "该地址不是站内用户，请返回选择添加至站外地址簿");    
        }
    }, function(err) {  // 处理错误 .reject  
        ongoingProcess.set('addingContact', false);
        console.log(err);  
        popupService.showAlert(gettextCatalog.getString('Error'), err);
    });  
  };

  $scope.remove = function(addr) {
    var title = gettextCatalog.getString('Warning!');
    var message = gettextCatalog.getString('Are you sure you want to delete this contact?');
    popupService.showConfirm(title, message, null, null, function(res) {
      if (!res) return;
      var url = "v1/user/unfollow";
      var params = { uid: user.id, fid: lstFindUser.id };
      var response = renrenbitUserService.query(url, params); // 同步调用，获得承诺接口  
      ongoingProcess.set('removingContact', true);
      response.then(function(data) {  // 调用承诺API获取数据 .resolve  
          ongoingProcess.set('removingContact', false);
          console.log(data);  
          var status = data.status;
          if(status==1){
            popupService.showAlert(gettextCatalog.getString('提示'), "删除好友成功");
            $scope.isAddContact = false;
            
            localContactsService.deleteContactId(user.id, lstFindUser.id);

            $timeout(function() {
              $scope.$apply();
            })
          } else {
            popupService.showAlert(gettextCatalog.getString('提示'), "该地址不是站内用户，请返回选择添加至站外地址簿");    
          }
      }, function(err) {  // 处理错误 .reject  
          ongoingProcess.set('removingContact', false);
          console.log(err);  
          popupService.showAlert(gettextCatalog.getString('Error'), err);
      });  
    }); 
  };
  
  $scope.contactWithHim = function(){
      console.log("contact click");
      $state.go('messageDetailFromContacts', {
          "fUid":lstFindUser.id,
          "fUname":lstFindUser.nick_name,
          "fUhead":lstFindUser.headimg
      });
  };

  $scope.$on("$ionicView.beforeEnter", function(){  
    console.log($scope.addressbookEntry.address);   
      if($scope.addressbookEntry.address){
          $scope.hasAddress = true;
      }else{
          $scope.hasAddress = false;
      }
  });

  $scope.$on("$ionicView.afterEnter", function() {
      var url = "v1/user/isfollowed";
      var params = { uid: user.id, fid: lstFindUser.id };
      var response = renrenbitUserService.query(url, params); // 同步调用，获得承诺接口  
      ongoingProcess.set('addingContact', true);
      response.then(function(data) {  // 调用承诺API获取数据 .resolve  
        ongoingProcess.set('addingContact', false);
        console.log(data);  
        var status = data.status;
        if(status==1){
          var isfollowed = data.isfollow;
          if(isfollowed==true){
            $scope.isAddContact = true;
            $timeout(function() {
              $scope.$apply();
            })
          }else{
            $scope.isAddContact = false;
            $timeout(function() {
              $scope.$apply();
            })
          }
        } else {
          popupService.showAlert(gettextCatalog.getString('提示'), "获取用户关注记录错误");    
        }
    }, function(err) {  // 处理错误 .reject  
        ongoingProcess.set('addingContact', false);
        console.log(err);  
        popupService.showAlert(gettextCatalog.getString('Error'), err);
    });  
  });

});
