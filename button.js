var Button = function (posX, posY, sizeX, sizeY, triggerOnPress) {
  this.position = new THREE.Vector3(posX, posY, 0);
  this.velocity = new THREE.Vector2();
  this.size = new THREE.Vector2(sizeX, sizeY);
  this.collider = true;
  this.state = false;
  this.triggerOnPress = triggerOnPress;
};

Button.prototype.serialize = function () {
  return [
    this.type,
    this.position.x,
    this.position.y,
    this.size.x,
    this.size.y,
    this.triggerOnPress,
  ];
};

Button.prototype.trigger = function (type, o) {
  this.state = true;
  tangentScene.trigger(this.triggerOnPress);
}

Button.prototype.type = 'button';
Button.prototype.draw = function () {
  cx.save();

  if(this.state) {
    cx.fillStyle='#00d000';
    cx.strokeStyle='#00e000';
  }else{
    cx.fillStyle='#800000';
    cx.strokeStyle='#600000';
  }

  cx.translate(this.position.x - this.size.x * 0.5, this.position.y - this.size.y * 0.5);
  cx.fillRect(0,0,this.size.x,this.size.y)
  cx.strokeRect(0,0,this.size.x,this.size.y)
  cx.restore();
};

Button.prototype.update = function (t) {};

