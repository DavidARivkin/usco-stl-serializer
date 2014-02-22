/**
 * @author kovacsv / http://kovacsv.hu/
 * @author kaosat-dev 
 */
var detectEnv = require("composite-detect");

if(detectEnv.isModule) var THREE = require("three");


STLSerializer = function () {
  this.outputType = "ascii"; //ascii or binary
};

STLSerializer.prototype = {
	constructor: STLSerializer,

  serialize: function( rootElement, type ){
    this.outputType = type || "ascii";    
    return this.exportScene (rootElement);
  },

	exportScene : function (scene) {
		var current;
    var meshes = [];
		scene.traverse (function (current) {
			if (current instanceof THREE.Mesh) {
				meshes.push (current);
			}
		});
    if(this.outputType=="ascii")
    {
		  return this.exportMeshes ( meshes );
    }
    else if(this.outputType=="binary")
    {
      return this.exportMeshesBinary (meshes);
    }
	},

	exportMeshes : function (meshes, name) {
    /* ascii stl structure
        facet normal ni nj nk
          outer loop
              vertex v1x v1y v1z
              vertex v2x v2y v2z
              vertex v3x v3y v3z
          endloop
        endfacet
    */
    var name = name || "exported";
    var header = "solid "+name+"\n";

    var content = ""+header;

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

				content = this.addTriangleToContent (normal, vertex1, vertex2, vertex3, content);
			}
		};
		content = this.addLineToContent ('endsolid '+name, content);
		return content;
	},

	addLineToContent : function (line, content) {
		content += line + '\n';
    return content;
	},

	addTriangleToContent : function (normal, vertex1, vertex2, vertex3, content) {
		content = this.addLineToContent ('\tfacet normal ' + normal.x + ' ' + normal.y + ' ' + normal.z, content);
		content = this.addLineToContent ('\t\touter loop', content);
		content = this.addLineToContent ('\t\t\tvertex ' + vertex1.x + ' ' + vertex1.y + ' ' + vertex1.z, content);
		content = this.addLineToContent ('\t\t\tvertex ' + vertex2.x + ' ' + vertex2.y + ' ' + vertex2.z, content);
		content = this.addLineToContent ('\t\t\tvertex ' + vertex3.x + ' ' + vertex3.y + ' ' + vertex3.z, content);
		content = this.addLineToContent ('\t\tendloop', content);
		content = this.addLineToContent ('\tendfacet', content);
    return content;
	},

  exportMeshesBinary:function (meshes) { 
    /*binary stl structure:
      UINT8[80] – Header
      UINT32 – Number of triangles

      foreach triangle
      REAL32[3] – Normal vector
      REAL32[3] – Vertex 1
      REAL32[3] – Vertex 2
      REAL32[3] – Vertex 3
      UINT16 – Attribute byte count
      end*/
      var rawData = []
      var buffer = new ArrayBuffer(4)
      var int32buffer = new Int32Array(buffer, 0, 1)
      var int8buffer = new Int8Array(buffer, 0, 4)
      int32buffer[0] = 0x11223344
      if(int8buffer[0] != 0x44)
      {
        throw new Error("Binary STL output is currently only supported on little-endian processors")
      }

      var numTriangles = 0;

      var headerarray = new Uint8Array(80);
      for(var i=0;i< 80;i++)
      {
        headerarray[i] = 65;
      }
      rawData.push(headerarray);
      var ar1 = new Uint32Array(1);
      ar1[0] = numTriangles;
      rawData.push(ar1);

		  var i, j, mesh, geometry, face, matrix, position;
		  var normal, vertex1, vertex2, vertex3;
		  for (i = 0; i < meshes.length; i++) {
			  mesh = meshes[i];

			  geometry = mesh.geometry;
			  matrix = mesh.matrix;
			  position = mesh.position;
        numTriangles += geometry.faces.length;

        for (j = 0; j < geometry.faces.length; j++) {
				  face = geometry.faces[j];
				  normal = face.normal;
				  vertex1 = this.getTransformedPosition (geometry.vertices[face.a], matrix, position);
				  vertex2 = this.getTransformedPosition (geometry.vertices[face.b], matrix, position);
				  vertex3 = this.getTransformedPosition (geometry.vertices[face.c], matrix, position);

          var vertexDataArray = new Float32Array(12);
          vertexDataArray[0] = normal.x
          vertexDataArray[1] = normal.y
          vertexDataArray[2] = normal.z

          var vertices = [vertex1,vertex2,vertex3];
          var vIndex = 3;
          for(var v = 0 ; v<3;v++)
          {
            vertexDataArray[vIndex++] = vertices[v].x;
            vertexDataArray[vIndex++] = vertices[v].y;
            vertexDataArray[vIndex++] = vertices[v].z;
          }
          var attribDataArray = new Uint16Array(1);
          attribDataArray[0] = 0; 
          rawData.push(vertexDataArray)
          rawData.push(attribDataArray)
			  }
		}

    ar1[0] = numTriangles;
		return rawData;
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
};
   
if (detectEnv.isModule) module.exports = STLSerializer;
