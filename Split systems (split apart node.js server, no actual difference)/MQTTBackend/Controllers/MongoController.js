
"use strict";

var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://80.240.137.162:27017";

module.exports = {

    //All of this stuff came from the mongodb docs & lessons, leaving source just incase
    //https://docs.mongodb.com/manual/

    /**
     * This should insert the record insertval into the db
     * @param dbName This is the db you want to insert into
     * @param collection this is the collection you want to insert into
     * @param insertVal This is  the val you want to insert
     * @param callback This wil be run after the insertion into the db
     */
     insertIntoDB : function insertIntoDb(dbName, collection, insertVal, callback) {
        MongoClient.connect(url, function (err, client) {
            if (err) throw err;
            var user_collection = client.db(dbName).collection(collection);
            user_collection.insertOne(insertVal, function (err, res) {
                if (err) throw err;
                if (callback){
                    callback();
                }
            });
            client.close();

        });
    },

    /**
     * This should find the first value in the specified collection that match the string
     * @param dbName This is the db you want to find from
     * @param collection this is the collection you want to find from
     * @param searchVal This val will be used to find all records containing the search val
     * @param callback finishes the code
     */
    findFromDB : function findFromDB(dbName, collection, searchVal, callback) {
        MongoClient.connect(url, function (err, client) {
            if (err) throw err;
            var user_collection = client.db(dbName).collection(collection);
            user_collection.findOne(searchVal, function (err, res) {
                    if (err) throw err;
                    if(callback)
                            callback(null,res);
                        client.close();
                });
        });

    },
    /**
     * This should find all values in the specified collection that match the string and pass an array to the callback
     * @param dbName This is the db you want to find from
     * @param collection this is the collection you want to find from
     * @param searchVal This val will be used to find all records containing the search val
     * @param callback finishes the code
     */
    findMultipleFromDB : function findMultipleFromDb(dbName, collection, searchVal, callback){
        MongoClient.connect(url, function (err, client) {
            if (err) throw err;
            var user_collection = client.db(dbName).collection(collection);
            //https://docs.mongodb.com/manual/tutorial/iterate-a-cursor/#read-operations-cursors
            user_collection.find(searchVal, function (err, res) {
                if (err) throw err;
                res.toArray(function (err,resOfArray){
                    if(callback)
                        callback(null,resOfArray);
                })
                client.close();
            });
        });
    },

    /**
     *This should delete either one or multiple records matching the item
     * @param dbName This is the db you want to delete from
     * @param collection this is the collection you want to delete from
     * @param searchVal This val is used to find all/one records matching it depending on multiples val
     * @param multiple This is a bool passed in to say if you want multiple records deleted or not
     */
    deleteRecordsFromDb : function deleteRecordsFromDb(dbName, collection, searchVal, multiple, callback) {
        MongoClient.connect(url, function (err, client) {
            if (err) throw err;
            var user_collection = client.db(dbName).collection(collection);
            if (multiple) {
                user_collection.deleteMany(searchVal, function (err, res) {
                    if (err) throw err;
                    if (callback)
                        callback(err,res);
                });
            } else {
                user_collection.deleteOne(searchVal, function (err, res) {
                    if (err) throw err;
                    if (callback)
                        callback(err,res);
                });
            }
            client.close();
        });
    },

    /***
     * This should update multiple records to have the new values
     * REMINDER, this needs the old values otherwise they will be overwritten
     * @param dbName This is the db you want to update in
     * @param collection this is the collection you want to update in
     * @param searchVal This is the value to search for in the collection
     * @param updateTo This is what you want all the records to update too
     */
    updateDb : function updateDb(dbName, collection, searchVal, updateTo,callback) {
        MongoClient.connect(url, function (err, client) {
            if (err) throw err;
            var user_collection = client.db(dbName).collection(collection);
            user_collection.updateMany(searchVal, updateTo, function (err, res) {
                if (err) throw err;
                if (callback) callback(err,res);
            });
            client.close();
        });
    },
    /***
     * This should update one record
     * @param dbName This is the db you want to update in
     * @param collection this is the collection you want to update in
     * @param searchVal This is the value to search for in the collection
     * @param updateTo This is what you want all the records to update too
     */
    updateOneInDb : function updateOneInDb(dbName, collection, searchVal, updateTo,callback) {
        MongoClient.connect(url, function (err, client) {
            if (err) throw err;
            var user_collection = client.db(dbName).collection(collection);
            user_collection.replaceOne(searchVal, updateTo, {},function (err, res) {
                if (err) throw err;
                if (callback){
                    callback(err,res);
                }
            });
            client.close();
        });
    },

    /**
     * This will go through the cookie db and delete every cookie that has expired
     */
    deleteAllControls : function deleteAllControls(){
        MongoClient.connect(url, function (err,client){
            if (err) throw err;
            var user_collection = client.db("StoredVals").collection("TempControls");
            user_collection.find({}).forEach(function (myDoc){
               user_collection.removeOne(myDoc);

            });
        })
    },
    /**
     * This will extend the specified cookie in the db
     * @param uuid This is the cookie to search for
     */
    extendCookieInDb : function ExtendCookieInDb(uuid){
        MongoClient.connect(url, function (err,client){
            if (err) throw err;
            var user_collection = client.db("WebProject").collection("Cookie");
            user_collection.findOneAndUpdate({"uuid": uuid}, {$set: {"expiration":Date.now()+1800000}}, {upsert:true},function (err, res) {
                if (err) throw err;
            });
            client.close();
        })
    },
    /**
     * This will delete the specified cookie
     * @param uuid The cookie to search for
     */
    deleteCookieFromDb : function deleteCookieFromDb(uuid){
        MongoClient.connect(url, function (err,client){
            if (err) throw err;
            var user_collection = client.db("WebProject").collection("Cookie");
            user_collection.removeOne({"uuid": uuid},function (err, res) {
                if (err) throw err;
            });
            client.close();
        })
    }
}

