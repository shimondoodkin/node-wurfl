var fs=require('fs');

function stringify_stats(a,stats,context)
{
 var clean_context;
 if(typeof a === 'object')
 {
  if(!context)
  {
   clean_context=true;
   stats=[a];
   context=[];   
  }
  else
  {
   a_pos=context.indexOf(a);
   if( a_pos!=-1 )
   {
    if(stats.indexOf(a)==-1)
    {
     stats.push(a);
    }
    return;
   }
  }
  if(context.length%1000==0) console.log(context.length)
  context.push(a);
     
  if (a instanceof Array)
  {
   for(var l=a.length,key=0;key<l;key++)
   {
    if(typeof a[key] === 'object' && a[key] !== null)
     stringify_stats(a[key], stats, context );
   }
  }
  else
  {
   var comma=false
   for (key in a)
   {
    if(Object.prototype.hasOwnProperty.call(a, key))
    {
     if(typeof a[key] === 'object' && a[key] !== null)
      stringify_stats(a[key],stats,context );
    }
   }
  }
  if(clean_context)
  {
   delete context;
   return stats;
  }
 }
 else
  return [];
}

function stringify_var(a,file)
{
 if(a === undefined)
 {
  if(file)
  {
   file.write('undefined');
   return;
  }
  else
   return 'undefined';
 }
 else if(typeof a === 'object' && a === null)
 {
  if(file)
  {
   file.write('null');
   return;
  }
  else
   return 'null';
 }
 else if(a instanceof Date)
 {
  if(file)
  {
   file.write('new Date("'+a.toString()+'")');
   return;
  }
  else
   return 'new Date("'+a.toString()+'")';
 }
 else
 {
  if(file)
   file.write(JSON.stringify(a));
  else
   return JSON.stringify(a);
 }
}

function stringify(a        ,varname,prefix ,sufix,file,callback,context,stats      )
{
 var out,clean_context;
 if(typeof a !== 'object')
 {
  if(file)
   file.write(JSON.stringify(a))
  else
   out=JSON.stringify(a);
  return;
 }
 else
 {
  if(context===undefined)
  { 
   clean_context=true;
   if(!varname) varname='self';
   if(!prefix) prefix='';
   if(!sufix) sufix='';
   context=[];
   stats=stringify_stats(a); // find used self references
   console.log('stats done');
   // put the first element and the stack in.    
   out=prefix+'var '+varname+'_temp=[],'+varname+'='+varname+'_temp[0]=';
   if(file)file.write(out);
  }
  else
  {
   out="";
   a_pos=context.indexOf(a);
   if( a_pos!=-1 )
   {
    a_pos=stats.indexOf(a);
    if( a_pos!=-1 )
    {
     if(file){file.write(varname+"_temp["+a_pos+"]"); return;}
     else 
     return varname+"_temp["+a_pos+"]";
    }
   }
   else
   {
    a_pos=stats.indexOf(a);
    if( a_pos!=-1 )
    {
     if(file)
      file.write(varname+"_temp["+a_pos+"]=");
     else 
      out+=varname+"_temp["+a_pos+"]=";
    }
   }
  }
 
  if(context.length%1000==0) console.log(context.length)
 
  context.push(a);
  var do_stringify_var=false;   
  if (a instanceof Array)
  {
   if(file)
    file.write("["); 
   else
    out+="[";
   for(var l=a.length,key=0;key<l;key++)
   {
    if(key!=0)
    {
     if(file)
      file.write(",");
     else
      out+=',';
    }

    do_stringify_var=false;
    if(typeof a[key] === 'object')
    {
     if( a[key] === null )
     {
      do_stringify_var=true;
     }
     else if( a[key].constructor.name==='Object' || a[key] instanceof Array )
     {
      if(file)
            stringify(a[key],varname,null,null,file,null,context,stats );
      else
       out+=stringify(a[key],varname,null,null,file,null,context,stats );
     }
     else
     {
      do_stringify_var=true;
     }
    }
    else
    {
     do_stringify_var=true;
    }

    if(do_stringify_var)
    {
     if(file)
      stringify_var(a[key],file);
     else
      out+=stringify_var(a[key]);
    }
    
   }
   if(file)
    file.write(']');
   else
    out+=']';
  }
  else
  {
   if(file)
    file.write('{');
   else
    out+="{";

   var comma=false
   for (key in a)
   {
    if(Object.prototype.hasOwnProperty.call(a, key))
    {
     if(comma)
     {
      if(file)
       file.write(',');
      else
       out+=',';
     }
     else
      comma=true;
      
     if(file)
     {
      file.write(JSON.stringify(key));
      file.write(':');
     }
     else
     {
      out+=JSON.stringify(key);
      out+=':';
     }
     
    do_stringify_var=false;
    if(typeof a[key] === 'object')
    {
     if( a[key] === null )
     {
      do_stringify_var=true;
     }
     else if( a[key].constructor.name==='Object' || a[key] instanceof Array )
     {
      if(file)
            stringify(a[key],varname,null,null,file,null,context,stats );
      else
       out+=stringify(a[key],varname,null,null,file,null,context,stats );
     }
     else
     {
      do_stringify_var=true;
     }
    }
    else
    {
     do_stringify_var=true;
    }

    if(do_stringify_var)
    {
     if(file)
      stringify_var(a[key],file);
     else
      out+=stringify_var(a[key]);
    }
    
     
    }
   }
   if(file)
    file.write('}');
   else
    out+="}";
  }
  if(clean_context)
  {
   delete context;
   delete stats;
   if(file)
    file.write(";delete "+varname+'_temp;'+sufix);
   else
    out+=";delete "+varname+'_temp;'+sufix;
   console.log('stringify done');
   callback();
  }
 }
 return out;
}
this.stringify=stringify;

function save( object, filename, callback )
{
 if(!filename) throw new Error("file not DEFIEND (WRONG ARGUMENTS)");
 file = fs.createWriteStream(filename,{ 'flags': 'w+', /*'encoding': 'utf-8',*/ 'mode': 0777});
 stringify(object,"obj","","this.exports=obj;",file, function() {
    file.end();
    callback();
 }); 
}this.save=save;