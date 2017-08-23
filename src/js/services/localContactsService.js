'use strict';

angular.module('copayApp.services')
  .factory('localContactsService', ['localIMStorageService',
        function(localIMStorageService) {
            return {
                init: function(uid, contacts, cb) {
                    console.log("init uid >> " + uid);
                    console.log(contacts);
                    var i = 0;
                    var length = 0;
                    var contactIDs = new Array();
                    
                    if (contacts) {
                        length = contacts.length;
                        for (; i < length; i++) {
                            contactIDs[i] = {
                                fid: contacts[i].follower_id
                            };
                        }
                        localIMStorageService.update("contactIDs" + uid, contactIDs);
                        for (i = 0; i < length; i++) {
                            // console.log("contact_" + contacts[i].id + " >> " + JSON.stringify(contacts[i]));
                            localIMStorageService.update("contact_" + contacts[i].follower_id, contacts[i]);
                        }
                    }
                    
                    cb();
                },
                init_follows: function(uid, contacts, cb) {
                    console.log("init uid >> " + uid);
                    console.log(contacts);
                    var i = 0;
                    var length = 0;
                    var contactIDs = new Array();
                    
                    if (contacts) {
                        length = contacts.length;
                        for (; i < length; i++) {
                            contactIDs[i] = {
                                fid: contacts[i].follower_id
                            };
                        }
                        localIMStorageService.update("followsIDs" + uid, contactIDs);
                        for (i = 0; i < length; i++) {
                            // console.log("contact_" + contacts[i].id + " >> " + JSON.stringify(contacts[i]));
                            localIMStorageService.update("follows_" + contacts[i].follower_id, contacts[i]);
                        }
                    }
                    
                    cb();
                },
                init_fans: function(uid, contacts, cb) {
                    console.log("init uid >> " + uid);
                    console.log(contacts);
                    var i = 0;
                    var length = 0;
                    var contactIDs = new Array();
                    
                    if (contacts) {
                        length = contacts.length;
                        for (; i < length; i++) {
                            contactIDs[i] = {
                                fid: contacts[i].fans_id
                            };
                        }
                        localIMStorageService.update("fansIDs" + uid, contactIDs);
                        for (i = 0; i < length; i++) {
                            // console.log("contact_" + contacts[i].id + " >> " + JSON.stringify(contacts[i]));
                            localIMStorageService.update("fans_" + contacts[i].fans_id, contacts[i]);
                        }
                    }
                    
                    cb();
                },
                getAllContacts: function(uid) {
                    console.log("get contacts by uid>> " + uid);
                    var contacts = new Array();
                    var i = 0;
                    var contactIDs = localIMStorageService.get("contactIDs" + uid);
                    console.log(contactIDs);
                    var length = 0;
                    var contact = null;
                    if (contactIDs) {
                        length = contactIDs.length;
                        for (; i < length; i++) {
                            contact = localIMStorageService.get("contact_" + contactIDs[i].fid);
                            console.log(contact);
                            if(contact){
                                contacts.push(contact);
                            }
                        }
                        return contacts;
                    }
                    return null;

                },
                getAllFans: function(uid) {
                    console.log("get fans by uid>> " + uid);
                    var contacts = new Array();
                    var i = 0;
                    var contactIDs = localIMStorageService.get("fansIDs" + uid);
                    console.log(contactIDs);
                    var length = 0;
                    var contact = null;
                    if (contactIDs) {
                        length = contactIDs.length;
                        for (; i < length; i++) {
                            contact = localIMStorageService.get("fans_" + contactIDs[i].fid);
                            console.log(contact);
                            if(contact){
                                contacts.push(contact);
                            }
                        }
                        return contacts;
                    }
                    return null;

                },
                getAllFollows: function(uid) {
                    console.log("get fans by uid>> " + uid);
                    var contacts = new Array();
                    var i = 0;
                    var contactIDs = localIMStorageService.get("followsIDs" + uid);
                    console.log(contactIDs);
                    var length = 0;
                    var contact = null;
                    if (contactIDs) {
                        length = contactIDs.length;
                        for (; i < length; i++) {
                            contact = localIMStorageService.get("follows_" + contactIDs[i].fid);
                            console.log(contact);
                            if(contact){
                                contacts.push(contact);
                            }
                        }
                        return contacts;
                    }
                    return null;

                },
                getContactById: function(fid){                          //
                    return localIMStorageService.get("contact_" + fid);
                },
                // getAmountContactById: function(num, id){
                //     var contacts = [];
                //     var contact = localIMStorageService.get("contact_" + id).contact;
                //     var length = 0;
                //     if(num < 0 || !contact) return;
                //     length = contact.length;
                //     if(num < length){
                //         contacts = contact.splice(length - num, length); 
                //         return contacts;  
                //     }else{
                //         return contact;
                //     }
                // },
                updateContact: function(contact) {
                    var fid = "";
                    if (contact) {
                        fid = contact.follower_id;
                        localIMStorageService.update("contact_" + fid, contact);
                    }
                },
                deleteContactId: function(uid, fid){
                    var contactIds = localIMStorageService.get("contactIDs" + uid);
                    var length = 0;
                    var i = 0;
                    if(!contactIds){
                        return null;
                    }
                    length = contactIds.length;
                    for(; i < length; i++){
                        if(contactIds[i].fid === fid){
                            contactIds.splice(i, 1);
                            break;
                        }
                    }
                    localIMStorageService.update("contactIDs" + uid, contactIds);
                },
                deleteApplyFansId: function(uid, fid){
                    var contactIds = localIMStorageService.get("fansIDs" + uid);
                    console.log("applyFans ----------------");
                    console.log(contactIds);
                    var length = 0;
                    var i = 0;
                    if(!contactIds){
                        return null;
                    }
                    length = contactIds.length;
                    for(; i < length; i++){
                        console.log("[i].fid-> " + contactIds[i].fid);
                        if(contactIds[i].fid === fid){
                            contactIds.splice(i, 1);
                            break;
                        }
                    }
                    console.log(contactIds);
                    localIMStorageService.update("fansIDs" + uid, contactIds);
                },
                deleteApplyFollowsId: function(uid, fid){
                    var contactIds = localIMStorageService.get("followsIDs" + uid);
                    var length = 0;
                    var i = 0;
                    if(!contactIds){
                        return null;
                    }
                    length = contactIds.length;
                    for(; i < length; i++){
                        if(contactIds[i].fid === fid){
                            contactIds.splice(i, 1);
                            break;
                        }
                    }
                    localIMStorageService.update("followsIDs" + uid, contactIds);
                },
                clearContact: function(contact) {
                    var fid = 0;
                    if (contact) {
                        fid = contact.follower_id;
                        localIMStorageService.clear("contact_" + fid);
                    }
                },
                setNewFollowsApplyCount: function(uid, count){
                    var nowCount = localIMStorageService.get("newFollows" + uid);
                    if(nowCount){
                        nowCount = nowCount + count;
                    }else{
                        nowCount = count;
                    }
                    localIMStorageService.update("newFollows" + uid, nowCount);
                },
                setNewFansApplyCount: function(uid, count){ 
                    var nowCount = localIMStorageService.get("newFans" + uid);
                    if(nowCount){
                        nowCount = nowCount + count;
                    }else{
                        nowCount = count;
                    }
                    console.log("set new friends >>" + nowCount);
                    localIMStorageService.update("newFans" + uid, nowCount);
                },
                getNewFollowsApplyCount: function(uid){
                    var follows = localIMStorageService.get("newFollows" + uid);
                    return follows;
                },
                getNewFansApplyCount: function(uid){
                    var fans = localIMStorageService.get("newFans" + uid);
                    return fans;
                },
                clearNewFansApplyCount: function(uid){
                    localIMStorageService.clear("newFans" + uid);
                }
            };
        }
    ]);
