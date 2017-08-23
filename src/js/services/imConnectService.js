'use strict';
angular.module('copayApp.services').factory('imConnectService', function($q, $rootScope, $log, $http, configService, renrenbitUserService, sqliteService, messageService, localContactsService) {
    var root = {};

    var renrenbitURL = configService.getDefaults().renrenbit.development.url;
    
    if (typeof console == "undefined") {    this.console = { log: function (msg) {  } };}
    // 如果浏览器不支持websocket，会使用这个flash自动模拟websocket协议，此过程对开发者透明
    var WEB_SOCKET_SWF_LOCATION = "../lib/WebSocketMain.swf";
    // 开启flash的websocket debug
    var WEB_SOCKET_DEBUG = true;
	  
    var ws, name, uid, client_list={};
    var select_client_id = '';

    root.init = function(uname){
       name = uname;
    }

    // 连接服务端
    root.connect = function() {
       // 创建websocket
       ws = new WebSocket("ws://192.168.1.5:7272");
       // 当socket连接打开时，输入用户名
       ws.onopen = onopen;
       // 当有消息时根据消息类型显示不同信息
       ws.onmessage = onmessage; 
       ws.onclose = function() {
    	  console.log("连接关闭，定时重连");
          root.connect();
       };
       ws.onerror = function() {
     	  console.log("出现错误");
       };
    }

    // 发送私信
    root.sendPrivateToOne = function(fid, fname, content, tid, tname, thead){
        // 发送消息
        var private_data = '{"type":"private", "d_tag":"msg", "tx_unit":0, "tx_amount":0.00, "f_id":"' + fid + '", "f_name":"'+fname.replace(/"/g, '\\"')+'", "content":"' + content.replace(/"/g, '\\"') + '", "t_id":"' + tid + '"}';
        console.log("发送私信数据:"+private_data);
        try{
            ws.send(private_data);
            root.getDate(function(err, d){
                if(err!=""){
                    console.log(err);
                } else {    // 插入本地与当前联系人聊天记录   
                    console.log("tid ------>> " + tid);
                    if ('cordova' in window) { 
                        //由于时我发送所以fid为个人id，tid为好友id :: 参数顺序 fid, content, isFromMe, isMsgShow, isReceiveShow, isSendShow, time, flag, cb
                        sqliteService.insertFriendMsg(tid, content, 1, 1, 0, 0, 0, 0, d, 1, function(err){
                            if(err!=""){
                                console.log(err);
                            }else{
                                console.log("private send to-----------------");
                                root.messagesDetialChange(private_data); 
                                sqliteService.insertLstMsg(
                                    tid, 
                                    tname.replace(/"/g, '\\"'), 
                                    thead, 
                                    thead, 
                                    '{"originalTime": "' + d + '", "time": "", "timeFrom1970": 0, "content": "' + content.replace(/"/g, '\\"') + '", "isFromMe": 0}', 
                                    0,
                                    0,
                                    0,
                                    function(err){
                                        if(err!=''){
                                            console.log(err);              
                                        }
                                    });  
                            }
                        }); 
                    }
                }        
            }); 
            
            //先插入数据然后再判断更新
        } catch(err){   //有错误则更新数据库 -- 将成功状态设置为0表示未发送成功
            console.log(err); 
            sqliteService.updateFriendMsgFlag(tid, 1, d.date, 0, function(err){
                if(err!=""){
                    console.log(err);        
                } else {
                    console.log("update friendmsg flag ok");
                    root.messagesDetialChange(private_data); 
                }
            });  
               
        } 
        
    }

    // 私信发送收款
    root.sendReceiveToOne = function(fid, fname, content, tid, tname, thead, txUnit, txAmount){
        // 发送消息
        var private_data = '{"type":"private", "d_tag":"receive", "tx_unit":' + txUnit + ', "tx_amount":' + txAmount + ', "f_id":"' + fid + '", "f_name":"'+fname.replace(/"/g, '\\"')+'", "content":"' + content.replace(/"/g, '\\"') + '", "t_id":"' + tid + '"}';
        console.log("发送私信数据:"+private_data);
        try{
            ws.send(private_data);
            root.getDate(function(err, d){
                if(err!=""){
                    console.log(err);
                } else {    // 插入本地与当前联系人聊天记录   
                    console.log("tid ------>> " + tid);
                    if ('cordova' in window) { 
                        //由于时我发送所以fid为个人id，tid为好友id :: 参数顺序 fid, content, isFromMe, isMsgShow, isReceiveShow, isSendShow, txUnit, txAmount, time, flag, cb
                        sqliteService.insertFriendMsg(tid, content, 1, 0, 1, 0, txUnit, txAmount, d, 1, function(err){
                            if(err!=""){
                                console.log(err);
                            } else {
                                console.log("private send to-----------------");
                                root.messagesDetialChange(private_data); 
                                sqliteService.insertLstMsg(
                                    tid, 
                                    tname.replace(/"/g, '\\"'), 
                                    thead, 
                                    thead, 
                                    '{"originalTime": "' + d + '", "time": "", "timeFrom1970": 0, "content": "' + content.replace(/"/g, '\\"') + '", "isFromMe": 0}', 
                                    0,
                                    0,
                                    0,
                                    function(err){
                                        if(err!=''){
                                            console.log(err);              
                                        }
                                    });  
                            }
                        }); 
                    }
                }        
            }); 
            
            //先插入数据然后再判断更新
        } catch(err){   //有错误则更新数据库 -- 将成功状态设置为0表示未发送成功
            console.log(err); 
            sqliteService.updateFriendMsgFlag(tid, 1, d.date, 0, function(err){
                if(err!=""){
                    console.log(err);        
                } else {
                    console.log("update friendmsg flag ok");
                    root.messagesDetialChange(private_data); 
                }
            });  
               
        } 
        
    }


    // 消息变动广播tab_message改变
    root.messagesChange = function(msgs){
        $rootScope.$broadcast("messagesChange", msgs);
    }
    // 广播消息页面刷新
    root.messagesDetialChange = function(msg){
        $rootScope.$broadcast("messagesDetialChange", msg);
    }
    // 广播联系人页面通知
    root.noticeNewContacts = function(msg){
        $rootScope.$broadcast("newContacts", msg);
    }

    /**
     * 获取服务器时间
     */
    root.getDate = function(cb) { 
      var dateStr = "";
      var cb_err = "";
      var _params = {};
      $http({
          method: "get",
          // data: data,//Form Data = {"id":1,"value":"hello"} data 表示消息体里所带参数
          params: _params,             //params 表示url里所带参数
          url: renrenbitURL + "v1/act/getdate",
          headers: { "Content-Type": "application/x-www-form-urlencoded" }
      }).success(function (d) 
      { 
          console.log(JSON.stringify(d));
          var status = d.status;
          if(status == 1){
            dateStr = d.date;
          } else {
            console.log(d.info); 
            cb_err = d.info;   
          }
          cb(cb_err, dateStr);
      }).error(function(error)
      {   
          console.log(error);
          cb(cb_err);
      });
      
    };

    // 连接建立时发送登录信息
    function onopen()
    {
        if(!name || name=='null'){  
            name = '游客';
        }
        // 登录
        var login_data = '{"type":"login","client_name":"'+name.replace(/"/g, '\\"')+'","uid":"' + renrenbitUserService.user.id + '"}';
        console.log("websocket握手成功，发送登录数据:"+login_data);
        ws.send(login_data);
    }

    // 服务端发来消息时
    function onmessage(e)
    {
        console.log(e.data);
        var data = eval("("+e.data+")");
        switch(data['type']){
            // 服务端ping客户端
            case 'ping':
                ws.send('{"type":"pong"}');
                break;
            // 登录 更新用户列表
            case 'login':
                //{"type":"login","client_id":xxx,"client_name":"xxx","time":"xxx"}
                console.log(data['client_name']+"登录成功");
                break;
            // 通知消息    
            case 'notice':
                var err = '';
                // $new_message = array('type'=>'notice', 'notice_type'=>'newFriendApply', 'f_id'=>$uid, 'f_name'=>htmlspecialchars($uname), 'content'=>$content, 'time'=>$msgtime);
                console.log("id>" + data['f_id'] + "   " + data['f_name'] + '对你说：' + data['content']);
                root.noticeNewContacts(data['content']);
                break;
            // 私信
            case 'private':
                var err = '';
                console.log("id>" + data['f_id'] + "   " + data['f_name'] + '对你说：' + data['content']);
                var uObj = localContactsService.getContactById(data['f_id']); //本地获取通讯录中联系人
                console.log(JSON.stringify(uObj));
                var headimg = "";
                if(uObj){
                    headimg = uObj.headimg;    
                }else{
                    if(data['f_id']==renrenbitUserService.assistantId){ //管理员
                        headimg = 'img/message_assistant.png';    
                    }else{
                        headimg = 'img/default.png';
                    }
                    
                }
                if ('cordova' in window) {
                    console.log("d_tag........................");
                    console.log(data['d_tag']);
                    if(data['d_tag']=='msg'){
                        console.log("msg........................");
                        sqliteService.insertFriendMsg(data['f_id'], data['content'], 0, 1, 0, 0, 0, 0, data['time'], 1);
                    }else
                    if(data['d_tag']=='receive'){
                        sqliteService.insertFriendMsg(data['f_id'], data['content'], 0, 0, 1, 0, 0, 0, data['time'], 1);
                    }else
                    if(data['d_tag']=='send'){
                        sqliteService.insertFriendMsg(data['f_id'], data['content'], 0, 0, 0, 1, 0, 0, data['time'], 1);
                    }
                    
                    sqliteService.findOnelstMsgs(data['f_id'], function(err, d){
                        if(err!=""){
                            console.log("oneLstMsgs err ---------------------------------");
                            console.log(err);
                        } else {
                            console.log("oneLstMsgs ---------------------------------");
                            console.log("nowNoReadMessages>> " + JSON.stringify(d[0]));
                            if(d[0]!=undefined && d[0]!=null && d[0]!=""){
                                 var noReads = d[0].noReadMessages;
                                    noReads+=1;
                                    console.log("noReads::" + noReads);
                                    sqliteService.insertLstMsg(
                                    data['f_id'], 
                                    data['f_name'], 
                                    headimg, 
                                    headimg, 
                                    '{"originalTime": "' + data['time'] + '", "time": "", "timeFrom1970": 0, "content": "' + data['content'] + '", "isFromMe": 0}', 
                                    noReads,
                                    1,
                                    0,
                                    function(err){
                                        if(err!=''){
                                            console.log(err);              
                                        }else{
                                            sqliteService.findAllLstMsgs(function(err, data){
                                                console.log(JSON.stringify(data));
                                                messageService.init(data);
                                                var messages = messageService.getAllMessages();
                                                root.messagesChange(messages);
                                            });    
                                        }
                                    });  
                            } else {
                                    sqliteService.insertLstMsg(
                                    data['f_id'], 
                                    data['f_name'], 
                                    headimg, 
                                    headimg, 
                                    '{"originalTime": "' + data['time'] + '", "time": "", "timeFrom1970": 0, "content": "' + data['content'] + '", "isFromMe": 0}', 
                                    1,
                                    1,
                                    0,
                                    function(err){
                                        if(err!=''){
                                            console.log(err);              
                                        }else{
                                            sqliteService.findAllLstMsgs(function(err, data){
                                                console.log(JSON.stringify(data));
                                                messageService.init(data);
                                                var messages = messageService.getAllMessages();
                                                root.messagesChange(messages);
                                            });    
                                        }
                                    });  
                            }
                           
                        }
                    }); 
                     
                    root.messagesDetialChange(data);      
                }

                break;
            // 发言
            case 'say':
                //{"type":"say","from_client_id":xxx,"to_client_id":"all/client_id","content":"xxx","time":"xxx"}
                say(data['from_client_id'], data['from_client_name'], data['content'], data['time']);
                break;
            // 用户退出 更新用户列表
            case 'logout':
                //{"type":"logout","client_id":xxx,"time":"xxx"}
                say(data['from_client_id'], data['from_client_name'], data['from_client_name']+' 退出了', data['time']);
                delete client_list[data['from_client_id']];
                flush_client_list();
        }
    }

    return root;
});
