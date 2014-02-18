!function(e){"object"==typeof exports?module.exports=e():"function"==typeof define&&define.amd?define(e):"undefined"!=typeof window?window.STLSerializer=e():"undefined"!=typeof global?global.STLSerializer=e():"undefined"!=typeof self&&(self.STLSerializer=e())}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/**
 * @author kovacsv / http://kovacsv.hu/
 * @author kaosat-dev 
 */
var detectEnv = require("composite-detect");

THREE.STLSerializer = function () {
  this.outputType = "ascii"; //ascii or binary
};

THREE.STLSerializer.prototype = {
	constructor: THREE.STLSerializer,

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

      buffer = new ArrayBuffer(50);

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
   
if (detectEnv.isModule) module.exports = THREE.STLSerializer;

},{"composite-detect":2}],2:[function(require,module,exports){
var process=require("__browserify_process");(function () {
  // Hueristics.
  var isNode = typeof process !== 'undefined' && process.versions && !!process.versions.node;
  var isBrowser = typeof window !== 'undefined';
  var isModule = typeof module !== 'undefined' && !!module.exports;

  // Export.
  var detect = (isModule ? exports : (this.detect = {}));
  detect.isNode = isNode;
  detect.isBrowser = isBrowser;
  detect.isModule = isModule;
}).call(this);
},{"__browserify_process":3}],3:[function(require,module,exports){
// shim for using process in browser

var process = module.exports = {};

process.nextTick = (function () {
    var canSetImmediate = typeof window !== 'undefined'
    && window.setImmediate;
    var canPost = typeof window !== 'undefined'
    && window.postMessage && window.addEventListener
    ;

    if (canSetImmediate) {
        return function (f) { return window.setImmediate(f) };
    }

    if (canPost) {
        var queue = [];
        window.addEventListener('message', function (ev) {
            if (ev.source === window && ev.data === 'process-tick') {
                ev.stopPropagation();
                if (queue.length > 0) {
                    var fn = queue.shift();
                    fn();
                }
            }
        }, true);

        return function nextTick(fn) {
            queue.push(fn);
            window.postMessage('process-tick', '*');
        };
    }

    return function nextTick(fn) {
        setTimeout(fn, 0);
    };
})();

process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];

process.binding = function (name) {
    throw new Error('process.binding is not supported');
}

// TODO(shtylman)
process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};

},{}]},{},[1])
(1)
});
;