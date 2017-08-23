'use strict';

angular.module('copayApp.controllers').controller('newApplyContactsController', function($rootScope, $scope, $state, $stateParams, $timeout, $ionicHistory, ongoingProcess, localContactsService, gettextCatalog, addressbookService, popupService, renrenbitUserService) {
    var root = {};
    $scope.isEmptyList = true;
    $scope.isEmptyNewFansList = true;
    $scope.isEmptyFollowsList = true;

    $scope.$on("$ionicView.loaded", function(event, data) {
        console.log("apply loaded");
        renrenbitUserService.initApplyFansList(function(fans){
            if(fans && fans.length>0){
                $scope.fanslist = fans;
                $scope.isEmptyList = false;
                $scope.isEmptyNewFansList = false;
            }
        });

        renrenbitUserService.initApplyFollowsList(function(follows){
            if(follows && follows.length>0){
                $scope.followslist = follows;
                $scope.isEmptyList = false;
                $scope.isEmptyFollowsList = false;
            }
        });
    });
    
    /**
     * 添加申请人为好友
     */
    $scope.agreeAdd = function(fans){
        console.log("fans ----------------------------");
        console.log(fans);
        var user = renrenbitUserService.user;
        var url = "v1/user/follow";
        var params = { uid: user.id, fid: fans.fans_id, uname: user.nick_name, fname: fans.fans_name, remark:"" };
        var response = renrenbitUserService.query(url, params); // 同步调用，获得承诺接口  
        ongoingProcess.set('addingContact', true);
        response.then(function(data) {  // 调用承诺API获取数据 .resolve  
            ongoingProcess.set('addingContact', false);
            console.log(data);  
            var status = data.status;
            if(status==1){
                popupService.showAlert(gettextCatalog.getString('提示'), "关注好友成功");
                
                $timeout(function() {
                    localContactsService.deleteApplyFansId(user.id, fans.fans_id);
                    $scope.fanslist = localContactsService.getAllFans(user.id);
                    if($scope.fanslist.length==0){
                        $scope.isEmptyNewFansList = true;    
                    } 

                    var contacts = localContactsService.getAllContacts(user.id);
                    var contact = {}
                    contact.id = "";
                    contact.follow_each_other = "1";
                    contact.follower_id = fans.fans_id;
                    contact.follower_name = fans.fans_name;
                    contact.headimg = fans.headimg;
                    contact.remark = fans.remark;
                    contact.role = fans.role;
                    contact.sex = fans.sex;
                    contact.telephone = fans.telephone;
                    contact.uid = fans.uid;
                    contact.wallet_address = fans.wallet_address;
                    contacts.push(contact);
                    localContactsService.init(user.id, contacts, function(){});
                    
                    $scope.$apply();
                }, 200);
            } else {
                popupService.showAlert(gettextCatalog.getString('提示'), data.info);    
            }
        }, function(err) {  // 处理错误 .reject  
            ongoingProcess.set('addingContact', false);
            console.log(err);  
            popupService.showAlert(gettextCatalog.getString('Error'), err);
        });  
    }

    return root;
});
