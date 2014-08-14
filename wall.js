var Wall = function (posX, posY, sizeX, sizeY) {
  this.position = new THREE.Vector3(posX, posY, 0);
  this.velocity = new THREE.Vector2();
  this.size = new THREE.Vector2(sizeX, sizeY);
  this.collider = true;
};

Wall.prototype.serialize = function () {
  return [
    this.type,
    this.position.x,
    this.position.y,
    this.size.x,
    this.size.y,
  ];
};

Wall.prototype.type = 'wall';
Wall.prototype.draw = function () {
  cx.save();
  cx.fillStyle='#606060';
  cx.translate(this.position.x - this.size.x * 0.5, this.position.y - this.size.y * 0.5);
  cx.fillRect(0,0,this.size.x,this.size.y)
  cx.strokeStyle='#808080';
  cx.strokeRect(0,0,this.size.x,this.size.y)
  cx.restore();
};

Wall.prototype.update = function (t) {};

