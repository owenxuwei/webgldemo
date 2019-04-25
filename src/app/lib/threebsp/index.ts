import * as THREE from 'three'

var BACK, COPLANAR, EPSILON, FRONT, SPANNING,
  __bind = function (fn, me) { return function () { return fn.apply(me, arguments); }; },
  __slice = [].slice,
  __hasProp = {}.hasOwnProperty,
  __extends = function (child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

EPSILON = 1e-5;

COPLANAR = 0;

FRONT = 1;

BACK = 2;

SPANNING = 3;

function ThreeBSP(treeIsh, matrix?: any) {
  this.matrix = matrix;
  this.intersect = __bind(this.intersect, this);

  this.union = __bind(this.union, this);

  this.subtract = __bind(this.subtract, this);

  this.toGeometry = __bind(this.toGeometry, this);

  this.toMesh = __bind(this.toMesh, this);

  this.toTree = __bind(this.toTree, this);

  if ((this.matrix != null) && !(this.matrix instanceof THREE.Matrix4)) {
    this.matrix = void 0;
  }
  if (this.matrix == null) {
    this.matrix = new THREE.Matrix4();
  }
  this.tree = this.toTree(treeIsh);
}

ThreeBSP.prototype.toTree = function (treeIsh) {
  var face, geometry, i, polygons, _fn, _i, _len, _ref,
    _this = this;
  if (treeIsh instanceof ThreeBSP.Node) {
    return treeIsh;
  }
  polygons = [];
  geometry = treeIsh instanceof THREE.Geometry ? treeIsh : treeIsh instanceof THREE.Mesh ? (treeIsh.updateMatrix(), this.matrix = treeIsh.matrix.clone(), treeIsh.geometry) : void 0;
  _ref = geometry.faces;
  _fn = function (face, i) {
    var faceVertexUvs, idx, polygon, vIndex, vName, vertex, _j, _len1, _ref1, _ref2;
    faceVertexUvs = (_ref1 = geometry.faceVertexUvs) != null ? _ref1[0][i] : void 0;
    if (faceVertexUvs == null) {
      faceVertexUvs = [new THREE.Vector2(), new THREE.Vector2(), new THREE.Vector2(), new THREE.Vector2()];
    }
    polygon = new ThreeBSP.Polygon();
    _ref2 = ['a', 'b', 'c', 'd'];
    for (vIndex = _j = 0, _len1 = _ref2.length; _j < _len1; vIndex = ++_j) {
      vName = _ref2[vIndex];
      if ((idx = face[vName]) != null) {
        vertex = geometry.vertices[idx];
        vertex = new ThreeBSP.Vertex(vertex.x, vertex.y, vertex.z, face.vertexNormals[0], new THREE.Vector2(faceVertexUvs[vIndex].x, faceVertexUvs[vIndex].y));
        vertex.applyMatrix4(_this.matrix);
        polygon.vertices.push(vertex);
      }
    }
    return polygons.push(polygon.calculateProperties());
  };
  for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
    face = _ref[i];
    _fn(face, i);
  }
  return new ThreeBSP.Node(polygons);
};

ThreeBSP.prototype.toMesh = function (material) {
  var _this = this;
  if (material == null) {
    material = new THREE.MeshNormalMaterial();
  }
  var geometry, mesh: THREE.Mesh;
  geometry = _this.toGeometry();
  mesh = new THREE.Mesh(geometry, material);
  // mesh.position.getPositionFromMatrix(_this.matrix);
  // return mesh.rotation.setEulerFromRotationMatrix(_this.matrix);
  mesh.applyMatrix(_this.matrix);
  return mesh;
};

ThreeBSP.prototype.toGeometry = function () {
  var _this = this;
  var geometry, matrix;
  matrix = new THREE.Matrix4().getInverse(_this.matrix);
  geometry = new THREE.Geometry();
  var polygon, _i, _len, _ref, _results;
  _ref = _this.tree.allPolygons();
  _results = [];
  for (_i = 0, _len = _ref.length; _i < _len; _i++) {
    polygon = _ref[_i];
    var face, idx, polyVerts, v, vertUvs, verts, _j, _ref1, _results1;
    polyVerts = (function () {
      var _j, _len1, _ref1, _results1;
      _ref1 = polygon.vertices;
      _results1 = [];
      for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
        v = _ref1[_j];
        _results1.push(v.clone().applyMatrix4(matrix));
      }
      return _results1;
    })();
    _results1 = [];
    for (idx = _j = 2, _ref1 = polyVerts.length; 2 <= _ref1 ? _j < _ref1 : _j > _ref1; idx = 2 <= _ref1 ? ++_j : --_j) {
      verts = [polyVerts[0], polyVerts[idx - 1], polyVerts[idx]];
      vertUvs = (function () {
        var _k, _len1, _ref2, _ref3, _results2;
        _results2 = [];
        for (_k = 0, _len1 = verts.length; _k < _len1; _k++) {
          v = verts[_k];
          _results2.push(new THREE.Vector2((_ref2 = v.uv) != null ? _ref2.x : void 0, (_ref3 = v.uv) != null ? _ref3.y : void 0));
        }
        return _results2;
      })();
      face = (function (func, args, ctor) {
        ctor.prototype = func.prototype;
        var child = new ctor, result = func.apply(child, args);
        return Object(result) === result ? result : child;
      })(THREE.Face3, __slice.call((function () {
        var _k, _len1, _results2;
        _results2 = [];
        for (_k = 0, _len1 = verts.length; _k < _len1; _k++) {
          v = verts[_k];
          _results2.push(geometry.vertices.push(v) - 1);
        }
        return _results2;
      })()).concat([polygon.normal.clone()]), function () { });
      geometry.faces.push(face);
      _results1.push(geometry.faceVertexUvs[0].push(vertUvs));
    }
  }
  return geometry;
};

ThreeBSP.prototype.subtract = function (other) {
  var _this = this;

  var them, us, _ref;
  _ref = [_this.tree.clone(), other.tree.clone()], us = _ref[0], them = _ref[1];
  us.invert().clipTo(them);
  them.clipTo(us).invert().clipTo(us).invert();
  return new ThreeBSP(us.build(them.allPolygons()).invert(), _this.matrix);
};

ThreeBSP.prototype.union = function (other) {
  var _this = this;
  var them, us, _ref;
  _ref = [_this.tree.clone(), other.tree.clone()], us = _ref[0], them = _ref[1];
  us.clipTo(them);
  them.clipTo(us).invert().clipTo(us).invert();
  return new ThreeBSP(us.build(them.allPolygons()), _this.matrix);
};

ThreeBSP.prototype.intersect = function (other) {
  var _this = this;
  var them, us, _ref;
  _ref = [_this.tree.clone(), other.tree.clone()], us = _ref[0], them = _ref[1];
  them.clipTo(us.invert()).invert().clipTo(us.clipTo(them));
  return new ThreeBSP(us.build(them.allPolygons()).invert(), _this.matrix);
};

ThreeBSP.Vertex = (function (_super) {

  __extends(Vertex, _super);

  function Vertex(x, y, z, normal, uv) {
    this.normal = normal != null ? normal : new THREE.Vector3();
    this.uv = uv != null ? uv : new THREE.Vector2();
    this.interpolate = __bind(this.interpolate, this);

    this.lerp = __bind(this.lerp, this);

    (<any>Vertex).__super__.constructor.call(this, x, y, z);
  }

  Vertex.prototype.clone = function () {
    return new ThreeBSP.Vertex(this.x, this.y, this.z, this.normal.clone(), this.uv.clone());
  };

  Vertex.prototype.lerp = function (v, alpha) {
    var _this = this;
    var result = (<any>Vertex).__super__.lerp.apply(this, arguments);
    _this.uv.add(v.uv.clone().sub(_this.uv).multiplyScalar(alpha));
    _this.normal.lerp(v, alpha);
    return result;
  };

  Vertex.prototype.interpolate = function () {
    var args, _ref;
    args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    return (_ref = this.clone()).lerp.apply(_ref, args);
  };

  return Vertex;

})(THREE.Vector3);

ThreeBSP.Polygon = (function () {

  function Polygon(vertices?: any, normal?: any, w?: any) {
    this.vertices = vertices != null ? vertices : [];
    this.normal = normal;
    this.w = w;
    this.subdivide = __bind(this.subdivide, this);

    this.tessellate = __bind(this.tessellate, this);

    this.classifySide = __bind(this.classifySide, this);

    this.classifyVertex = __bind(this.classifyVertex, this);

    this.invert = __bind(this.invert, this);

    this.clone = __bind(this.clone, this);

    this.calculateProperties = __bind(this.calculateProperties, this);

    if (this.vertices.length) {
      this.calculateProperties();
    }
  }

  Polygon.prototype.calculateProperties = function () {
    var a, b, c, _ref;
    _ref = this.vertices, a = _ref[0], b = _ref[1], c = _ref[2];
    this.normal = b.clone().sub(a).cross(c.clone().sub(a)).normalize();
    this.w = this.normal.clone().dot(a);
    return this;
  };

  Polygon.prototype.clone = function () {
    var v;
    return new ThreeBSP.Polygon((function () {
      var _i, _len, _ref, _results;
      _ref = this.vertices;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        v = _ref[_i];
        _results.push(v.clone());
      }
      return _results;
    }).call(this), this.normal.clone(), this.w);
  };

  Polygon.prototype.invert = function () {
    this.normal.multiplyScalar(-1);
    this.w *= -1;
    this.vertices.reverse();
    return this;
  };

  Polygon.prototype.classifyVertex = function (vertex) {
    var side;
    side = this.normal.dot(vertex) - this.w;
    switch (false) {
      case !(side < -EPSILON):
        return BACK;
      case !(side > EPSILON):
        return FRONT;
      default:
        return COPLANAR;
    }
  };

  Polygon.prototype.classifySide = function (polygon) {
    var back, front, tally, v, _i, _len, _ref, _ref1,
      _this = this;
    _ref = [0, 0], front = _ref[0], back = _ref[1];
    tally = function (v) {
      switch (_this.classifyVertex(v)) {
        case FRONT:
          return front += 1;
        case BACK:
          return back += 1;
      }
    };
    _ref1 = polygon.vertices;
    for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
      v = _ref1[_i];
      tally(v);
    }
    if (front > 0 && back === 0) {
      return FRONT;
    }
    if (front === 0 && back > 0) {
      return BACK;
    }
    if ((front === back && back === 0)) {
      return COPLANAR;
    }
    return SPANNING;
  };

  Polygon.prototype.tessellate = function (poly) {
    var b, count, f, i, j, polys, t, ti, tj, v, vi, vj, _i, _len, _ref, _ref1, _ref2,
      _this = this;
    _ref = {
      f: [],
      b: [],
      count: poly.vertices.length
    }, f = _ref.f, b = _ref.b, count = _ref.count;
    if (this.classifySide(poly) !== SPANNING) {
      return [poly];
    }
    _ref1 = poly.vertices;
    for (i = _i = 0, _len = _ref1.length; _i < _len; i = ++_i) {
      vi = _ref1[i];
      vj = poly.vertices[(j = (i + 1) % count)];
      _ref2 = (function () {
        var _j, _len1, _ref2, _results;
        _ref2 = [vi, vj];
        _results = [];
        for (_j = 0, _len1 = _ref2.length; _j < _len1; _j++) {
          v = _ref2[_j];
          _results.push(this.classifyVertex(v));
        }
        return _results;
      }).call(this), ti = _ref2[0], tj = _ref2[1];
      if (ti !== BACK) {
        f.push(vi);
      }
      if (ti !== FRONT) {
        b.push(vi);
      }
      if ((ti | tj) === SPANNING) {
        t = (this.w - this.normal.dot(vi)) / this.normal.dot(vj.clone().sub(vi));
        v = vi.interpolate(vj, t);
        f.push(v);
        b.push(v);
      }
    }
    polys = [];
    if (f.length >= 3) {
      polys.push(new ThreeBSP.Polygon(f));
    }
    if (b.length >= 3) {
      polys.push(new ThreeBSP.Polygon(b));
    }
    return polys;
  };

  Polygon.prototype.subdivide = function (polygon, coplanar_front, coplanar_back, front, back) {
    var poly, side, _i, _len, _ref;
    _ref = this.tessellate(polygon);
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      poly = _ref[_i];
      side = this.classifySide(poly);
      switch (side) {
        case FRONT:
          front.push(poly);
          break;
        case BACK:
          back.push(poly);
          break;
        case COPLANAR:
          if (this.normal.dot(poly.normal) > 0) {
            coplanar_front.push(poly);
          } else {
            coplanar_back.push(poly);
          }
          break;
        default:
          throw new Error("BUG: Polygon of classification " + side + " in subdivision");
      }
    }
  };

  return Polygon;

})();

function buildrecursive(_this, polygons) {
  var sides;
  sides = {
    front: [],
    back: []
  };
  if (!_this.divider) {
    // _this.divider = polygons[0].clone();
    _this.divider = polygons[Math.floor(polygons.length / 2)].clone();
  }
  for (var _i = 0; _i < polygons.length; _i++) {
    _this.divider.subdivide(polygons[_i], _this.polygons, _this.polygons, sides.front, sides.back);
  }
  if (sides.front.length) {
    if (!_this.front) {
      _this.front = new ThreeBSP.Node();
    }
    buildrecursive(_this.front, sides.front);
  }
  if (sides.back.length) {
    if (!_this.back) {
      _this.back = new ThreeBSP.Node();
    }
    return buildrecursive(_this.back, sides.back);
  }
}

function clonerecursive(node, _this) {
  var _ref;
  node.divider = (_ref = _this.divider) != null ? _ref.clone() : void 0;
  node.polygons = [];
  var p, _i, _len, _ref1;
  _ref1 = _this.polygons;
  for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
    p = _ref1[_i];
    node.polygons.push(p.clone());
  }
  if(_this.front != null){
    node.front = new ThreeBSP.Node();
    return clonerecursive(node.front,_this.front);
  }
  if(_this.back != null){
    node.back = new ThreeBSP.Node();
    return clonerecursive(node.back,_this.back);
  }
}

function clipPolygonsrecursive(node,polygons){
  var back, front, poly, _i, _len;
  if (!node.divider) {
    return polygons.slice();
  }
  front = [];
  back = [];
  for (_i = 0, _len = polygons.length; _i < _len; _i++) {
    poly = polygons[_i];
    node.divider.subdivide(poly, front, back, front, back);
  }
  // if (node.front) {
  //   front = clipPolygonsrecursive(node.front,front);
  // }
  // if (node.back) {
  //   back = clipPolygonsrecursive(node.back,back);
  // }
  // if (node.back) {
  //   return front.concat(back);
  // } else {
  //   return front;
  // }
  if (node.back) {
    if(node.front){
      return clipPolygonsrecursive(node.front,front).concat(clipPolygonsrecursive(node.back,back));
    }
    else
      return front.concat(clipPolygonsrecursive(node.back,back));
  } else {
    if(node.front)
      return clipPolygonsrecursive(node.front,front);
    else
      return front;
  }
}

function clipTorecursive(_this, node) {
  _this.polygons = node.clipPolygons(_this.polygons);
  if (_this.front != null) {
    clipTorecursive(_this.front, node);
  }
  if (_this.back != null) {
    return clipTorecursive(_this.back, node);
  }
}

function allPolygons(_this){
  return _this.polygons.slice().concat( _this.front != null ? allPolygons(_this.front) :  [], _this.back != null ? allPolygons(_this.back) : []);
}

function invertrecursive(_this){
  var  poly, _i, _len, _ref, _ref2;
  _ref = _this.polygons;
  for (_i = 0, _len = _ref.length; _i < _len; _i++) {
    poly = _ref[_i];
    poly.invert();
  }
  if(_this.divider) _this.divider.invert();
  _ref2 = [_this.back, _this.front], _this.front = _ref2[0], _this.back = _ref2[1], _ref2;
  if(_this.front) invertrecursive(_this.front);
  if(_this.back) invertrecursive(_this.back);
}

ThreeBSP.Node = (function () {

  Node.prototype.clone = function () {
    var node,
      _this = this;

    node = new ThreeBSP.Node();

    // var _ref;
    // node.divider = (_ref = _this.divider) != null ? _ref.clone() : void 0;
    // node.polygons = [];
    // var p, _i, _len, _ref1;
    // _ref1 = _this.polygons;
    // for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
    //   p = _ref1[_i];
    //   node.polygons.push(p.clone());
    // }
    // node.front = _this.front != null ? _this.front.clone() : void 0;
    // node.back = _this.back != null ? _this.back.clone() : void 0;

    clonerecursive(node,_this);
    return node;
  };

  function Node(polygons?: any[]) {
    var _this = this;
    this.clipTo = __bind(this.clipTo, this);

    this.clipPolygons = __bind(this.clipPolygons, this);

    this.invert = __bind(this.invert, this);

    this.allPolygons = __bind(this.allPolygons, this);

    this.isConvex = __bind(this.isConvex, this);

    this.build = __bind(this.build, this);

    this.clone = __bind(this.clone, this);

    this.polygons = [];
    if (polygons && polygons.length) {
      _this.build(polygons);
    }
  }

  Node.prototype.build = function (polygons) {
    // var sides;
    // sides = {
    //   front: [],
    //   back: []
    // };
    // if (this.divider == null) {
    //   // this.divider = polygons[0].clone();
    //   this.divider = polygons[Math.floor(polygons.length / 2)].clone();
    // }
    // for (var _i = 0; _i < polygons.length; _i++) {
    //   this.divider.subdivide(polygons[_i], this.polygons, this.polygons, sides.front, sides.back);
    // }
    // if (sides.front.length) {
    //   if (this.front == null) {
    //     this.front = new ThreeBSP.Node();
    //   }
    //   this.front.build(sides.front);
    // }
    // if (sides.back.length) {
    //   if (this.back == null) {
    //     this.back = new ThreeBSP.Node();
    //   }
    //   this.back.build(sides.back);
    // }
    buildrecursive(this,polygons);//尾递归
    return this;
  };

  Node.prototype.isConvex = function (polys) {
    var inner, outer, _i, _j, _len, _len1;
    for (_i = 0, _len = polys.length; _i < _len; _i++) {
      inner = polys[_i];
      for (_j = 0, _len1 = polys.length; _j < _len1; _j++) {
        outer = polys[_j];
        if (inner !== outer && outer.classifySide(inner) !== BACK) {
          return false;
        }
      }
    }
    return true;
  };

  Node.prototype.allPolygons = function () {
    return allPolygons(this);
    // var _this = this;
    // var _ref, _ref1;
    // return _this.polygons.slice().concat(((_ref1 = _this.front) != null ? _ref1.allPolygons() : void 0) || []).concat(((_ref = _this.back) != null ? _ref.allPolygons() : void 0) || []);
  };

  Node.prototype.invert = function () {
    // var flipper, poly, _i, _j, _len, _len1, _ref, _ref1, _ref2;
    // _ref = this.polygons;
    // for (_i = 0, _len = _ref.length; _i < _len; _i++) {
    //   poly = _ref[_i];
    //   poly.invert();
    // }

    // _ref1 = [this.divider, this.front, this.back];
    // for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
    //   flipper = _ref1[_j];
    //   flipper != null ? flipper.invert() : void 0;
    // }
    // _ref2 = [this.back, this.front], this.front = _ref2[0], this.back = _ref2[1], _ref2;
    invertrecursive(this);
    return this;
  };

  Node.prototype.clipPolygons = function (polygons) {
    return clipPolygonsrecursive(this,polygons);

    // var back, front, poly, _i, _len;
    // if (!this.divider) {
    //   return polygons.slice();
    // }
    // front = [];
    // back = [];
    // for (_i = 0, _len = polygons.length; _i < _len; _i++) {
    //   poly = polygons[_i];
    //   this.divider.subdivide(poly, front, back, front, back);
    // }
    // if (this.front) {
    //   front = this.front.clipPolygons(front);
    // }
    // if (this.back) {
    //   back = this.back.clipPolygons(back);
    // }
    // if (this.back) {
    //   return front.concat(back);
    // } else {
    //   return front;
    // }
  };

  Node.prototype.clipTo = function (node) {
    // this.polygons = node.clipPolygons(this.polygons);
    // if (this.front != null) {
    //   this.front.clipTo(node);
    // }
    // if (this.back != null) {
    //   this.back.clipTo(node);
    // }
    clipTorecursive(this,node);
    return this;
  };

  return Node;

})();

export { ThreeBSP };

