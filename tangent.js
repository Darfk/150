var TANGENT = {};

Math.TAU = Math.PI * 2;
Number.prototype.wrap = function(max){return(this<0?this%max+max:this%max);};

TANGENT.ColliderType = {
  NONE: 0,
  BOX: 1,
};

TANGENT.RayDirection = {
  DOWN: 0,
  UP: 1,
  LEFT: 2,
  RIGHT: 3,
};

TANGENT.Scene = function () {
  this.entities = [];
  this.entityMap = {};
  this.events = {};
}

TANGENT.Scene.prototype.add = function(e) {
  this.entities.push(e);
}

TANGENT.Scene.prototype.registerEntityTypes = function(constructors) {
  var self = this;
  constructors.forEach(function (t) {
    self.registerEntityType(t);
  })
};

TANGENT.Scene.prototype.registerEntityType = function(constructor) {
  this.entityMap[constructor.prototype.type] = constructor;
};

TANGENT.Scene.prototype.collide = function (){
  return;

  var i, j, k, l, self = this;
  l = this.entities.length;
  for(i=0; i<l; i++) {
    if(!this.entities[i].rays) continue;
    for(k=0; k<this.entities[i].rays.length; k++) {
      this.entities[i].rays[k].collisionResults = [];      
      for(j=0; j<l; j++) {
        if(!this.entities[j].collider) continue;
        if(this.entities[i] === this.entities[j]) continue;
        this.entities[i].rays[k].collide(this.entities[j]);
      }
    }
  }
};

TANGENT.Scene.prototype.createEntity = function (type, args) {
  return this.constructEntity(this.entityMap[type], args);
}

TANGENT.Scene.prototype.constructEntity = function (constructor, args) {
  function F() {
    return constructor.apply(this, args);
  }
  F.prototype = constructor.prototype;
  return new F();  
};

TANGENT.Scene.prototype.loadScene = function (data) {
  for(var i in data) {
    this.add(this.createEntity(data[i][0], data[i].slice(1)));
  }
};

TANGENT.Scene.prototype.clear = function () {
  for(var i in this.entities) {
    if(this.entities[i].destroy) {
      this.entities[i].destroy();
    }
  }
  this.entities = [];
}

TANGENT.Scene.prototype.serialize = function () {
  var r = [];
  this.entities.forEach(function (e) {
    if(e.serialize) {
      r.push(e.serialize());
    }
  });
  return r;
};

TANGENT.Scene.prototype.listen = function (thisArg, event, c) {
  if(typeof this.events[event] === 'undefined') {
    this.events[event] = [];
  }
  this.events[event].push({thisArg:thisArg, c:c});
}

TANGENT.Scene.prototype.trigger = function (event, params) {
  var events = event.split(',');
  for(var j in events){
    if(typeof this.events[event] !== 'undefined'){
      for(var i in this.events[event]){
        this.events[event][i].c.apply(this.events[event][i].thisArg, params);
      }
    }
  }
    
};

TANGENT.sortCollisionResultsByPenetration = function (a, b) {
  return a.penetration - b.penetration;
};

TANGENT.Scene.prototype.RayCast = function(ray) {
  ray.collisionResults = [];
  var j, l = this.entities.length;
  for(j=0; j<l; j++) {
    if(!this.entities[j].collider) continue;
    ray.collide(this.entities[j]);
  }
  ray.collisionResults.sort(TANGENT.sortCollisionResultsByPenetration);
}

TANGENT.Scene.prototype.ColliderCast = function(collider) {
  collider.collisionResults = [];
  var j, l = this.entities.length;
  for(j=0; j<l; j++) {
    if(!this.entities[j].collider) continue;
    collider.collide(this.entities[j]);
  }
}

TANGENT.Scene.prototype.update = function (t){
  this.entities.forEach(function (e) {
    e.update(t);
  });
};

TANGENT.Scene.prototype.draw = function (){
  this.entities.forEach(function (e) {
    e.draw();
  });
}; 

TANGENT.Scene.prototype.destroy = function (){
  var self = this;
  var tmp = [];
  this.entities.forEach(function (e, i) {
    if(e.trash){
      if(e.destroy) {
        e.destroy();
      }
    }else{
      tmp.push(e);
    }
  });
  this.entities = tmp;
};

TANGENT.Camera = function() {
  this.rotate = 0;
  this.position = new THREE.Vector2();
  this.aspect = 1024 / 768.0;
  this.zoom = 1;
};

TANGENT.Camera.prototype.frame = function(cx) {
  cx.translate((cx.canvas.width * 0.5), -(cx.canvas.height * 0.5))
  cx.scale(this.zoom, this.zoom);
  cx.translate(-this.position.x, -this.position.y);
};

TANGENT.Input = function() {
  this.keys = [];
  this.keyPressFrame = [];
  this.keyReleaseFrame = [];
  
  for(var i=0;i<255;i++) {
    this.keys[i] = 0;
  }

  for(var i=0;i<255;i++) {
    this.keyReleaseFrame[i] = 0;
  }

  for(var i=0;i<255;i++) {
    this.keyPressFrame[i] = 0;
  }
  
}

TANGENT.Input.prototype.keyPress = function (c) {
  this.keyPressFrame[c] = true;
}

TANGENT.Input.prototype.keyRelease = function (c) {
  this.keyPressFrame[c] = false;
}

TANGENT.Input.prototype.update = function() {
  for(var i=0;i<255;i++) {
    if(this.keyPressFrame[i]) {
      ++this.keys[i];
    }else{
      this.keys[i] = 0;
    }
  }
};


TANGENT.Ray = function (position, direction, length) {
  this.position = position;
  this.direction = direction;
  this.length = length;
  this.collisionResults = [];
};

TANGENT.Ray.prototype.collide = function(other) {
  var penetration;
    if(this.direction === TANGENT.RayDirection.DOWN) {
      if(Math.abs(this.position.x - other.position.x) < other.size.x * 0.5){
        penetration = this.position.y - other.position.y - other.size.y * 0.5;
        if(penetration < this.length && penetration > 0) {
          this.collisionResults.push({other:other, penetration:penetration});
        }
      }
    }
};

TANGENT.BoxCollider = function (position, size) {
  this.diff = new THREE.Vector2();
  this.adiff = new THREE.Vector2();
  this.size = size;
  this.position = position;
};

TANGENT.BoxCollider.prototype.collide = function (other) {
  var xPen, yPen;
  this.diff.subVectors(this.position, other.position);

  var xF = this.size.x * 0.5 + other.size.x * 0.5;
  var yF = this.size.y * 0.5 + other.size.y * 0.5;

  var xPen = xF - Math.abs(this.diff.x);
  var yPen = yF - Math.abs(this.diff.y);

  if(yPen >= 0 && xPen >= 0) {
    
    this.OnCollision(
      xPen * (this.diff.x < 0 ? -1:1),
      yPen * (this.diff.y < 0 ? -1:1),
      other
    );
  }
};

TANGENT.extend = function(dst, src) {

  var constructor = function () {
    src.apply(this);
    dst.apply(this, arguments);
  };

  for(var i in src.prototype) {
    dst.prototype[i] = src.prototype[i];
  }

  constructor.prototype = dst.prototype;

  return constructor;

};
