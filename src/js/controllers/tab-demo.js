'use strict'
angular.module('copayApp.controllers').controller('tabDemoController', function($scope, $rootScope, $log, $timeout, $ionicScrollDelegate, addressbookService, profileService, lodash, $state, walletService, incomingData, popupService, platformInfo, bwcError, gettextCatalog) {

  //发送单个消息
  $scope.sendOne = function() {
    window.cordova.plugins.notification.local.add({
      id: 1,
      title: '应用提醒',
      text: '应用新消息，来看吧',
      at: new Date().getTime() + 1000 * 6,
      badge: 2,
      autoClear: true, //默认值
      sound: 'res://platform_default', //默认值
      icon: 'res://ic_popup_reminder', //默认值
      ongoing: false //默认值
    });
  };

  //发送多个消息
  $scope.sendTwo = function() {
    window.cordova.plugins.notification.local.schedule({
      id: 1,
      title: '应用提醒1',
      text: '应用提醒内容1',
      at: new Date()
    }, {
      id: 2,
      title: '应用提醒2',
      text: '应用提醒内容2',
      // 当前时间不推迟
      // ＋ 1000 * (n - 1) 推迟的秒数
      at: new Date(new Date().getTime())
    });

  };
  //发送重复消息
  $scope.sendThree = function() {
    window.cordova.plugins.notification.local.schedule({
      title: '重复消息标题',
      text: '闹钟闹钟！快起床!!!!',
      at: new Date(),
      //default:0 不重复
      //second,minute,hour,day,week,month,year
      every: 'minute'
    });

  };


  //发送带参消息
  $scope.sendFourth = function() {
    window.cordova.plugins.notification.local.schedule({
      id: 1,
      title: '带参数',
      text: '震惊！福建高考状元女装照片流出！',
      firstAt: new Date(new Date().getTime() + 6 * 1000),
      every: 0,
      data: {
        meetingID: '1324',
        time: new Date()
      }
    });

  };


  //监听事件
  //shedule事件在每次调用时触发
  cordova.plugins.notification.local.on('schedule', function (notification) {
      alert('scheduled:' + notification.id);
  });
  // //通知触发事件
  cordova.plugins.notification.local.on('trigger', function (notification) {
      alert('triggered:' + notification.id);
      alert(JSON.stringify(notification));
  });
  //监听点击事件
  cordova.plugins.notification.local.on('click', function (notification) {
      alert(JSON.stringify(notification));
      document.getElementById('title').innerHTML = JSON.stringify(notification.data);
  });

});
