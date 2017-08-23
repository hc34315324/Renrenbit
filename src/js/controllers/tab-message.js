'use strict';

angular.module('copayApp.controllers').controller('messageController', function($rootScope, $scope, $log, $state, $ionicPopup, $timeout, lodash, popupService, localIMStorageService, messageService, startupService, profileService, walletService, bwcError, platformInfo, renrenbitUserService, imConnectService, sqliteService) {    
    var wallet;
    var flag = 0;
    $scope.isCordova = platformInfo.isCordova;
    $scope.isAndroid = platformInfo.isAndroid;
    $scope.isNW = platformInfo.isNW;
    // console.log(platformInfo);

    // $scope.onSwipeLeft = function() {
    //     $state.go("tabs.message");
    // };
    
    $scope.popupMessageOpthins = function(message) {
        $scope.popup.index = $scope.messages.indexOf(message);
        $scope.popup.optionsPopup = $ionicPopup.show({
            templateUrl: "views/popup.html",
            scope: $scope,
        });
        $scope.popup.isPopup = true;
    };

    $scope.markMessage = function() {
        var index = $scope.popup.index;
        var message = $scope.messages[index];
        if (message.showHints) {
            message.showHints = false;
            message.noReadMessages = 0;
        } else {
            message.showHints = true;
            message.noReadMessages = 1;
        }
        $scope.popup.optionsPopup.close();
        $scope.popup.isPopup = false;
        messageService.updateMessage(message);
    };

    $scope.deleteMessage = function() {
        var index = $scope.popup.index;
        var message = $scope.messages[index];
        $scope.messages.splice(index, 1);
        $scope.popup.optionsPopup.close();
        $scope.popup.isPopup = false;

        if ('cordova' in window) {
            sqliteService.deleteOneLstMsgs(message.uid);
            sqliteService.dropTBByUid(message.uid);
        }
        messageService.deleteMessageId(message.id);
        messageService.clearMessage(message);
        
    };

    $scope.topMessage = function() {
        var index = $scope.popup.index;
        var message = $scope.messages[index];
        if (message.isTop) {
            message.isTop = 0;
        } else {
            message.isTop = new Date().getTime();
        }
        $scope.popup.optionsPopup.close();
        $scope.popup.isPopup = false;
        messageService.updateMessage(message);
    };

    $scope.messageDetails = function(message) {
        if ('cordova' in window) {
            $state.go("messageDetail-db", {
                "fUid": message.uid,
                "fUname": message.fName,
                "fUhead": message.fHead,
                "noReads": message.noReadMessages
            });
        }else{
            $state.go("messageDetail", {
                "messageId": message.id
            });
        }
    };

    /**
     * ionic View组建生命周期 -- 表示进入页面前，做一些初始化工作
     */
    $scope.$on("$ionicView.beforeEnter", function(){            
        // console.log($scope.messages);
        console.log("message before");
        $scope.messages = messageService.getAllMessages();
        $scope.popup = {
            isPopup: false,
            index: 0
        };
    
    });

    /**
     * 来消息通知时的
     */
    $scope.$on("messagesChange", function(err, msgs) {
        updateMsgList(msgs);     
    });

    $scope.$on("$ionicView.afterEnter", function() {
        startupService.ready();
    });

    $scope.$on("$ionicView.enter", function(event, data) {
        console.log("msg enter");
        flag+=1;    //用于约束个人信息和好友信息，不用没次都请求
        updateAllWallets();
        noticeNewMessages("refresh");
        if(flag>1){
            sqliteService.findAllLstMsgs(function(err, data){
                console.log(JSON.stringify(data));
                messageService.init(data);
                var messages = messageService.getAllMessages();
                updateMsgList(messages);
            });    
        }
    });

    // 更新消息列表
    var updateMsgList = function(msgs){
        console.log("home message change >> " + msgs);
        var uid = renrenbitUserService.user.id;
        console.log("uid>> " + uid);  
        $timeout(function() {
            $scope.messages = msgs;
            $scope.$apply();
        }, 20);
    }

    // 广播联系人页面通知
    var noticeNewContacts = function(msg){
        $timeout(function() {
            $rootScope.$broadcast("initContactsNotice", msg);
        }, 200);
    }

    // 广播获取提示未读信息数量
    var noticeNewMessages = function(msg){
        $timeout(function() {
            $rootScope.$broadcast("initMessageNotice", msg);
        }, 200);
    }

    // 消息变动广播tab_message改变
    var messagesChange = function(msgs){
        $rootScope.$broadcast("messagesChange", msgs);
    }

    /**更新同步本地钱包信息 */
    var updateAllWallets = function() {
      //获取钱包列表
      $scope.wallets = profileService.getWallets();
      if (lodash.isEmpty($scope.wallets)) return;
      //暂时为单钱包所以直接取第一个钱包
    //   console.log($scope.wallets[0]);
      if(flag<=1){  // 钱包每次都同步,用户信息只请求一次            
        renrenbitUserService.getUserByWid($scope.wallets[0].id, function(err, bd){
            if(err!=""){
                console.log(err);         
            }else{
                name = bd.nick_name;
                // connect();
                imConnectService.init(name);
                imConnectService.connect();
                followAssistant(bd);
            } 
            // console.log("messages after enter");
            noticeNewContacts("ready");                   
        });
      } 

      var i = $scope.wallets.length;
      var j = 0;
      var timeSpan = 60 * 60 * 24 * 7;
      //检测钱包装提
      lodash.each($scope.wallets, function(wallet) {
        // console.log(wallet);
        walletService.getStatus(wallet, {}, function(err, status) {
          if (err) {

            wallet.error = (err === 'WALLET_NOT_REGISTERED') ? gettextCatalog.getString('Wallet not registered') : bwcError.msg(err);

            $log.error(err);
          } else {
            wallet.error = null;
            wallet.status = status;

            // TODO service refactor? not in profile service
            profileService.setLastKnownBalance(wallet.id, wallet.status.totalBalanceStr, function() {});
          }
          if (++j == i) {   // 获得最新钱包信息,链接im -- copay可以注册多钱包,实际renrenbit只需要一个钱包模式 -- 一个钱包对应一个用户
            walletService.getAddress(wallet, false, function(err, addr) {
            renrenbitUserService.user.wallet_address = addr;
            if (err) {
                //Error is already formated
                popupService.showAlert(err);
            }

            $timeout(function() {
                $scope.$apply();
            }, 10);
            });
          }
        });
      });
    };

    /**
     * 关注助手
     */
    var followAssistant = function(user) {
        var url = "v1/user/followassistant";
        var params = { uid: user.id, fid: renrenbitUserService.assistantId, uname: user.nick_name, fname: renrenbitUserService.assistantName, remark:"" };
        var response = renrenbitUserService.query(url, params); // 同步调用，获得承诺接口  
        
        response.then(function(data) {  // 调用承诺API获取数据 .resolve  
            console.log(data);  
            var status = data.status;
            if(status==1){
                console.log("初次关注");
                renrenbitUserService.firstTimeStart();
                //更新本地助手头像
                if ('cordova' in window) {
                    sqliteService.updateLstMsgHead(renrenbitUserService.assistantId, "img/message_assistant.png", function(err){
                        if(err!=""){
                            console.log(err);         
                        } else {
                            console.log("update ok");      
                        }        
                    });
                }
                
            } else {
                console.log("非初次关注");
                renrenbitUserService.notfirstTimeStart();
                //非初次关注获取一下当前未读信息数
                noticeNewMessages("ready");
            }
        }, function(err) {  // 处理错误 .reject  
            console.log(err);  
        });
    }

})
