'use strict';

angular.module('copayApp.controllers').controller('messageDetailCtrl',
    function($rootScope, $scope, $stateParams, messageService, $ionicScrollDelegate, $timeout, $state, gettextCatalog, popupService, imConnectService, renrenbitUserService) {
        var viewScroll = $ionicScrollDelegate.$getByHandle('messageDetailsScroll');
        $scope.isShowPlus = false;
        var contentHeight = 0;
        var footBarHeight = 0;
        var bottomHeight = 0;
        var from = 0;
        var nowFriend = {}
        // console.log("enter");
        $timeout(function() {
            viewScroll.scrollBottom();
        }, 200);
        
        $scope.doRefresh = function() {
            // console.log("ok");
            $scope.messageNum += 5;
            $timeout(function() {
                if ('cordova' in window) {
                    $scope.messageNum = 10;
                    messageService.getPrivateMsgsFromDB(from, $scope.messageNum,
                        $stateParams.fUid, function(err, d){
                        if(err!=""){
                            console.log(err);
                        }else{
                            if($scope.messageDetails){
                                from += d.length; 
                                $scope.messageDetails = d.concat($scope.messageDetails);
                                // .reverse();
                            }
                            
                        }
                    });
                } else {
                    $scope.messageDetails = messageService.getAmountMessageById($scope.messageNum,
                        $stateParams.messageId);
                }
                
                $scope.$broadcast('scroll.refreshComplete');
            }, 200);
        };

        $scope.$on("$ionicView.beforeEnter", function() {
            from = 0;
            console.log("msgdetial before enter");
            console.log("root action >> " + $rootScope.action);
            console.log("root sendMsgTag >> " + $rootScope.sendMsgTag);
            if($rootScope.sendMsgTag==1){
                $rootScope.sendMsgTag = 0;
                var unitStr = "BTC";
                var amount = 0;
                var bitsToBtc = 1 / 1000000;
                if($rootScope.unitD == 2){
                    unitStr = "bits";
                    amount = $rootScope.msgAmount * bitsToBtc; 
                }else
                if($rootScope.unitD == 8){
                    unitStr = "BTC";
                    amount = $rootScope.msgAmount; 
                }
                console.log(amount);
                
                var msgdetial = "bitcoin:" + renrenbitUserService.user.wallet_address + "?amount=" + amount;    
                console.log(msgdetial);
                var fid = renrenbitUserService.user.id;
                var tid = $stateParams.fUid;    
                var tname = $stateParams.fUname;  
                var thead = $stateParams.fUhead;      
                var fname = renrenbitUserService.user.nick_name;
                
                imConnectService.sendReceiveToOne(fid, fname, msgdetial, tid, tname, thead, $rootScope.unitD, $rootScope.msgAmount);
            }

            if ('cordova' in window) {
                console.log("param in cordova >>" + $stateParams.fUid); 
                renrenbitUserService.getUserInfo($stateParams.fUid, function(e, d){
                    if(e!=""){
                        console.log(e);
                    } else {
                        nowFriend = d;    
                        console.log(JSON.stringify(nowFriend));
                    }
                });
                messageService.getOnelstMsgsFromDB($stateParams.fUid, function(err, d){
                    if(err!=""){
                        console.log(err);
                    } else {
                        console.log("one lst msgs-----------------");
                        console.log(JSON.stringify(d[0]));
                        $scope.message = d[0];
                        var uid = renrenbitUserService.user.id;
                        var dcount = $stateParams.noReads;
                        
                        $scope.message.noReadMessages = 0;
                        $scope.message.showHints = 0;
                        messageService.updateMessageFromDB($scope.message);
                        messageService.subtractTotalUnReadMsgCount(uid, dcount);
                        var nowCount = messageService.getTotalUnReadMsgCount(uid);
                        console.log("nowcount>> " + nowCount);

                        $scope.messageNum = 10;
                        messageService.getPrivateMsgsFromDB(from, $scope.messageNum,
                            $stateParams.fUid, function(err, d){
                                if(err!=""){
                                    console.log(err);
                                }else{
                                    $scope.messageDetails = d;
                                    from += d.length; 
                                }
                        });
                        $timeout(function() {
                            viewScroll.scrollBottom();
                        }, 200);   
                    }
                });
                
            } else {
                var testid = "3ea7ba4a6ad511e79403000c29fc9bc5";
                renrenbitUserService.getUserInfo(testid, function(e, d){
                    if(e!=""){
                        console.log(e);
                    } else {
                        nowFriend = d;    
                        console.log(nowFriend);
                    }
                });

                $scope.message = messageService.getMessageById($stateParams.messageId);
                $scope.message.noReadMessages = 0;
                $scope.message.showHints = false;
                messageService.updateMessage($scope.message);
                $scope.messageNum = 10;
                $scope.messageDetails = messageService.getAmountMessageById($scope.messageNum,
                    $stateParams.messageId);
                $timeout(function() {
                    viewScroll.scrollBottom();
                }, 200);
            }
            
        });

        $scope.$on("$ionicView.afterEnter", function() {
            console.log($(".rj-stable-content").css('height'));
            contentHeight = $(".rj-stable-content").height();
            footBarHeight = $(".bar-light").height();
            bottomHeight = $(".bottom-plus-items").height();
        });

        $scope.$on("$ionicView.leave", function(event, data) {
            console.log("onleave" + contentHeight);
            $scope.isShowPlus = false;
            $(".rj-stable-content").height(contentHeight);
            $(".bar-light").css('bottom', 0);
        });

        $scope.$on("messagesDetialChange", function(err, msg) {
            console.log("messagesDetialChange detial >> " + msg);
            var _from = 0;
            $scope.messageNum = 10;
            messageService.getPrivateMsgsFromDB(_from, $scope.messageNum,
                $stateParams.fUid, function(err, d){
                    if(err!=""){
                        console.log(err);
                    }else{
                        $scope.messageDetails = d;
                        from = d.length; 
                    }
            });
            $timeout(function() {
                $scope.$apply();
            }, 200);
        });
        
        // 发送
        $scope.send = function(msgdetial) {
            // var fid = "8e1d105564ba11e7b2a9000c29fc9bc5";       //测试使用
            // var tid = renrenbitUserService.user.id;         //测试先传自己
            var fid = renrenbitUserService.user.id;
            var tid = $stateParams.fUid;  
            var tname = $stateParams.fUname;  
            var thead = $stateParams.fUhead;        
            var fname = renrenbitUserService.user.nick_name;
            
            imConnectService.sendPrivateToOne(fid, fname, msgdetial, tid, tname, thead);

            $scope.send_content="";
            $timeout(function() {
                $scope.$apply();
            });

        };

        // 发送币
        $scope.sendCoin = function() {
            if(nowFriend!=undefined&&nowFriend.wallet_address!=undefined&&nowFriend.wallet_address!=""){
                $state.go('tabs.message.amount', {
                    toAddress: nowFriend.wallet_address,
                    toName: nowFriend.nick_name,
                    toEmail: "test@test.com",
                    from: "messages-detial",
                    action: "send"
                });
            }else{
                return popupService.showAlert(gettextCatalog.getString('提示'), gettextCatalog.getString('该有户还未广播钱包地址，可发消息提醒他到钱包页面刷新'));
            }

        };

        // 发送收币
        $scope.receiveCoin = function() {
            console.log("receive click");
            if(renrenbitUserService.user.wallet_address!=undefined && renrenbitUserService.user.wallet_address!=""){
                $scope.isShowPlus = false;
                $(".rj-stable-content").height(contentHeight);
                $(".bar-light").css('bottom', 0);
                console.log(renrenbitUserService.user.wallet_id);
                $state.go('tabs.message.msgAmonut', {
                    id: renrenbitUserService.user.wallet_id,
                    from: "messages-detial",
                    action: "receive"
                });
            }else{
                return popupService.showAlert(gettextCatalog.getString('提示'), gettextCatalog.getString('该有户还未广播钱包地址，可发消息提醒他到钱包页面刷新'));
            }
        }

        // 返回
        $scope.backClick = function(){
            $scope.isShowPlus = false;
            $(".rj-stable-content").height(contentHeight);
            $(".bar-light").css('bottom', 0);
        }

        // 轻触事件
        $scope.onTap = function(){
            $scope.isShowPlus = false;
            $(".rj-stable-content").height(contentHeight);
            $(".bar-light").css('bottom', 0);
        }

        // 显示或隐藏plusview
        $scope.showplus = function(){
            $scope.isShowPlus = !$scope.isShowPlus;
            console.log($scope.isShowPlus);
            if($scope.isShowPlus){
                console.log($(".rj-stable-content").height());
                var nowContentHeight = contentHeight - bottomHeight;
                console.log(nowContentHeight);
                $(".rj-stable-content").css('height', nowContentHeight + "px");
                $(".bar-light").css('bottom', bottomHeight);
                
                $timeout(function() {
                    viewScroll.scrollBottom();
                }, 200);
            }else{
                $(".rj-stable-content").height(contentHeight);
                $(".bar-light").css('bottom', 0);
            }
            
        }

        // 广播获取提示未读信息数量
        var noticeNewMessages = function(msg){
            $timeout(function() {
                $rootScope.$broadcast("initMessageNotice", msg);
            }, 200);
        }

        window.addEventListener("native.keyboardshow", function(e){
            viewScroll.scrollBottom();
        });
});
