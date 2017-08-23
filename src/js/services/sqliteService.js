'use strict';

angular.module('copayApp.services').service('sqliteService', function() {
    var root = {};
    root.db;
    root.lstmsgs = [];
    root.currentPrivateMsgs = [];
    
    /**
     * 创建人人比特最新消息列表表
     */
    var SQL_CREATE_LSTMSGS = getString(function(){/*
    CREATE TABLE IF NOT EXISTS [tblRRBLstMsgs] (
    [id] INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    [uid] CHAR(32) NOT NULL UNIQUE,
    [fName] CHAR(255) NOT NULL,
    [fHead] CHAR(64) DEFAULT NULL,
    [fHeadBig] CHAR(64) DEFAULT NULL,
    [lstMsg] TEXT,
    [noReadMessages] INT DEFAULT 0,
    [showHints] INT NOT NULL DEFAULT 1,
    [isTop] INT NOT NULL DEFAULT 0
    )
    */}).trim();


    root.load = function(cb) {
        // window.sqlitePlugin.deleteDatabase({ name: "rrbit.db" });   //测试时使用删除
        root.db = window.sqlitePlugin.openDatabase({name: 'rrbit.db', location: 'default'});
        cb();    
    };

    /**
     * 插入或最新的聊天历史列表
     */
    root.insertLstMsg = function(uid, fname, fhead, fheadbig, lstMsg, noReadMessages, showHints, isTop, cb){
        var err = '';
        root.db.transaction(function(tx) {
            tx.executeSql(SQL_CREATE_LSTMSGS);
                                                                            //sqlite中自增加id插个空
            tx.executeSql('REPLACE INTO tblRRBLstMsgs VALUES (?,?,?,?,?,?,?,?,?)', [ , uid, fname, fhead, fheadbig, lstMsg, noReadMessages, showHints, isTop]);
        }, function(error) {
            cb(error);
            console.log('Transaction ERROR: ' + error.message);
        }, function() {
            console.log('LstMsg Populated database OK');
            cb(err);
        });
    }

    /**
     * 更新聊天记录联系人头像
     */
    root.updateLstMsgHead = function(uid, fhead, cb){
        var sql = "UPDATE tblRRBLstMsgs SET fhead = '" + fhead + "' WHERE uid = '" + uid + "'";
        root.db.executeSql(sql, [], function(rs) {
            console.log('update table OK');
            var err = "";
            cb(err);
        }, function(error) {
            console.log('SELECT SQL statement ERROR: ' + error.message);
            cb(error)
        });
    }

    /**
     * 更新聊天记录未读数量
     */
    root.updateLstNoReadMessageCount = function(uid, showHints, noReadMessages, cb){
        var sql = "UPDATE tblRRBLstMsgs SET showHints = " + showHints + ", noReadMessages = " + noReadMessages + " WHERE uid = '" + uid + "'";
        root.db.executeSql(sql, [], function(rs) {
            console.log('update table OK');
            var err = "";
            cb(err);
        }, function(error) {
            console.log('SELECT SQL statement ERROR: ' + error.message);
            cb(error)
        });
    }

    /**
     * 插入好友聊天记录，一个好友一表
     */
    root.insertFriendMsg = function(fid, content, isFromMe, isMsgShow, isReceiveShow, isSendShow, txUnit, txAmount, time, flag, cb){
        var err = "";
        var tbName = "rrb_" + fid;
        root.db.transaction(function(tx) {
            tx.executeSql('CREATE TABLE IF NOT EXISTS [' + tbName + '] (' +
                          '[id] INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,' + 
                          '[content] TEXT,' +
                          '[isFromMe] INT NOT NULL DEFAULT 0,' +
                          '[isMsgShow] INT NOT NULL DEFAULT 0,' +
                          '[isReceiveShow] INT NOT NULL DEFAULT 0,' +
                          '[isSendShow] INT NOT NULL DEFAULT 0,' +
                          '[txUnit] INT NOT NULL DEFAULT 0,' +
                          '[txAmount] DOUBLE NOT NULL DEFAULT 0.00,' +
                          '[time] CHAR(20) NOT NULL,' +
                          '[flag] INT NOT NULL DEFAULT 1' +
                          ')');
                                                                                    //sqlite中自增加id插个空
            tx.executeSql('INSERT INTO ' + tbName + ' VALUES (?,?,?,?,?,?,?,?,?,?)', [ , content, isFromMe, isMsgShow, isReceiveShow, isSendShow, txUnit, txAmount, time, flag]);
        }, function(error) {
            console.log('Transaction ERROR: ' + error.message);
            cb(error);
        }, function() {
            console.log('FriendMsg Populated database OK');
            cb(err);
        });
    }

    /**
     * 更新发送成功状态
     */
    root.updateFriendMsgFlag = function(fid, isFromMe, time, flag, cb){
        var tbName = "rrb_" + fid;
        var sql = "UPDATE " + tbName + " SET flag = '" + flag + "' WHERE isFromMe = " + isFromMe + " AND time = '" + time + "'";
        root.db.executeSql(sql, [], function(rs) {
            console.log('update table OK');
            var err = "";
            cb(err);
        }, function(error) {
            console.log('SELECT SQL statement ERROR: ' + error.message);
            cb(error)
        });
    }

    /**
     * 获取用户私信信息列表
     */
    root.findFriendMsgs = function(from, num, fid, cb){
        var tbName = "rrb_" + fid;
        var sql = "SELECT * FROM [" + tbName + "] order by date(time) desc, time(time) desc limit " + from + ", " + num;
        var err = "";
        root.db.transaction(function(tx) {
            tx.executeSql('CREATE TABLE IF NOT EXISTS [' + tbName + '] (' +
                          '[id] INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,' + 
                          '[content] TEXT,' +
                          '[isFromMe] INT NOT NULL DEFAULT 0,' +
                          '[isMsgShow] INT NOT NULL DEFAULT 0,' +
                          '[isReceiveShow] INT NOT NULL DEFAULT 0,' +
                          '[isSendShow] INT NOT NULL DEFAULT 0,' +
                          '[txUnit] INT NOT NULL DEFAULT 0,' +
                          '[txAmount] INT NOT NULL DEFAULT 0,' +
                          '[time] CHAR(20) NOT NULL,' +
                          '[flag] INT NOT NULL DEFAULT 1' +
                          ')');


            tx.executeSql(sql, [], function(tx, rs) {
                root.currentPrivateMsgs = toModels(rs.rows).reverse();
                cb(err, root.currentPrivateMsgs);
            }, function(tx, error) {
                console.log('SELECT error: ' + error.message);
                cb(error);
            });
        });
    }

    /**
     * 获取某人最新消息记录
     */
    root.findOnelstMsgs = function(fid, cb){
        var err = "";
        root.db.transaction(function(tx) {
            tx.executeSql(SQL_CREATE_LSTMSGS);
            
            tx.executeSql('SELECT * FROM tblRRBLstMsgs WHERE uid="' + fid + '"', [], function(tx, rs) {
                var oneLstMsg = toModels(rs.rows);
                cb(err, oneLstMsg);
            }, function(tx, error) {
                console.log('SELECT error: ' + error.message);
                cb(error);
            });
        });
    }

    /**
     * 获取最近消息记录数量
     */
    root.countLstMsgs = function(fid){
        var tbName = "rrb_" + fid;
        root.db.transaction(function(tx) {
            tx.executeSql('SELECT count(*) AS mycount FROM tblRRBLstMsgs', [], function(tx, rs) {
                console.log('Record count : ' + rs.rows.item(0).mycount);
            }, function(tx, error) {
                console.log('SELECT COUNT error: ' + error.message);
            });
        });
    }

    /**
     * 获取某人消息记录数量
     */
    root.countOneMsgs = function(){
        root.db.transaction(function(tx) {
            tx.executeSql('SELECT count(*) AS mycount FROM tblRRBLstMsgs', [], function(tx, rs) {
                console.log('Record count : ' + rs.rows.item(0).mycount);
            }, function(tx, error) {
                console.log('SELECT COUNT error: ' + error.message);
            });
        });
    }

    /**
     * 获取最新消息列表
     */
    root.findAllLstMsgs = function(cb) {
        var err = "ok";
        root.db.transaction(function(tx) {
            tx.executeSql(SQL_CREATE_LSTMSGS);
            
            tx.executeSql('SELECT * FROM tblRRBLstMsgs', [], function(tx, rs) {
                root.lstmsgs = toModels(rs.rows);
                cb(err, root.lstmsgs);
            }, function(tx, error) {
                console.log('SELECT error: ' + error.message);
                cb(error);
            });
        });
    };

    root.findbyId = function(id) {
        var deferred = $.Deferred();
        root.db.transaction(function(tx) {
            tx.executeSql("select * from tblRRBLstMsgs where id = ?", [~~id], function(tx, r) {
                var m = r.rows.length == 0 ? null : toModel(r.rows.item(0));
                deferred.resolve(m);
            });
        });

        return deferred.promise();
    };

    /**
     * 从消息列表中删除某人的消息记录
     */
    root.deleteOneLstMsgs = function(uid){
        root.db.executeSql('DELETE FROM tblRRBLstMsgs where uid="' + uid + '"', [], function(rs) {
            console.log('delete data OK');
        }, function(error) {
            console.log('SELECT SQL statement ERROR: ' + error.message);
        });
    }

    /**
     * 删除某张表
     */
    root.dropTBByUid = function(uid){
        var tbName = "rrb_" + uid;
        root.db.executeSql('DROP TABLE IF EXISTS "' + tbName + '"', [], function(rs) {
            console.log('drop table OK');
        }, function(error) {
            console.log('SELECT SQL statement ERROR: ' + error.message);
        });
    }

    root.dropTB = function(){
        root.db.executeSql('DROP TABLE IF EXISTS tblRRBLstMsgs', [], function(rs) {
            console.log('drop table OK');
        }, function(error) {
            console.log('SELECT SQL statement ERROR: ' + error.message);
        });
    }

    function toModel(item) {
        var model = {};
        Object.keys(item).forEach(function(key) {
            // 将下划线名称替换为 camel 命名法名称
            var k = /_/.test(key) ? key.replace(/_(.)/g, function(m) {
                    return m[1].toUpperCase();
                }) : key;

            model[k] = item[key];
        });
        return model;
    };

    function toModels(rows) {
        var models = [];
        for (var i = 0; i < rows.length; i++) {
            models.push(toModel(rows.item(i)));
        }
        return models;
    };

    /**
     * 替换sql中注释
     * 代码美观用
     */
    function getString(s) {
        return s.toString().replace(/^\s*function.*?\/\*|\*\/\s*\}\s*$/g, "");
    }

    return root;

});
