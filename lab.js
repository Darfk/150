var aspect = 16/9;
var height = 720;
var cx = document.createElement('canvas');
document.body.appendChild(cx);
cx = cx.getContext('2d');
cx.canvas.width = 1024;
cx.canvas.height = 768;

var debug = document.createElement('canvas');
document.body.appendChild(debug);
debug = debug.getContext('2d');
debug.canvas.width = 256;
debug.canvas.height = 10 * 16;
debug.font = '16pt Courier';

var tangentScene = new TANGENT.Scene();

var input = new TANGENT.Input();
document.body.onkeydown = function (e) {
  input.keyPress(e.keyCode);
};

document.body.onkeyup = function (e) {
  input.keyRelease(e.keyCode);
};

cx.canvas.onmousemove = function (e) {
  input.mouseMove(e.clientX, e.clientY);
}

cx.canvas.onmousedown = function (e) {
  input.mouseButtonPress(e.buttons);
}

cx.canvas.onmouseup = function (e) {
  input.mouseButtonRelease(e.buttons);
}


var Block = function () {
  this.position = new THREE.Vector3(0, 0);
  this.velocity = new THREE.Vector2();
  this.size = new THREE.Vector2(16, 16);

  this.boxCollider = new TANGENT.BoxCollider(new THREE.Vector2(),
                                             new THREE.Vector2(this.size.x, this.size.y));

  this.properPosition = new THREE.Vector2();
  this.surfacePositionY = new THREE.Vector2();
  this.surfacePositionX = new THREE.Vector2();

  this.lastPosition = new THREE.Vector2();
  this.lastDiff = new THREE.Vector2();

  this.drawResting = false;
  this.pens = [];
};

Block.prototype.update = function (t) {

  this.drawResting = false;
  this.boxCollider.position.x = this.position.x;
  this.boxCollider.position.y = this.position.y

  this.lastDiff.subVectors(this.position, this.lastPosition);

  this.surfacePositionX.x = this.position.x;
  this.surfacePositionX.y = this.position.y;

  this.surfacePositionY.x = this.position.x;
  this.surfacePositionY.y = this.position.y;

  this.properPosition.x = this.position.x;
  this.properPosition.y = this.position.y;

  this.pens = [];

  var self = this;

  this.restingPoints = [];

  this.boxCollider.OnCollision = function (x, y, o) { 
    self.pens.push(new THREE.Vector2(x, y));
    self.surfacePositionY.y = self.position.y + y;
    self.surfacePositionX.x = self.position.x + x;
    self.restingPoints.push (new THREE.Vector2(self.surfacePositionX.x, self.surfacePositionX.y + (x / self.lastDiff.x) * self.lastDiff.y));
    self.restingPoints.push (new THREE.Vector2(self.surfacePositionY.x + (y / self.lastDiff.y) * self.lastDiff.x, self.surfacePositionY.y))
  };

  for(var i in this.pens) {
    
  }

  tangentScene.ColliderCast(this.boxCollider);

};

Block.prototype.draw = function () {
  cx.save();
  cx.fillStyle='#109010';
  cx.translate(this.position.x - this.size.x * 0.5, this.position.y - this.size.y * 0.5);
  cx.fillRect(0,0,this.size.x,this.size.y)
  cx.strokeStyle='#50b050';
  cx.strokeRect(0,0,this.size.x,this.size.y)
  cx.restore();

  for(var i in this.restingPoints) {
    var r = this.restingPoints[i];
    cx.save();
    cx.globalAlpha = 0.5;
    cx.fillStyle='#901010';
    cx.translate(r.x - this.size.x * 0.5, r.y - this.size.y * 0.5);
    cx.fillRect(0,0,this.size.x,this.size.y)
    cx.strokeStyle='#b05050';
    cx.strokeRect(0,0,this.size.x,this.size.y)
    cx.restore();
  }

  cx.save();
  cx.globalAlpha = 0.5;
  cx.fillStyle='#101090';
  cx.translate(this.lastPosition.x - this.size.x * 0.5, this.lastPosition.y - this.size.y * 0.5);
  cx.fillRect(0,0,this.size.x,this.size.y)
  cx.strokeStyle='#5050b0';
  cx.strokeRect(0,0,this.size.x,this.size.y)
  cx.restore();

  cx.save();
  cx.strokeStyle='#b05050';
  cx.beginPath();
  cx.moveTo(this.lastPosition.x, this.lastPosition.y);
  cx.translate(this.position.x, this.position.y);
  cx.lineTo(0, 0);
  cx.stroke();
  cx.restore();

};

// tangentScene.add(new Wall(-64, 0, 64, 64));
tangentScene.add(new Wall(0, 0, 64, 64));
tangentScene.add(new Wall(48, 0, 16, 16));

var block;
tangentScene.add(block = new Block());

var camera = new TANGENT.Camera();
camera.zoom = 4;

var blockPosition = new THREE.Vector2();

function main(t) {
  debug.fillStyle = '#fff';
  debug.save();
  debug.fillStyle = '#000';
  debug.globalAlpha = 0.75;
  debug.clearRect(0, 0, debug.canvas.width, debug.canvas.height);
  debug.fillRect(0, 0, debug.canvas.width, debug.canvas.height);
  debug.restore();

  input.update();

  blockPosition.x = input.mouseX;
  blockPosition.y = input.mouseY;
  
  camera.screenToWorld(blockPosition);

  if(input.mouseButtons[1] === 1) {
    block.lastPosition.x = blockPosition.x;
    block.lastPosition.y = blockPosition.y;
  }

  debug.fillStyle = '#fff';
  var y = 0;
  debug.fillText(blockPosition.x + ', ' + blockPosition.y, 10, (++y*16));

  block.position.copy(blockPosition);

  tangentScene.update(t);
  tangentScene.collide();

  tangentScene.destroy();

  cx.clearRect(0, 0, cx.canvas.width, cx.canvas.height);

  cx.save();
  cx.scale(1, -1);
  camera.frame(cx);
  tangentScene.draw();
  cx.restore();

  requestAnimationFrame(main);
}

main();

