THREE = require("three");
STLSerializer = require("../stl-serializer");
fs = require("fs");

writeToFile = require("./bufferArrayWriter");

describe("STL serializer tests", function() {
  var serializer = new STLSerializer();
  
  it("can serialize to binary stl files", function() {
    var object = new THREE.Mesh(new THREE.CubeGeometry(10,10,10),new THREE.MeshBasicMaterial);
    
    var rawObsGeneratedSTL = serializer.serialize(object, 'binary');
    writeToFile(rawObsGeneratedSTL,"specs/obs.stl");

    var obsGeneratedSTL = fs.readFileSync("specs/obs.stl", "binary");
    var expGeneratedSTL = fs.readFileSync("specs/data/cube_bin.stl", "binary");
    expect(obsGeneratedSTL).toEqual(expGeneratedSTL);
    fs.unlinkSync("specs/obs.stl");
  });

  it("can serialize an object hierarchy to binary stl files", function() {
    var object = new THREE.Mesh(new THREE.CubeGeometry(10,10,10),new THREE.MeshBasicMaterial);
    var subObject = new THREE.Mesh(new THREE.SphereGeometry(10,10,10),new THREE.MeshBasicMaterial);
    subObject.position.x = 20;
    object.add( subObject );

    var rawObsGeneratedSTL = serializer.serialize(object, 'binary');
    writeToFile(rawObsGeneratedSTL,"specs/obs.stl");

    var obsGeneratedSTL = fs.readFileSync("specs/obs.stl", "binary");
    var expGeneratedSTL = fs.readFileSync("specs/data/hierarchy_bin.stl", "binary")
    expect(obsGeneratedSTL).toEqual(expGeneratedSTL);
    fs.unlinkSync("specs/obs.stl");
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
});
