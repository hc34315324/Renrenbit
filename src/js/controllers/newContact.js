'use strict';

angular.module('copayApp.controllers').controller('newContactController', function($scope, $state, $stateParams, $timeout, $ionicHistory, gettextCatalog, addressbookService, popupService, renrenbitUserService) {

  $scope.fromTag = $stateParams.fromTag;
  console.log($scope.fromTag);
  // $scope.addressbookEntry = {
  //   'address': $stateParams.addressbookEntry || '',
  //   'name': '',
  //   'email': ''
  // };
  
  $scope.onQrCodeScannedConnects = function(data) {
    $timeout(function() {
      data = data.replace('bitcoin:', '');
      // popupService.showAlert(gettextCatalog.getString('Debug'), "scan:" + data);
      // var res = renrenbitUserService.getUserByAddress(data);
      // popupService.showAlert(gettextCatalog.getString('Debug'), "res:" + res);
      // if(res!=false){
      //   var userid = res.id;
      //   popupService.showAlert(gettextCatalog.getString('Notice'), "uid:" + userid);
      // }else{
      //   popupService.showAlert(gettextCatalog.getString('Error'), "该地址不是站内用户，请返回选择添加至站外地址簿");
      // }
      var url = "v1/user/viewbyaddress";
      var params = { address: data };
      var response = renrenbitUserService.query(url, params); // 同步调用，获得承诺接口  
      response.then(function(data) {  // 调用承诺API获取数据 .resolve  
          console.log(data);  
          var status = data.status;
          if(status==1){
            //  tabs.addressbook.view({address:addrEntry.address, email: addrEntry.email, name: addrEntry.name})
            var user = data.user;
            renrenbitUserService.lstFindUser = user;
            $scope.isAddContact = false;
            if($scope.fromTag == 'message'){    //判断路由来路以便返回
              $state.go('tabs.contactViewFromMessage', {
                address:user.wallet_address, email: "test@test.com", name: user.nick_name
              });
            } else {    
              $state.go('tabs.contactView', {
                address:user.wallet_address, email: "test@test.com", name: user.nick_name
              });
            }
          } else {
            popupService.showAlert(gettextCatalog.getString('提示'), "该地址不是站内用户，请返回选择添加至站外地址簿");    
          }
      }, function(err) {  // 处理错误 .reject  
          console.log(err);  
          popupService.showAlert(gettextCatalog.getString('Error'), err);
      });    

      $scope.$digest();
    }, 100);
  };

  $scope.onClickTest = function(){
    console.log("scan");
    // var qrCode = "1MkGvLS7o8B667xMCuekBJM6hk1ErkJLUg";  //外部地址
    var qrCode = "1H2GYNyUSUtLNWyYCq8ZuEHTETyccHnHCd";  //内部
    var url = "v1/user/viewbyaddress";
    var params = { address: qrCode };
    var response = renrenbitUserService.query(url, params); // 同步调用，获得承诺接口  
    response.then(function(data) {  // 调用承诺API获取数据 .resolve  
        console.log(data);  
        var status = data.status;
        if(status==1){
          //  tabs.addressbook.view({address:addrEntry.address, email: addrEntry.email, name: addrEntry.name})
          var user = data.user;
          renrenbitUserService.lstFindUser = user;
          $scope.isAddContact = false;
          if($scope.fromTag == 'message'){    //判断路由来路以便返回
            $state.go('tabs.contactViewFromMessage', {
              address:user.wallet_address, email: "test@test.com", name: user.nick_name
            });
          } else {    
            $state.go('tabs.contactView', {
              address:user.wallet_address, email: "test@test.com", name: user.nick_name
            });
          }
        } else {
          popupService.showAlert(gettextCatalog.getString('提示'), "该地址不是站内用户，请返回选择添加至站外地址簿");    
        }
    }, function(err) {  // 处理错误 .reject  
        console.log(err);  
        popupService.showAlert(gettextCatalog.getString('Error'), err);
    });  
    
  };

  $scope.onItemClick = function(fdUserEntry){
    renrenbitUserService.lstFindUser = fdUserEntry;
    if($scope.fromTag == 'message'){    //判断路由来路以便返回
      $state.go('tabs.contactViewFromMessage', {
        address:fdUserEntry.wallet_address, email: "test@test.com", name: fdUserEntry.nick_name
      });
    } else {    
      $state.go('tabs.contactView', {
        address:fdUserEntry.wallet_address, email: "test@test.com", name: fdUserEntry.nick_name
      });
    }
  };

  $scope.findUsers = function(search) {
    console.log(search); 
    if (!search || search.length < 2) {
      return;
    }
    
    var url = "v1/user/searchusers";
    var params = { key: search };
    var response = renrenbitUserService.query(url, params); // 同步调用，获得承诺接口  
    response.then(function(data) {  // 调用承诺API获取数据 .resolve  
        console.log(data);  
        var status = data.status;
        if(status==1){
          //  tabs.addressbook.view({address:addrEntry.address, email: addrEntry.email, name: addrEntry.name})
          $scope.fdUserArray = data.users;
          $timeout(function() {
            $scope.$apply();
          }, 10);
        } else {
          popupService.showAlert(gettextCatalog.getString('提示'), "查询错误");    
        }
    }, function(err) {  // 处理错误 .reject  
        console.log(err);  
        popupService.showAlert(gettextCatalog.getString('Error'), err);
    });  
    
  };

  // $scope.goHome = function() {
  //   $ionicHistory.removeBackView();
  //   $state.go('tabs.home');
  // };

});
