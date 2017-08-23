'use strict';

angular.module('copayApp.services')
  .factory('messageService', ['localIMStorageService', 'dateService', 'sqliteService',
        function(localIMStorageService, dateService, sqliteService) {
            return {
                init: function(messages) {
                    var i = 0;
                    var length = 0;
                    var messageID = new Array();
                    var date = null;
                    var messageDate = null;
                    if (messages) {
                        length = messages.length;
                        for (; i < length; i++) {
                            messageDate = dateService.getMessageDate(messages[i]);
                            // console.log("msgdate>>" + JSON.stringify(messageDate));
                            if(!messageDate){
                                return null;
                            }
                            date = new Date(messageDate.year, messageDate.month,
                                messageDate.day, messageDate.hour, messageDate.minute,
                                messageDate.second);
                            // console.log(messages[i].lstMsg.timeFrom1970);
                            messages[i].lstMsg.timeFrom1970 = date.getTime();
                            messageID[i] = {
                                id: messages[i].id
                            };

                        }
                        localIMStorageService.update("messageID", messageID);
                        for (i = 0; i < length; i++) {
                            // console.log("message_" + messages[i].id + " >> " + JSON.stringify(messages[i]));
                            localIMStorageService.update("message_" + messages[i].id, messages[i]);
                        }
                    }
                },
                getAllMessages: function() {
                    var messages = new Array();
                    var i = 0;
                    var messageID = localIMStorageService.get("messageID");
                    var length = 0;
                    var message = null;
                    if (messageID) {
                        length = messageID.length;

                        for (; i < length; i++) {
                            message = localIMStorageService.get("message_" + messageID[i].id);
                            if(message){
                                messages.push(message);
                            }
                        }
                        dateService.handleMessageDate(messages);
                        return messages;
                    }
                    return null;

                },
                getOnelstMsgsFromDB: function(uid, cb){
                    sqliteService.findOnelstMsgs(uid, function(err, data){
                        if(err!=""){
                            cb(err);
                        }else{
                            console.log(JSON.stringify(data));
                            cb(err, data);
                        }
                    });  
                },
                getPrivateMsgsFromDB: function(from, num, uid, cb){
                    sqliteService.findFriendMsgs(from, num, uid, function(err, data){
                        if(err!=""){
                            cb(err);
                        }else{
                            console.log(JSON.stringify(data));
                            cb(err, data);
                        }
                    });    
                },
                getMessageById: function(id){
                    return localIMStorageService.get("message_" + id);
                },
                getAmountMessageById: function(num, id){
                    var messages = [];
                    var message = localIMStorageService.get("message_" + id).message;
                    var length = 0;
                    if(num < 0 || !message) return;
                    length = message.length;
                    if(num < length){
                        messages = message.splice(length - num, length); 
                        return messages;  
                    }else{
                        return message;
                    }
                },
                updateMessage: function(message) {
                    var id = 0;
                    if (message) {
                        id = message.id;
                        localIMStorageService.update("message_" + id, message);
                    }
                },
                updateMessageFromDB: function(message) {
                    var uid = message.uid;
                    var count = message.noReadMessages;
                    var showHints = message.showHints;
                    sqliteService.updateLstNoReadMessageCount(uid, showHints, count, function(err, data){
                        if(err!=""){
                            console.log(err);
                        }
                    });  
                },
                deleteMessageId: function(id){
                    var messageId = localIMStorageService.get("messageID");
                    var length = 0;
                    var i = 0;
                    if(!messageId){
                        return null;
                    }
                    length = messageId.length;
                    for(; i < length; i++){
                        if(messageId[i].id === id){
                            messageId.splice(i, 1);
                            break;
                        }
                    }
                    localIMStorageService.update("messageID", messageId);
                },
                deleteMessageFromDB: function(){
                    
                },
                clearMessage: function(message) {
                    var id = 0;
                    if (message) {
                        id = message.id;
                        localIMStorageService.clear("message_" + id);
                    }
                },
                subtractTotalUnReadMsgCount: function(uid, count){
                    var nowCount = localIMStorageService.get("unReads" + uid);
                    if(nowCount){
                        nowCount = nowCount - count;
                    }else{
                        nowCount = 0;
                    }
                    if(nowCount==0){
                        localIMStorageService.clear("unReads" + uid);
                    } else {
                        localIMStorageService.update("unReads" + uid, nowCount);
                    }
                },
                setTotalUnReadMsgCount: function(uid, count){
                    var nowCount = localIMStorageService.get("unReads" + uid);
                    if(nowCount){
                        nowCount = nowCount + count;
                    }else{
                        nowCount = count;
                    }
                    localIMStorageService.update("unReads" + uid, nowCount);
                },
                getTotalUnReadMsgCount: function(uid){
                    var nowCount = localIMStorageService.get("unReads" + uid);
                    return nowCount;
                }
            };
        }
    ]);
