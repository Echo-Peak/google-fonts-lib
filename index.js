#!/usr/bin/env node
let https = require('https');
let fs = require('fs');
let path = require('path');

class GoogleFontLibary{
  constructor(){
    this.local = false;
    this.fontFolder = path.resolve(process.cwd() ,'fonts');
    this.argParser.call(this , process.argv);
  }
  argParser(args){
    ~args.indexOf('get') && this.getFont(args[args.indexOf('get') + 1]);
    ~args.indexOf('local') && (this.local = true);
  }
  getFont(fontname){
    this.fontname = fontname;
    let self = this;
    if(fontname === void 0 || fontname.length < 1){
      console.log(`Must pass a font name`);

      process.exit()
    }
    console.log(`Fetching ${fontname}`);
    let options = {
      host:'fonts.googleapis.com',
      method:'GET',
      port:443,
      path:`/css?family=${fontname.replace(/\s/g,'+')}`,
      headers:{
        'Host':'fonts.googleapis.com',
        'User-Agent':'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.103 Safari/537.36'
      }
    }
    let data = '';
    let done = function(res){

      if(res.statusCode === 400 || res.statusCode > 4000){
        console.log('Cant find that font')
        process.exit();
      }
      res.on('data',function(e){
        data += e.toString();
      });

      res.on('end',function(){
        if(res.statusCode === 200){
          self.succses(fontname ,data)
        }
      });

      res.on('error', function(err){
        self.error(err)
      })
    }
    let request = https.request(options,done);
    request.end();

  }
  succses(fontname , file){
    let Font = fontname.replace(/\s/g,'-').toLowerCase();

    if(this.local){
      var woff2Files = file.match(/url[(](.+?)[)]/gm) //find all urls
      .map(e => e.split(/\/|\.|[\)\(]/))
      .map(e => e.slice(7,-1));

 //we are trying to overwrite since these may not be static assets
      try{
        fs.statSync(`${this.fontFolder}/${Font}`);
      }catch(e){
        fs.mkdirSync(`${this.fontFolder}/${Font}`);
      }
      try{
        fs.statSync(`${this.fontFolder}/${Font}/font`)
      }catch(e){
        fs.mkdirSync(`${this.fontFolder}/${Font}/font`);
      }


      let formatedFile = file.replace(/url[(](.+?)[)]/gm ,function(found , capture){
        let fontID = capture.match(/[a-z0-9_\-]+\.woff2$/gmi)[0].split('.')[0];
        return `url(font/${fontID}.woff2)`
      });

      fs.writeFile(`${this.fontFolder}/${Font}/${Font.toLowerCase()}.css` ,formatedFile ,'utf8');

      woff2Files.forEach((item)=>{

       let getWoffFile = this.getFile(item[1] ,item[2] ,item[3] ,this.saveFile.bind(this,item[0],item[2],item[3]));

      });
    }else{
      fs.writeFile(`${this.fontFolder}/${Font.toLowerCase()}.css` ,file ,'utf8');
      console.log('Saved')
    }
  }
  saveFile(filename ,id ,ext,contents){
    let _path = `${this.fontFolder}/${this.fontname.replace(/\s/g,'-').toLowerCase()}/font/${id}.${ext}`;

    fs.writeFile(_path ,contents ,function(err, data){

    });
    console.log('saving' ,_path)

  }
  getFile(fontVersion , fontID , ext ,callback){
    let _path = `https://fonts.gstatic.com/s/${this.fontname.replace(/\s/,'').toLowerCase()}/${fontVersion}/${fontID}.${ext}`;
    let request = https.get(_path, function(response) {

      //BINARY data
      let data = [];
      let buffer;
      response.on('data',function(chunk){
        data.push(chunk);
      });
      response.on('end',function(){
        buffer = Buffer.concat([...data])
         callback(buffer);
      });
    });
  }
}

new GoogleFontLibary();
