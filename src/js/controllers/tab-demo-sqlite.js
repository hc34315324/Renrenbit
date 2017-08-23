'use strict'
angular.module('copayApp.controllers').controller('tabDemoSqliteController', function($scope, $rootScope, $log, $timeout, $ionicPlatform, sqliteService) {

    document.addEventListener('deviceready', function() {
        sqliteService.load(function(){
            sqliteService.insertLstMsg(
                '3ea7ba4a6ad511e79403000c29fc9bc5', 
                '张三', 
                'img/default.png', 
                'img/default.png', 
                '{"originalTime": "2017-07-12 15:34:55", "time": "", "timeFrom1970": 0, "content": "好", "isFromMe": false}', 
                1,
                1,
                0);    
        });
    });

    $scope.$on("$ionicView.afterEnter", function() {
        // sqliteService.countLstMsgs();
        sqliteService.findAllLstMsgs(function(err, data){
            console.log(JSON.stringify(data));
        });
        
    });
    
    // $scope.$on("$ionicView.enter", function(event, data) {

    // });

});
