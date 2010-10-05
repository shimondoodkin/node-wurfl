var sys = require('sys');   // allaws to write to application streams (write to log)
var http = require('http'); // allaws to create http server
var mongo = require('../node-mongodb-native/lib/mongodb'); 

var app={
 database:{
  //username:"",
  //password:"",
  //
  port:27017,
  host:'localhost',
  name:'pijimi',
 }
}

db = new mongo.Db(app.database.name, new mongo.Server(app.database.host, app.database.port, {}), {});
db.addListener("error", function(error) { sys.puts("Error connecting to mongo -- perhaps it isn't running?"); process.exit(-1); });

function db_open_auth(callback)
{
 if(app.database.username)
 {
  db.open(function(p_db)
  {
   p_db.authenticate(app.database.username, app.database.password, function(err, replies) {
     if(err) throw  err;
     callback(p_db);
   });
  });
 }
 else
 {
  db.open(function(p_db)
  {
    callback(p_db);
  });
 }
}

db_open_auth(function(p_db)
{
 console.log("connected to database");
 //db.createCollection('test_insert', function(err, collection) {
 db.collection('test_insert', function(err, collection)
 {
  collection.insert({a:2}, function(err, docs)
  {
  });
 });
 //});
});