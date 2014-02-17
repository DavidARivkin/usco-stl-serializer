THREE = require("three");
STLSerializer = require("../STLSerializer");
fs = require("fs");

describe("STL serializer tests", function() {
  var serializer = new STLSerializer();
  
  it("can serialize to ascii stl files", function() {
    var object = new THREE.Mesh(new THREE.CubeGeometry(10,10,10),new THREE.MeshBasicMaterial);

    var obsGeneratedSTL = serializer.serialize(object, 'ascii');
    var expGeneratedStl = fs.readFileSync("specs/data/cube_ascii.stl", "utf8")
    expect(obsGeneratedSTL).toEqual(expGeneratedStl);
  });

  it("can serialize to binary stl files", function() {
    var object = new THREE.Mesh(new THREE.CubeGeometry(10,10,10),new THREE.MeshBasicMaterial);

    var obsGeneratedSTL = serializer.serialize(object, 'binary');
    fs.writeFileSync("bla.stl",obsGeneratedSTL)
    var expGeneratedStl = fs.readFileSync("specs/data/cube_bin.stl", "binary");
    expect(obsGeneratedSTL).toEqual("");
  });

  it("can serialize an object hierarchy to ascii stl files", function() {
    var object = new THREE.Mesh(new THREE.CubeGeometry(10,10,10),new THREE.MeshBasicMaterial);
    var subObject = new THREE.Mesh(new THREE.SphereGeometry(10,10,10),new THREE.MeshBasicMaterial);
    object.add( subObject );

    var obsGeneratedSTL = serializer.serialize(object, 'ascii');
    var expGeneratedStl = fs.readFileSync("specs/data/hierarchy_ascii.stl", "utf8")
    expect(obsGeneratedSTL).toEqual(expGeneratedStl);
  });

  
  
});
