
var mongo = require('node-mongodb-native/lib/mongodb');
  
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

function findid(collection,id,callback)
{
 collection.findOne({'id':id}, function(err, docu) { 
  callback(docu || false ); 
 });
};this.findid=findid;

// maybe add mongodb option slice to group.display if i need only display
function find(collection,search,callback)
{
 collection.findOne(search, function(err, docu) { 
  callback(docu || false ); 
 });
};this.find=find;

function findagent(collection,agent,callback)
{
 collection.findOne({'user_agent':agent}, function(err, docu) { 
  callback(docu || false ); 
 });
};this.findagent=findagent;

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

function index(collection,callback)
{
 collection.createIndex([['agent']],function(err, indexName){
  collection.createIndex([['id']],function(err, indexName){
   callback();
  });
 });
};this.index=index;

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
