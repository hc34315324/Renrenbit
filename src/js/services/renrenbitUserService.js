'use strict';
angular.module('copayApp.services')
  .factory('renrenbitUserService', function($log, $http, $q, $timeout, configService, localContactsService) {

    var renrenbitURL = configService.getDefaults().renrenbit.development.url;
    //  console.log('renrenbitURL: ' + renrenbitURL);
    
    var root = {};
    root.user = {}; 
    root.lstFindUser = {};
    root.follows = [];
    root.applyFans = [];
    root.applyFollows = [];
    root.assistantId ='8e1d105564ba11e7b2a9000c29fc9bc5';    //管理员帐号id
    root.assistantName = 'Renrenbit';    //管理员用户名称renrenbit   

    
    var from = 0;
    var from_fans = 0;
    var from_follows = 0;
    var page = 1;
    var page_fans = 1;
    var page_follows = 1;
    var totalPage = 0;
    var totalPage = 0;
    var totalPage_fans = 0;
    var totalPage_follows = 0;
    var totalRecord = 0;
    var totalRecord_fans = 0;
    var totalRecord_follows = 0;
    var maxResult = 20;

    /**
     * 根据钱包walletID获取用户信息
     * params wallet_id
     */
    root.getUserByWid = function(wallet_id, cb) {
      var cb_err = "";  
      var _params = { wid: wallet_id };
      $http({
          method: "post",
          // data: data,//Form Data = {"id":1,"value":"hello"} data 表示消息体里所带参数
          params: _params,             //params 表示url里所带参数
          url: renrenbitURL + "v1/user/viewbywid",
          headers: { "Content-Type": "application/x-www-form-urlencoded" }
      }).success(function (d) 
      { 
          console.log(d);
          var status = d.status;
          if(status == 1){
            root.user = d.user;
          } else {
            console.log(d.info); 
            cb_err = d.info;   
          }
          cb(cb_err, root.user);
      }).error(function(error)
      {   
          console.log(error);
          cb(cb_err);
      });
      
    };

    /**
     * 获取当前好友的信息
     */
    root.getUserInfo = function(uid, cb) {
      var cb_err = "";  
      var _params = { id: uid };
      $http({
          method: "get",
          // data: data,//Form Data = {"id":1,"value":"hello"} data 表示消息体里所带参数
          params: _params,             //params 表示url里所带参数
          url: renrenbitURL + "v1/user/view",
          headers: { "Content-Type": "application/x-www-form-urlencoded" }
      }).success(function (d) 
      { 
          console.log(d);
          var status = d.status;
          if(status != 1){
              cb_err = d.info;  
              cb(cb_err);
          } else {
              console.log(d.info);  
              cb(cb_err, d.user);
          }
          
      }).error(function(error)
      {   
          console.log(error);
          cb(cb_err);
      });
      
    };

    /**
     * 根据钱包地址获取用户信息
     */
    root.getUserByAddress = function(p_address) {
      var response = {};
      var _params = { address: p_address };
      $http({
          method: "post",
          // data: data,//Form Data = {"id":1,"value":"hello"} data 表示消息体里所带参数
          params: _params,             //params 表示url里所带参数
          url: renrenbitURL + "v1/user/viewbyaddress",
          headers: { "Content-Type": "application/x-www-form-urlencoded" }
      }).success(function (d) 
      {   
          console.log(d); 
          var status = d.status;
          if(status == 1){
            root.lstFindUser = d.user;
            response.status = true;
            response.obj = d.user;
          } else {
            console.log(d.info);
            response.status = false;   
          }
      }).error(function(error)
      { 
          console.log(error);
          response.status = false;
      });
    };

    /**
     * 根据用户id获取好友列表--分页
     * params id
     */
    root.getFollows = function(_uid, page, cb) {
    //   var _uid = "8e1d105564ba11e7b2a9000c29fc9bc5";    // 测试使用的uid;
      var err = "";
      console.log("_from >> " + from);
      var _params = { uid: _uid, from: from, count: maxResult };
      $http({
          method: "post",
          // data: data,//Form Data = {"id":1,"value":"hello"} data 表示消息体里所带参数
          params: _params,             //params 表示url里所带参数
          url: renrenbitURL + "v1/user/followslimit",
          headers: { "Content-Type": "application/x-www-form-urlencoded" }
      }).success(function (d) 
      {    
          console.log(d);
          var err = "";
          var status = d.status;
          if(status == 1){
            totalRecord = d.count;
            totalPage = totalRecord % maxResult == 0 ? totalRecord / maxResult : Math.ceil(totalRecord / maxResult);
            
            if(root.follows.length<=0){
               root.follows = d.follows;
            }else{
               root.follows= root.follows.concat(d.follows);
            } 

            // console.log("this arr ~~~~~~~~~~~~~~~~");
            // console.log(root.follows);
            
            if(totalPage > page){
                page += 1;
                from += (page - 1) * maxResult;
                root.getFollows(root.user.id, page , function(){});
            } else {    //不是初次关注，表示从服务器同步通讯录
                //最后一次循环后将通讯录提交本地存储
                localContactsService.init(root.user.id, root.follows, function(){
                    root.follows = localContactsService.getAllContacts(root.user.id);
                    // console.log("**********");
                    // console.log(JSON.stringify(root.follows));
                });
                cb(err, root.follows);
            }
            
          } else {
            cb(d.info);
          }
         
      }).error(function(error)
      { 
          console.log(error);
          cb(error);
      });
    };

    /**
     * 获取新申请好友列表
     */
    root.getApplyFans = function(_uid, page, cb) {
      var err = "";
      console.log("_from >> " + from_fans);
      var _params = { uid: _uid, from: from_fans, count: maxResult };
      $http({
          method: "post",
          // data: data,//Form Data = {"id":1,"value":"hello"} data 表示消息体里所带参数
          params: _params,             //params 表示url里所带参数
          url: renrenbitURL + "v1/user/applyfanslimit",
          headers: { "Content-Type": "application/x-www-form-urlencoded" }
      }).success(function (d) 
      {    
        //   console.log(d);
          var err = "";
          var status = d.status;
          if(status == 1){
            totalRecord_fans = d.count;
            totalPage_fans = totalRecord_fans % maxResult == 0 ? totalRecord_fans / maxResult : Math.ceil(totalRecord_fans / maxResult);
            
            if(root.applyFans.length<=0){
               root.applyFans = d.fans;
            }else{
               root.applyFans= root.applyFans.concat(d.fans);
            } 

            // console.log("this arr ~~~~~~~~~~~~~~~~");
            // console.log(root.applyFans);
            console.log("total>> " + totalPage_fans + "     page_fans>> " + page_fans);
            if(totalPage_fans > page_fans){
                page_fans += 1;
                from_fans += (page_fans - 1) * maxResult;
                root.getApplyFans(root.user.id, page_fans, function(){});
            } else {    //不是初次关注，表示从服务器同步通讯录
                //最后一次循环后将通讯录提交本地存储
                localContactsService.init_fans(root.user.id, root.applyFans, function(){
                    root.applyFans = localContactsService.getAllFans(root.user.id);
                    // console.log("**********");
                    // console.log(JSON.stringify(root.applyFans));
                });
                cb(err, root.applyFans);
            }
            
          } else {
            cb(d.info);
          }
          
      }).error(function(error)
      { 
          console.log(error);
          cb(error);
      });
    };

    /**
     * 获取新申请好友列表
     */
    root.getApplyFollows = function(_uid, page, cb) {
      var err = "";
    //   console.log("_from >> " + from_follows);
      var _params = { uid: _uid, from: from_follows, count: maxResult };
      $http({
          method: "post",
          // data: data,//Form Data = {"id":1,"value":"hello"} data 表示消息体里所带参数
          params: _params,             //params 表示url里所带参数
          url: renrenbitURL + "v1/user/applyfollowslimit",
          headers: { "Content-Type": "application/x-www-form-urlencoded" }
      }).success(function (d) 
      {    
        //   console.log(d);
          var err = "";
          var status = d.status;
          if(status == 1){
            totalRecord_follows = d.count;
            totalPage_follows = totalRecord_follows % maxResult == 0 ? totalRecord_follows / maxResult : Math.ceil(totalRecord_follows / maxResult);
            
            if(root.applyFollows.length<=0){
               root.applyFollows = d.follows;
            }else{
               root.applyFollows= root.applyFollows.concat(d.follows);
            } 

            // console.log("this arr ~~~~~~~~~~~~~~~~");
            // console.log(root.applyFollows);
            
            if(totalPage_follows > page_follows){
                page_follows += 1;
                from_follows += (page_follows - 1) * maxResult;
                root.getApplyFollows(root.user.id, page_follows, function(){});
            } else {    //不是初次关注，表示从服务器同步通讯录
                //最后一次循环后将通讯录提交本地存储
                localContactsService.init_follows(root.user.id, root.applyFollows, function(){
                    root.applyFollows = localContactsService.getAllFollows(root.user.id);
                    // console.log("**********");
                    // console.log(JSON.stringify(root.applyFollows));
                });
                cb(err, root.applyFollows);
            }
            
          } else {
            cb(d.info);
          }
         
      }).error(function(error)
      { 
          console.log(error);
          cb(error);
      });
    };

    /**
     * 初次关注renrenbit,直接添加一条好友联系人记录
     */
    root.firstTimeStart = function(){
        root.follows = [];
        root.getFollows(root.user.id, page, function(err, d){
            localContactsService.init(root.user.id, d.follows, function(){});
        });
    }

    /**
     * 非初次关注
     */
    root.notfirstTimeStart = function(){
        //先判断本地通讯录是否有记录
        root.follows = localContactsService.getAllContacts(root.user.id);
        if(root.follows>0){
            root.follows = localContactsService.getAllContacts(root.user.id);
            console.log("root.follows not frist**********");
            console.log(JSON.stringify(root.follows));
        } else {
            root.follows = [];
            root.getFollows(root.user.id, page, function(err, d){});
        }

    }

    /**
     * 获取申请好友列表信息
     */
    root.initApplyFansList = function(cb){
        root.applyFans = [];
        var applyFans = localContactsService.getAllFans(root.user.id);
        console.log("----------------------------------------");
        console.log(applyFans);
        root.getApplyFans(root.user.id, page, function(err, d){
            console.log("fans------------------");
            console.log(d);
            localContactsService.init_fans(root.user.id, d, function(){});
            var applyFans = localContactsService.getAllFans(root.user.id);
            console.log("fans get------------------");
            console.log(applyFans);
            cb(applyFans);
        });
    }

    /**
     * 获取申请关注列表信息
     */
    root.initApplyFollowsList = function(cb){
        root.applyFollows = [];
        root.getApplyFollows(root.user.id, page, function(err, d){
            console.log("follows------------------");
            console.log(d);
            localContactsService.init_follows(root.user.id, d, function(){});
            var applyFollows = localContactsService.getAllFollows(root.user.id);
            console.log("follows get------------------");
            console.log(applyFollows);
            cb(applyFollows);
        });
    }

    /**
     * 用于数据同步请求
     */
    root.query = function(_url, _params) {  
      var deferred = $q.defer(); // 声明延后执行，表示要去监控后面的执行  
      $http({method: 'POST', url: renrenbitURL + _url , params: _params}).  
      success(function(data, status, headers, config) {  
        deferred.resolve(data);  // 声明执行成功，即http请求数据成功，可以返回数据了  
      }).  
      error(function(data, status, headers, config) {  
        deferred.reject(data);   // 声明执行失败，即服务器返回错误  
      });  
      return deferred.promise;   // 返回承诺，这里并不是最终数据，而是访问最终数据的API  
    } // end query  

    return root;
  });
