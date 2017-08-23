'use strict';

angular.module('copayApp.controllers').controller('tabContactsController',
  function($rootScope, $timeout, $scope, $state, $stateParams, $ionicModal, $ionicScrollDelegate, $window, gettextCatalog, lodash, popupService, ongoingProcess, externalLinkService, latestReleaseService, profileService, walletService, configService, $log, platformInfo, storageService, txpModalService, appConfigService, startupService, addressbookService, feedbackService, bwcError, nextStepsService, buyAndSellService, homeIntegrationsService, bitpayCardService, pushNotificationsService, timeService, renrenbitUserService, localContactsService) {
    var flag = 0;

    $scope.$on("$ionicView.loaded", function(event, data) {
        console.log("imcontact loaded");
        var user = renrenbitUserService.user;
        var follows = renrenbitUserService.follows; 
        console.log(JSON.stringify(follows));
        
        for(var i=0; i<follows.length; i++){
            var fl = follows[i];
            if(fl.role==999){
                fl.headimg = 'img/message_assistant.png';
            }else{
                fl.headimg = 'img/default.png';
            }
            console.log(fl);
        }

        $scope.contactArray = follows; 
        $timeout(function() {
            $scope.$apply();
        });
        $timeout(function(){
            initialSortBar();
            initials();
        }, 20);

    });

    $scope.$on("$ionicView.beforeEnter", function(event, data) {
        $scope.isContactsShow = false;
        console.log("before");
        var uid = renrenbitUserService.user.id;
        $scope.showNewFriendHints = false;
        $scope.newFans = localContactsService.getNewFansApplyCount(uid);
        if($scope.newFans!=undefined && $scope.newFans!="" && $scope.newFans>0){
            $scope.showNewFriendHints = true;
        }

        // flag+=1;    //表示返回刷新
        // if(flag>1){
            var uid = renrenbitUserService.user.id;
            $timeout(function() {
                // renrenbitUserService.follows = 
                var follows = localContactsService.getAllContacts(uid);
                console.log(follows);
                
                for(var i=0; i<follows.length; i++){
                    var fl = follows[i];
                    if(fl.role==999){
                        fl.headimg = 'img/message_assistant.png';
                    }else{
                        fl.headimg = 'img/default.png';
                    }
                    console.log(fl);
                }

                $scope.contactArray = follows; 
                $timeout(function() {
                    $scope.$apply();
                });
                $timeout(function(){
                    initialSortBar();
                    initials();
                    $scope.isContactsShow = true;
                }, 20); 
            
            }, 200);
        // }
    });

    $scope.contactToOne = function(contactEntry){
        console.log(contactEntry);
        renrenbitUserService.lstFindUser.id = contactEntry.follower_id;
        renrenbitUserService.lstFindUser.nick_name = contactEntry.follower_name;
        renrenbitUserService.lstFindUser.wallet_address = contactEntry.wallet_address;

        if(contactEntry.role==999){
            $state.go('messageDetailFromContacts', {
                "fUid": contactEntry.follower_id,
                "fUname": contactEntry.follower_name,
                "fUhead": contactEntry.headimg
            });
        } else {
            $state.go('tabs.contactView', {
                address:contactEntry.wallet_address, email: "test@test.com", name: contactEntry.follower_name, headimg:contactEntry.headimg, fUid:contactEntry.follower_id
            });
        }
        
    };

    $scope.goAddAddressbook = function() {
        $state.go('tabs.addressbook');
    };

    $scope.goNewApplyContacts = function() {
        var uid = renrenbitUserService.user.id;
        localContactsService.clearNewFansApplyCount(uid);
        $scope.showNewFriendHints = false;
        noticeNewContacts("clear");
        $state.go('tabs.newApplyContacts');
    };

    $scope.$on("newContacts", function(err, msg) {
        console.log("newContacts apply >> " + msg);
        var uid = renrenbitUserService.user.id;
        $timeout(function() {
            $scope.newFans = localContactsService.getNewFansApplyCount(uid);
            $scope.showNewFriendHints = true;    
            console.log($scope.newFans);
            
            // 通知
            if ('cordova' in window) {
                sendOne();
            }

            $scope.$apply();
        }, 200);
    });

    // 广播联系人页面通知
    var noticeNewContacts = function(msg){
        $rootScope.$broadcast("initContactsNotice", msg);
    }

    var initialSortBar = function(){
        var letterBox=$('.rj-contacts-middle-notice');
        var sortBar=$('.rj-contacts-right-bar');
        sortBar.append('<div>&uarr;</div>'+
            '<div>☆</div>' +
            '<div>A</div>' +
            '<div>B</div>' +
            '<div>C</div>' +
            '<div>D</div>' +
            '<div>E</div>' +
            '<div>F</div>' +
            '<div>G</div>' +
            '<div>H</div>' +
            '<div>I</div>' +
            '<div>J</div>' +
            '<div>K</div>' +
            '<div>L</div>' +
            '<div>M</div>' +
            '<div>N</div>' +
            '<div>O</div>' +
            '<div>P</div>' +
            '<div>Q</div>' +
            '<div>R</div>' +
            '<div>S</div>' +
            '<div>T</div>' +
            '<div>U</div>' +
            '<div>V</div>' +
            '<div>W</div>' +
            '<div>X</div>' +
            '<div>Y</div>' +
            '<div>Z</div>' +
            '<div>#</div>');

        $(".rj-contacts-right-bar div").click(function(){
            var _this=$(this);
            var letterHtml=_this.html();
            // console.log(letterHtml);
            letterBox.html(letterHtml).fadeIn();

            // sortBar.css('background','rgba(145,145,145,0.6)');
            
            setTimeout(function(){
                // sortBar.css('background','rgba(145,145,145,0)');
                letterBox.fadeOut();
            },1000);

            var _index = _this.index();
            console.log("index>>" + _index);
            if(_index==0){
                //点击第一个滚到顶部
                $ionicScrollDelegate.scrollTop(true);
            }else if(_index==28){
                //点击最后一个滚到#号
                $ionicScrollDelegate.scrollBottom(true);
            }else{
                var letter = _this.text();
                if($('#'+letter).length>0){
                    var LetterTop = $('#'+letter).position().top;
                    console.log(LetterTop);
                    $ionicScrollDelegate.scrollTo(0, LetterTop, true); 
                }
            }
        })       

        var windowHeight=$(window).height();
        var initHeight=windowHeight-85;
        sortBar.height(initHeight);
        var liHeight=initHeight/30;
        sortBar.find('div').height(liHeight);
    }

    var initials = function() {
        $(".rj-contacts-index-bar").remove();
        var sortList = angular.element(".rj-item");
        var SortBox=$(".rj-list");
        console.log("SortBox-------------------------");
        console.log(SortBox);
        console.log("SortBox-------------------------");
        console.log(sortList);

        sortList.sort(asc_sort).appendTo('.rj-list');//按首字母排序
        function asc_sort(a, b) {
            return makePy($(b).find('.num_name').text().charAt(0))[0].toUpperCase() < makePy($(a).find('.num_name').text().charAt(0))[0].toUpperCase() ? 1 : -1;
        }

        var initials = [];
        var num=0;
        sortList.each(function(i) {
            var initial = makePy($(this).find('.num_name').text().charAt(0))[0].toUpperCase();
            console.log(initial);
            if(initial>='A'&&initial<='Z'){
                if (initials.indexOf(initial) === -1)
                    initials.push(initial);
            }else{
                num++;
            }
            
        });

        $.each(initials, function(index, value) {//添加首字母标签
            SortBox.append('<div class="rj-contacts-index-bar" delegate-handle="' + value + '" id="' + value + '">' + value + '</div>');
        });
        if(num!=0){SortBox.append('<div class="rj-contacts-index-bar sort_letter" id="default">#</div>');}

        for (var i =0;i<sortList.length;i++) {//插入到对应的首字母后面
            var letter=makePy(sortList.eq(i).find('.num_name').text().charAt(0))[0].toUpperCase();
            switch(letter){
                case "A":
                    $('#A').after(sortList.eq(i));
                    break;
                case "B":
                    $('#B').after(sortList.eq(i));
                    break;
                case "C":
                    $('#C').after(sortList.eq(i));
                    break;
                case "D":
                    $('#D').after(sortList.eq(i));
                    break;
                case "E":
                    $('#E').after(sortList.eq(i));
                    break;
                case "F":
                    $('#F').after(sortList.eq(i));
                    break;
                case "G":
                    $('#G').after(sortList.eq(i));
                    break;
                case "H":
                    $('#H').after(sortList.eq(i));
                    break;
                case "I":
                    $('#I').after(sortList.eq(i));
                    break;
                case "J":
                    $('#J').after(sortList.eq(i));
                    break;
                case "K":
                    $('#K').after(sortList.eq(i));
                    break;
                case "L":
                    $('#L').after(sortList.eq(i));
                    break;
                case "M":
                    $('#M').after(sortList.eq(i));
                    break;
                case "O":
                    $('#O').after(sortList.eq(i));
                    break;
                case "P":
                    $('#P').after(sortList.eq(i));
                    break;
                case "Q":
                    $('#Q').after(sortList.eq(i));
                    break;
                case "R":
                    $('#R').after(sortList.eq(i));
                    break;
                case "S":
                    $('#S').after(sortList.eq(i));
                    break;
                case "T":
                    $('#T').after(sortList.eq(i));
                    break;
                case "U":
                    $('#U').after(sortList.eq(i));
                    break;
                case "V":
                    $('#V').after(sortList.eq(i));
                    break;
                case "W":
                    $('#W').after(sortList.eq(i));
                    break;
                case "X":
                    $('#X').after(sortList.eq(i));
                    break;
                case "Y":
                    $('#Y').after(sortList.eq(i));
                    break;
                case "Z":
                    $('#Z').after(sortList.eq(i));
                    break;
                default:
                    $('#default').after(sortList.eq(i));
                    break;
            }
        };
        console.log(sortList);
    };


    //发送单个消息
    var sendOne = function() {
        window.cordova.plugins.notification.local.add({
        id: 1,
        title: '有新的朋友申请',
        text: '新的好友申请消息，来看看吧',
        at: new Date().getTime() + 1000 * 6,
        badge: 2,
        autoClear: true, //默认值
        sound: 'res://platform_default', //默认值
        icon: 'res://ic_popup_reminder', //默认值
        ongoing: false //默认值
        });
    };

    if ('cordova' in window) {
        //监听事件
        //shedule事件在每次调用时触发
        cordova.plugins.notification.local.on('schedule', function (notification) {
            // alert('scheduled:' + notification.id);
            $log.debug('scheduled:' + notification.id);
        });
        // //通知触发事件
        cordova.plugins.notification.local.on('trigger', function (notification) {
            // alert('triggered:' + notification.id);
            // alert(JSON.stringify(notification));
            $log.debug('triggered:' + notification.id);
            $log.debug(JSON.stringify(notification));
        });
        //监听点击事件
        cordova.plugins.notification.local.on('click', function (notification) {
            // alert(JSON.stringify(notification));
            // document.getElementById('title').innerHTML = JSON.stringify(notification.data);
            $log.debug(JSON.stringify(notification));
        });
    }
});
