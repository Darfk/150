var JumpPad = function (posX, posY) {
  this.position = new THREE.Vector3(posX, posY, 0);
  this.origin = new THREE.Vector3(posX, posY, 0);
  this.velocity = new THREE.Vector2();
  this.size = new THREE.Vector2(10, 10);
  this.collider = true;
  this.jumpedOn = false;
  this.jumpedOnTime = 0;
  this.deltaPosition = new THREE.Vector2();
};

JumpPad.prototype.serialize = function () {
  return [
    this.type,
    this.position.x,
    this.position.y
  ];
};

JumpPad.prototype.type = 'jumppad';
JumpPad.prototype.draw = function () {
  cx.save();
  cx.fillStyle='#e02020';
  if(this.jumpedOn) {
    cx.globalAlpha = 0.5;
    cx.fillStyle='#e0e020';
  }
  cx.translate(this.position.x - this.size.x * 0.5, this.position.y - this.size.y * 0.5);
  cx.fillRect(0,0,this.size.x,this.size.y)
  cx.strokeStyle='#e0e0e0';

  cx.strokeRect(0,0,this.size.x,this.size.y)
  cx.restore();
};

JumpPad.prototype.update = function (t) {
  if(this.jumpedOn){
    this.jumpedOnTime++;
    this.collider = false;
    if(this.jumpedOnTime > 100) {
      this.jumpedOn = 0;
      this.collider = true;
    }
  }else{
    this.jumpedOnTime = 0;
  }
};
