'use strict';

angular.module('copayApp.services')
  .factory('dateService', [function() {
        return {
            handleMessageDate: function(messages) {
                var i = 0,
                    length = 0,
                    messageDate = {},
                    nowDate = {},
                    weekArray = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"],
                    diffWeekValue = 0;
                if (messages) {
                    nowDate = this.getNowDate();
                    length = messages.length;
                    for (i = 0; i < length; i++) {
                        messageDate = this.getMessageDate(messages[i]);
                        if(!messageDate){
                            return null;
                        }
                        if (nowDate.year - messageDate.year > 0) {
                            messages[i].lstMsg.time = messageDate.year + "";
                            continue;
                        }
                        if (nowDate.month - messageDate.month >= 0 ||
                            nowDate.day - messageDate.day > nowDate.week) {
                            messages[i].lstMsg.time = messageDate.month +
                                "月" + messageDate.day + "日";
                            continue;
                        }
                        if (nowDate.day - messageDate.day <= nowDate.week &&
                            nowDate.day - messageDate.day > 1) {
                            diffWeekValue = nowDate.week - (nowDate.day - messageDate.day);
                            messages[i].lstMsg.time = weekArray[diffWeekValue];
                            continue;
                        }
                        if (nowDate.day - messageDate.day === 1) {
                            messages[i].lstMsg.time = "昨天";
                            continue;
                        }
                        if (nowDate.day - messageDate.day === 0) {
                            messages[i].lstMsg.time = messageDate.hour + ":" + messageDate.minute;
                            continue;
                        }
                    }
                    // console.log(messages);
                    // return messages;
                } else {
                    console.log("messages is null");
                    return null;
                }

            },
            getNowDate: function() {
                var nowDate = {};
                var date = new Date();
                nowDate.year = date.getFullYear();
                nowDate.month = date.getMonth();
                nowDate.day = date.getDate();
                nowDate.week = date.getDay();
                nowDate.hour = date.getHours();
                nowDate.minute = date.getMinutes();
                nowDate.second = date.getSeconds();
                return nowDate;
            },
            getMessageDate: function(message) {
                // console.log("message lstMsgObj--------------------------------------------");
                // console.log(JSON.stringify(message.lstMsg));
                var messageDate = {};
                var messageTime = "";
                //2015-10-12 15:34:55
                var reg = /(^\d{4})-(\d{1,2})-(\d{1,2})\s(\d{1,2}):(\d{1,2}):(\d{1,2})/g;
                var result = new Array();
                if (message) {
                    if (typeof message.lstMsg === 'string'){     //盘读时字符还时Json对象
                        message.lstMsg = JSON.parse(message.lstMsg);
                    }
                    messageTime = message.lstMsg.originalTime;
                    
                    // console.log("--------------------------------------------");
                    // console.log("msg time : " + messageTime);
                    result = reg.exec(messageTime);
                    if (!result) {
                        console.log("result is null");
                        return null;
                    }
                    messageDate.year = parseInt(result[1]);
                    messageDate.month = parseInt(result[2]);
                    messageDate.day = parseInt(result[3]);
                    messageDate.hour = parseInt(result[4]);
                    messageDate.minute = parseInt(result[5]);
                    messageDate.second = parseInt(result[6]);
                    // console.log(messageDate);
                    return messageDate;
                } else {
                    console.log("message is null");
                    return null;
                }
            }
        };
    }]);
