//required modules: node-expat, node-inflow, find the require of them and fix the paths

require.paths.push(__dirname+'/../'); // here is my mouls arae located, /root_folder/deps/modulename

var mongodb=require('./mongodb');
var expat=require('node-expat');
var merger=require('nodejs-clone-extend/merger');
var httprequest = require('node-utils/request/lib/main');

var self=this;

self.collection=null; // set it after initalization

function getspecs(headers,callback)
{
 self.find(headers,
 function(specs)
 {
  var screensize={};
  //console.log(require('sys').inspect(specs.uaprof.RDF.Profile.component.HardwarePlatform,true,2));
  if(specs.uaprof)
  {
   var size=specs.uaprof.RDF[0].component.HardwarePlatform.ScreenSize._value || "340x620";
   //var size=specs.uaprof.RDF.Profile.component.HardwarePlatform.ScreenSize._value || "340x620";
   size=size.split("x");
   screensize.width=size[0];
   screensize.height=size[1];
  }
  else if(specs.wurfl)
  {
   screensize.width=specs.wurfl.group.display.resolution_width;
   screensize.height=specs.wurfl.group.display.resolution_height;
  }
  screensize.width=screensize.width||340;
  screensize.height=screensize.height||620;
  specs.screensize=screensize;
  
  //console.log(require('sys').inspect(screensize,true,2));
  callback(specs);
 });
}this.getspecs=getspecs;

function find(headers,callback)
{
 var agent=headers['x-device-user-agent']||headers['user-agent']||"";
 var uaprofile=headers['x-wap-profile']||headers['profile']||"";
 if(headers['opt'])
 {
  var match=/ns=\d+/.exec(headers['opt']);
  if(match!==null)
  {
   uaprofile= headers[match[0].substring(3,match[0].length)+'-profile'] || uaprofile;
  }
 }
 if(uaprofile.charAt(0)=='"'||uaprofile.charAt(0)=='\'')
 {
  uaprofile=uaprofile.substring(1,uaprofile.length-1);
 }
 var xhtmldevice=false;
 if (headers['accept'])
 {
  xhtmldevice=(headers['accept'].indexOf("application/vnd.wap.xhtml+xml")!=-1 ||
  headers['accept'].indexOf("application/xhtml+xml")!=-1 ||
  headers['accept'].indexOf("application/text+html")!=-1);
 }
 if(uaprofile!="")
 {
  get_profile(uaprofile,function(data){
   callback({'uaprof':data,xhtml:xhtmldevice});
  });
 }
 else
 {
  self.findagent(agent,function(data){
   callback({'wurfl':data,xhtml:xhtmldevice});
  });
 }
};this.find=find;

function get_profile(profileurl,callback)
{
 download_profile(profileurl,callback);
}this.get_profile=get_profile;

function download_profile(profileurl,callback)
{
 httprequest({
   method:'GET',
   uri:profileurl
  },
  function complete(error,response,data)
  {
   var parser=new expat.parser(); // new instance of parser
   //console.log(profileurl);
   //console.log(data); 
   parser.parse(data);
   var specs=parser.root;
   
   if(specs.RDF)
   {
    // array to object implementation:
    if(!(specs.RDF instanceof Array)&&specs.RDF.Description)
    {
     specs.RDF=[specs.RDF.Description];
    }
     
    
    for(var n=0,j=specs.RDF.length;n<j;n++)
    {
     if(specs.RDF[n].component)
     {
      // array to object implementation:
      if(!(specs.RDF[n].component instanceof Array)&&specs.RDF[n].component.Description)
       specs.RDF[n].component=[specs.RDF[n].component.Description];
      var arr=specs.RDF[n].component;
      var obj={};
      for(var i=0,l=arr.length;i<l;i++)
      {
       obj[specs.RDF[n].component[i].Description.ID]=specs.RDF[n].component[i].Description;
      }
      specs.RDF[n].component=obj;
     }
    }     
     
     
     
     
    var arr=specs.RDF;
    var obj={0:specs.RDF[0]};
    for(var i=0,l=arr.length;i<l;i++)
    {
     obj[specs.RDF[i].ID]=specs.RDF[i];
    }
    
    specs.RDF=obj;
   }

   
   delete parser;
   if(error)
    callback(false);
   else
    callback(specs);
 });
}this.download_profile=download_profile;

function save_profile(callback)
{
}

function findagent(agent,callback)
{
 //test://var agent="Mozilla/5.0 (Linux; U; Android 2.2; en-us; PC36100 Build/FRF91) AppleWebKit/533.1 (KHTML, like Gecko) Version/4.0 Mobile Safari/533.1";
 mongodb.findagent(self.collection,agent,function(device)
 {
  if(device===false) callback(false);
  else if(device.fall_back===undefined) callback(device);
  else
  {
   var devices=[];
   find_whileloop(devices,device.fall_back,function ()
   {
    //console.log('len='+devices.length);
    var resultdevice=devices[devices.length-1];
    for(var i=devices.length-2;i>-1;i--)
    {
     merger.extend(resultdevice,devices[i]); // maybe to limit it to two first levels: the groups and the capabilities
    }
    callback(resultdevice);
   }); 
  }
 });
};this.findagent=findagent;

function find_whileloop(devices,id,callback)
{
 mongodb.findid(self.collection,id,function(device)
 {
  if(device!==false)devices.push(device);
  if(device.fall_back!==undefined)
  {
   find_whileloop(devices,device.fall_back,callback);
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
  var xmlparser=new expat.parser();
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
  mongodb.connect("t999_phonespecs",function (collection,db){
  //expat.inspect(self.data.wurfl.devices);
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
     device.group[n].capability=expat.array_to_object(device.group[n].capability,'name');
    }
    device.group=expat.array_to_object(device.group,'id');
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

 //var persist=require('./persist');
 //persist.save(self.data,__dirname+"/wurfl-latest.js",function (){
 //console.log('wurfl-latest.js saved');  
 //});
});
};this.savetodb=savetodb;

function update(callback)
{
 console.log("downloading");
 download(function (){
  console.log('loading wurfl-latest.xml');
  loadxml(function(){
   console.log('saving to database');
   savetodb(function(){
     console.log("update done");
     if(callback) callback();
    });
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
    var headers={};
    //findagent("Mozilla/5.0 (Linux; U; Android 2.2; en-us; PC36100 Build/FRF91) AppleWebKit/533.1 (KHTML, like Gecko) Version/4.0 Mobile Safari/533.1",
    find({'x-wap-profile':"http://nds1.nds.nokia.com/uaprof/N6230ir200.xml"},
    function(specs){
      var screensize={};
      //console.log(require('sys').inspect(specs.uaprof.RDF.Profile.component.HardwarePlatform,true,2));
      if(specs.uaprof)
      {
       var size=specs.uaprof.RDF.Profile.component.HardwarePlatform.ScreenSize._value || "340x620";
       size=size.split("x");
       screensize.width=size[0];
       screensize.height=size[1];
      }
      else 
      {
       screensize.width=specs.wurfl.group.display.resolution_width;
       screensize.height=specs.wurfl.group.display.resolution_height;
      }
      console.log(require('sys').inspect(screensize,true,2));
      db.close();
    });
  });
 });
};this.test=test;
//test();