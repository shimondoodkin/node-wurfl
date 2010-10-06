//required modules: node-expat, node-inflow, find the require of them and fix the paths

var self=this;
function search_agent(agent)
{
// usage
// var expat = require('./deps/node-expat');
//
// var parser=expat.parser(); // new instance of parser
// parser.parser.parse( data, false );
// parser.root.children['html'][0].text
// parser.root.children['html'][0].children['body'].att['bgcolor'];
// parser.root.children['html'][0].children['head'][0].children['media'].att['title'];
// parser.root.children['html'][0].children['head'][0].nschildren['fb:media'].att['title'];
//

}this.agent=search_agent;

function search_id(id)
{

}this.id=search_id;


function loadxml(callback)
{
 var expatparser=require('../node-expat').parser;
 require('fs').readFile(__dirname+'/wurfl-latest.xml', 'utf-8',function (err, data) {
  if (err) throw err;
  var xmlparser=new expatparser();
  xmlparser.parse(data);
  self.data=xmlparser.root;
  callback();
 });
}this.loadxml=loadxml;

function inspect(obj)
{
 if(typeof obj!=='object') console.log(require('sys').inspect(obj));
 else for(var n in obj) console.log(n);
}
 
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

console.log('loading wurfl-latest.xml');
loadxml(function(){
 console.log('done');
  var mongodb=require('./mongodb');
  mongodb.connect("t999_phonespecs",function (collection,db){
   //inspect(self.data.wurfl.devices);
   var inflow= require('../node-inflow');
   var devices=self.data.wurfl.devices.device;
   
   inflow.each({},devices,function(device,key)
   {
    next=this
    mongodb.savereplace(collection,{id:device.id},device,function ()
    {
     console.log(key);
     next();
    });
   },function(){
     console.log('mongodb save done');
     db.close();
   });
  });
  //var persist=require('./persist');
  //persist.save(self.data,__dirname+"/wurfl-latest.js",function (){
  //console.log('wurfl-latest.js saved');  
  //});
});

