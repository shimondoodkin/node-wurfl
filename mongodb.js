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
db.addListener("error", function(error) { console.log("Error connecting to mongo -- perhaps it isn't running?"); process.exit(-1); });
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

function savereplace(collection,search,object,callback)
{
 collection.find(search,function (error,cursor){
  cursor.toArray(function (err, docs){
    if(docs.length==0)
    {
     collection.insert(object,function(err,doc){
      callback();
     });
    }
    else
    if(docs.length==1)
    {
     object._id=docs[0]._id;
     collection.save(object,function(err,doc){
      callback();
     });
     //update id and save doc
    }
    else
    {
     object._id=docs[0]._id; // is ths good?, accidencily copied here, seems yes
     collection.remove(search,function(err,redoc){
      collection.save(object,function(err,svdoc){
       callback();
       });
     });
     // remove all and insert
    }
  });
 });
};this.savereplace=savereplace;

function connect(collectionname,callback)
{
 db_open_auth(function(p_db)
 {
  console.log("connected to database");
  //db.createCollection(collectionname, function(err, collection) {
  db.collection(collectionname, function(err, collection)
  {
   callback(collection,db);
  });
  //});
 });
}this.connect=connect;