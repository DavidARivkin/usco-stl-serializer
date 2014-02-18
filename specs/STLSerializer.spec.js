THREE = require("three");
STLSerializer = require("../STLSerializer");
fs = require("fs");

describe("STL serializer tests", function() {
  var serializer = new STLSerializer();
  
  it("can serialize to binary stl files", function() {
    var object = new THREE.Mesh(new THREE.CubeGeometry(10,10,10),new THREE.MeshBasicMaterial);
    
    var rawObsGeneratedSTL = serializer.serialize(object, 'binary');
    fs.writeFileSync("obs.stl",rawObsGeneratedSTL);

    var obsGeneratedSTL = fs.readFileSync("obs.stl", "binary");
    var expGeneratedSTL = fs.readFileSync("specs/data/cube_bin.stl", "binary");
    expect(obsGeneratedSTL).toEqual(expGeneratedSTL);
  });

  it("can serialize an object hierarchy to binary stl files", function() {
    var object = new THREE.Mesh(new THREE.CubeGeometry(10,10,10),new THREE.MeshBasicMaterial);
    var subObject = new THREE.Mesh(new THREE.SphereGeometry(10,10,10),new THREE.MeshBasicMaterial);
    object.add( subObject );

    var obsGeneratedSTL = serializer.serialize(object, 'binary');
    var expGeneratedSTL = fs.readFileSync("specs/data/hierarchy_bin.stl", "binary")
    expect(obsGeneratedSTL).toEqual(expGeneratedSTL);
  });


  it("can serialize to ascii stl files", function() {
    var object = new THREE.Mesh(new THREE.CubeGeometry(10,10,10),new THREE.MeshBasicMaterial);

    var obsGeneratedSTL = serializer.serialize(object, 'ascii');
    var expGeneratedSTL = fs.readFileSync("specs/data/cube_ascii.stl", "utf8")
    expect(obsGeneratedSTL).toEqual(expGeneratedSTL);
  });

  it("can serialize an object hierarchy to ascii stl files", function() {
    var object = new THREE.Mesh(new THREE.CubeGeometry(10,10,10),new THREE.MeshBasicMaterial);
    var subObject = new THREE.Mesh(new THREE.SphereGeometry(10,10,10),new THREE.MeshBasicMaterial);
    subObject.position.x = 20;
    object.add( subObject );

    var obsGeneratedSTL = serializer.serialize(object, 'ascii');
    var expGeneratedSTL = fs.readFileSync("specs/data/hierarchy_ascii.stl", "utf8")
    expect(obsGeneratedSTL).toEqual(expGeneratedSTL);
  });


  /*To be used to write out the data using buffers

    /*var buffer = new Buffer();
    for(var i =0;i<rawObsGeneratedSTL.length;i++)
    {
      console.log("rawObsGeneratedSTL",i);
      if(rawObsGeneratedSTL[i] instanceof Float32Array)
      {
        console.log("Float32Array");
        //buffer
      }
      else if(rawObsGeneratedSTL[i] instanceof Uint8Array)
      {
        console.log("Uint8Array");
        buffer.writeUInt8(rawObsGeneratedSTL[i], 0);
      }
      else if(rawObsGeneratedSTL[i] instanceof  Uint16Array)
      {
        console.log("Uint16Array");
        buffer.writeUInt8(rawObsGeneratedSTL[i], 0);
      }
      else if(rawObsGeneratedSTL[i] instanceof Uint32Array)
      {
        console.log("Uint32Array")
      }
    }*/
    var size = 0;
    for(var i = 0, len = parts.length; i < len; ++i) {
        size += typeof parts[i] === 'string' ? Buffer.byteLength(parts[i]) :
                str(parts[i]).indexOf('ArrayBuffer') > -1 ? parts[i].byteLength :
                parts[i].buffer ? parts[i].buffer.byteLength :
                parts[i].length
      }

  */
  
});
