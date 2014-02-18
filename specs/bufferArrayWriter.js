//To be used to write out the data using buffers
//var Buffer = require('buffer').Buffer

var fs = require("fs");
var Buffer = require('buffer').Buffer
  , str = {}.toString.call.bind({}.toString)

function bufferArrayWriter( parts , outputFileName)
{
    var size = 0;
    for(var i = 0, len = parts.length; i < len; ++i) {
      size += typeof parts[i] === 'string' ? Buffer.byteLength(parts[i]) :
              str(parts[i]).indexOf('ArrayBuffer') > -1 ? parts[i].byteLength :
              parts[i].buffer ? parts[i].buffer.byteLength :
              parts[i].length
    }

    //console.log("size", size);

    var buffer = new Buffer(size);
    var index=0;
    for(var i =0;i<parts.length;i++)
    {
      //console.log("rawObsGeneratedSTL",i, index);
      if(parts[i] instanceof Float32Array)
      {
        //console.log("Float32Array");
        //buffer
         for (var j = 0; j < parts[i].length; ++j) {
          buffer.writeFloatLE(parts[i][j], index);
          index+=4;
        }
      }
      else if(parts[i] instanceof Uint8Array)
      {
        //console.log("Uint8Array");
        
        for (var j = 0; j < parts[i].length; ++j) {
          buffer.writeUInt8(parts[i][j], index);
          index++;
        }
      }
      else if(parts[i] instanceof  Uint16Array)
      {
        //console.log("Uint16Array");
        for (var j = 0; j < parts[i].length; ++j) {
          buffer.writeUInt16LE(parts[i][j], index);
          index+=2;
        }
      }
      else if(parts[i] instanceof Uint32Array)
      {
        //console.log("Uint32Array");
        for (var j = 0; j < parts[i].length; ++j) {
          buffer.writeUInt32LE(parts[i][j], index);
          index+=4;
        }
      }
    }
    
    fs.writeFileSync(outputFileName,buffer);
    return buffer;
}

module.exports = bufferArrayWriter;
  
