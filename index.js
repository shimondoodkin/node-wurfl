//required modules: node-expat, node-inflow, find the require of them and fix the paths
var mongodb=require('./mongodb');
var expatparser=require('../node-expat').parser;

var self=this;


{
 collection.findOne({'id':id}, function(err, docu) { 
  callback(docu || false ); 
 });
});this.findid=findid;

findagent(collection,agent,callback)

this.findagent=mongodb.findagent; //mongodb.findid(collection,id,callback)
this.findid=mongodb.findid;

function loadxml(callback)
{
 require('fs').readFile(__dirname+'/wurfl-latest.xml', 'utf-8',function (err, data) {
  if (err) throw err;
  var xmlparser=new expatparser();
  xmlparser.parse(data);
  self.data=xmlparser.root;
  callback();
 });
}this.loadxml=loadxml;

 
function download(callback) // not sure if it works but it is an idea
{
 var sys   = require('sys'),
     exec  = require('child_process').exec,
    child;
 child = exec(__dirname+'/download.sh', 
  function (error, stdout, stderr) {
    if (error !== null) {
      console.log('exec error: ' + error);
    }
    callback();
 });
}this.download=download;

function savetodb(callback)
{
 console.log('loading wurfl-latest.xml');
 loadxml(function(){
 console.log('done');
  mongodb.connect("t999_phonespecs",function (collection,db){
   //expatparser.inspect(self.data.wurfl.devices);
   var inflow= require('../node-inflow');
   var devices=self.data.wurfl.devices.device;
   
   inflow.each({},devices,function(device,key)
   {
    next=this;
    //change the structure from arrays to objects
    if(device.group===undefined)
    {
     // fallback devices do not contain group
     //console.log(require('sys').inspect(device,true,3));
    }
    else
    {
     for(var n=0,l=device.group.length;n<l;n++)
     {
      //console.log(n);
      device.group[n].capability=expatparser.array_to_object(device.group[n].capability,'name');
     }
     device.group=expatparser.array_to_object(device.group,'id');
    }
    //console.log(require('sys').inspect(device,true,3));
    //db.close();
    //process.exit();
    // save it
    mongodb.savereplace(collection,{id:device.id},device,function ()
    {
     console.log(key);
     next();
    });
    
   },function(){
     console.log('mongodb save done');
     db.close();
     callback();
   });
  });
  //var persist=require('./persist');
  //persist.save(self.data,__dirname+"/wurfl-latest.js",function (){
  //console.log('wurfl-latest.js saved');  
  //});
});
};this.savetodb=savetodb;

function update(callback)
{
 download(function (){
  savetodb(function(){
   console.log("finish update");
   if(callback) callback();
  });
 });
}this.update=update;