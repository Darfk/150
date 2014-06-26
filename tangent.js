var TANGENT = {};

TANGENT.Scene = function () {
    this.entities = [];
}

TANGENT.Scene.prototype.add = function(e) {
  this.entities.push(e);
}

TANGENT.Scene.prototype.collide = function (){
  var i, j, l, self = this;
  l = this.entities.length;
  for(i=0; i<l; i++) {
    if(!this.entities[i].body) continue;
    for(j=0; j<l; j++) {
      if(!this.entities[j].collider) continue;
      if(this.entities[i] === this.entities[j]) continue;
      this.entities[i].collide(this.entities[j]);
    }
  }
};

TANGENT.Scene.prototype.update = function (){
  this.entities.forEach(function (e) {
    e.update();
  });
};

TANGENT.Scene.prototype.draw = function (){
  this.entities.forEach(function (e) {
    e.draw();
  });
}; 

TANGENT.Scene.prototype.destroy = function (){
  this.entities.forEach(function (e, i) {
    if(e.trash){
      if(e.destroy) {
        e.destroy();
      }
      delete this.entities[i];
    }
  });
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

}

TANGENT.Body = function () {
  this.diff = new THREE.Vector2();
  this.adiff = new THREE.Vector2();
}

TANGENT.Body.prototype.collide = function (other) {

  var xPen, yPen;

  this.diff.subVectors(this.position, other.position);
  
  this.adiff.copy(this.diff);
  this.adiff.x = Math.abs(this.adiff.x);
  this.adiff.y = Math.abs(this.adiff.y);

  xPen = this.halves.x + other.halves.x - this.adiff.x;
  yPen = this.halves.y + other.halves.y - this.adiff.y;

  if(yPen > 0 && xPen > 0) {
    if(xPen > yPen) {
      this.velocity.y = 0;
      if(this.diff.y < 0) {
        this.position.y -= yPen;
      }else{
        this.position.y += yPen;
        this.ground = true;
      }
    }else{
      this.velocity.x = 0;
      if(this. diff.x < 0) {
        this.position.x -= xPen;
      }else{
        this.position.x += xPen;
      }
    }
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

}


TANGENT.testShaderMaterial = new THREE.ShaderMaterial({
  vertexShader:"void main() {gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);}",
  fragmentShader:"void main() {gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);}"
});

