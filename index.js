//required modules: node-expat, node-inflow, find the require of them and fix the paths

require.paths.push(__dirname+'/../'); // here is my mouls arae located, /root_folder/deps/modulename

var mongodb=require('./mongodb');
var expatparser=require('node-expat').parser;
var merger=require('nodejs-clone-extend/merger');

var self=this;

self.collection=null; // set it after initalization



function findspecs(agent,callback)
{
 mongodb.findagent(self.collection,agent,function(device)
 {
  if(device===false) callback(false);
  else if(device.fall_back===undefined) callback(device);
  else
  {
   var devices=[];
   findspecs_whileloop(devices,device.fall_back,function ()
   {
    console.log('len='+devices.length);
    var resultdevice=devices[devices.length-1];
    for(var i=devices.length-2;i>-1;i--)
    {
     merger.extend(resultdevice,devices[i]); // maybe to limit it to two first levels: the groups and the capabilities
    }
    callback(resultdevice);
   }); 
  }
 });
};this.findspecs=findspecs;

function findspecs_whileloop(devices,id,callback)
{
 mongodb.findid(self.collection,id,function(device)
 {
  if(device!==false)devices.push(device);
  if(device.fall_back!==undefined)
  {
   findspecs_whileloop(devices,device.fall_back,callback);
  }
  else
  {
   callback();
  }
 });   
}
//todo: develop option to search backwards from capability to device

//this.findagent=mongodb.findagent; //mongodb.findid(collection,id,callback)
//this.findid=mongodb.findid;
  
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
//update(); // uncomment this and execute: node index.js

function test()
{
 mongodb.connect("t999_phonespecs",function (collection,db)
 {
  self.collection=collection;
  mongodb.index(self.collection,function (){
    findspecs("Mozilla/5.0 (Linux; U; Android 2.2; en-us; PC36100 Build/FRF91) AppleWebKit/533.1 (KHTML, like Gecko) Version/4.0 Mobile Safari/533.1",function(device){
      console.log(require('sys').inspect(device.group));
      
      ///Math.min(device.group.display.max_image_width,device.group.display.resolution_width)
      //Math.min(device.group.display.max_image_height,device.group.display.resolution_height)
      db.close();
    });
  });
 });
};this.test=test;
//test();