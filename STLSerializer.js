/**
 * @author kovacsv / http://kovacsv.hu/
 * @author kaosat-dev 
 */
var detectEnv = require("composite-detect");

THREE.STLSerializer = function () {
	this.stlContent = '';
  this.outputType = "ascii"; //ascii or binary
};

THREE.STLSerializer.prototype = {
	constructor: THREE.STLSerializer,

  serialize: function( rootElement, type ){
    this.outputType = type || "ascii";    
    var meshes = [];

    if( rootElement instanceof THREE.Mesh )
    {
      meshes.push ( rootElement );
      return this.exportMeshes (meshes);
    }else
    {
      return this.exportScene ( rootElement );
    }
  },

	exportScene : function (scene) {
		var current;
		scene.traverse (function (current) {
			if (current instanceof THREE.Mesh) {
				meshes.push (current);
			}
		});

		return this.exportMeshes (meshes);
	},

	exportMesh : function (mesh) {
		return this.exportMeshes ([mesh]);
	},

	exportMeshes : function (meshes) {
		this.addLineToContent ('solid exported');

		var i, j, mesh, geometry, face, matrix, position;
		var normal, vertex1, vertex2, vertex3;
		for (i = 0; i < meshes.length; i++) {
			mesh = meshes[i];

			geometry = mesh.geometry;
			matrix = mesh.matrix;
			position = mesh.position;

			for (j = 0; j < geometry.faces.length; j++) {
				face = geometry.faces[j];
				normal = face.normal;
				vertex1 = this.getTransformedPosition (geometry.vertices[face.a], matrix, position);
				vertex2 = this.getTransformedPosition (geometry.vertices[face.b], matrix, position);
				vertex3 = this.getTransformedPosition (geometry.vertices[face.c], matrix, position);
				this.addTriangleToContent (normal, vertex1, vertex2, vertex3);
			}
		};

		this.addLineToContent ('endsolid exported');
		return this.stlContent;
	},

	clearContent : function ()
	{
		this.stlContent = '';
	},

	addLineToContent : function (line) {
		this.stlContent += line + '\n';
	},

	addTriangleToContent : function (normal, vertex1, vertex2, vertex3) {
		this.addLineToContent ('\tfacet normal ' + normal.x + ' ' + normal.y + ' ' + normal.z);
		this.addLineToContent ('\t\touter loop');
		this.addLineToContent ('\t\t\tvertex ' + vertex1.x + ' ' + vertex1.y + ' ' + vertex1.z);
		this.addLineToContent ('\t\t\tvertex ' + vertex2.x + ' ' + vertex2.y + ' ' + vertex2.z);
		this.addLineToContent ('\t\t\tvertex ' + vertex3.x + ' ' + vertex3.y + ' ' + vertex3.z);
		this.addLineToContent ('\t\tendloop');
		this.addLineToContent ('\tendfacet');
	},

	getTransformedPosition : function (vertex, matrix, position) {
		var result = vertex.clone ();
		if (matrix !== undefined) {
			result.applyMatrix4 (matrix);
		}
		if (position !== undefined) {
			result.add (position);
		}
		return result;
	},

  _generateString: function (geometry)
  {
      /* 
        facet normal ni nj nk
          outer loop
              vertex v1x v1y v1z
              vertex v2x v2y v2z
              vertex v3x v3y v3z
          endloop
        endfacet
      */
      var header = "solid geometry.name \n";
      /*
      vertices = []
      for vertex in geometry.vertices
        vertices
      facets = []
      for index, face of geometry.faces
        facetData = "facet "
        normal = face.normal
        normalData = "normal #{normal.x} #{normal.y} #{normal.z}\n"
        
        vertexIndices = []
        if face instanceof THREE.Face3
          vertexIndices[0] = [ face.a, face.b, face.c ]
          #vertexIndices = [ face.a, face.b, face.c ]
        
        verticesData = "" 
        for i in [0...vertexIndices.length]
          verticesData += facetData + normalData
          verticesData += "  outer loop\n"
          for j in [0...3]
            vertex = geometry.vertices[ vertexIndices[i][j] ]
            verticesData += "    vertex #{vertex.x.toPrecision(7)} #{vertex.y.toPrecision(7)} #{vertex.z.toPrecision(7)}\n"
          
          verticesData += "  endloop\n"+ "endfacet\n"
        
        #.toExponential(3)
        #.toPrecision(3)
        facetData = verticesData
        facets.push( facetData )
      return header + facets.join("")
      */
    },
    
    _generateBinary: function(geometry)
    {
      var blobData = []
      var buffer = new ArrayBuffer(4)
      var int32buffer = new Int32Array(buffer, 0, 1)
      var int8buffer = new Int8Array(buffer, 0, 4)
      /*var int32buffer[0] = 0x11223344
      if int8buffer[0] != 0x44
        throw new Error("Binary STL output is currently only supported on little-endian (Intel) processors")
        
      numtriangles=0
      @currentObject.faces.map (face) ->
        numvertices = face.vertices.length
        thisnumtriangles = if numvertices >= 3 then numvertices-2 else 0 
        numtriangles += thisnumtriangles 
        
      headerarray = new Uint8Array(80)
      for i in [0...80]
        headerarray[i] = 65
      blobData.push(headerarray)
      
      ar1 = new Uint32Array(1)
      ar1[0] = numtriangles
      blobData.push(ar1)
      
      for index, face of geometry.faces
        numvertices = face.vertices.length
        for i in [0...numvertices-2]
          vertexDataArray = new Float32Array(12) 
          normal = face.normal
          vertexDataArray[0] = normal.x
          vertexDataArray[1] = normal.y
          vertexDataArray[2] = normal.z
          
          arindex = 3
          for v in [0...3]
            vv = v + ((if (v > 0) then i else 0))
            pos    = face.vertices[vv].pos
            vertexDataArray[arindex++] = pos.x
            vertexDataArray[arindex++] = pos.y
            vertexDataArray[arindex++] = pos.z
          
          attribDataArray = new Uint16Array(1)
          attribDataArray[0]=0
            
          blobData.push(vertexDataArray)
          blobData.push(attribDataArray)
          */
      return blobData;
    }
};
   
if (detectEnv.isModule) module.exports = THREE.STLSerializer;
