var Platform = function (posX, posY, sizeX, sizeY) {
  this.position = new THREE.Vector3(posX, posY, 0);
  this.origin = new THREE.Vector3(posX, posY, 0);
  this.velocity = new THREE.Vector2();
  this.size = new THREE.Vector2(sizeX, sizeY);
  this.collider = true;
  this.nonStationary = true;
  this.deltaPosition = new THREE.Vector2();
};

Platform.prototype.serialize = function () {
  return [
    this.type,
    this.origin.x,
    this.origin.y,
    this.size.x,
    this.size.y,
  ];
};


Platform.prototype.type = 'platform';
Platform.prototype.draw = function () {
  cx.save();
  cx.fillStyle='#606060';
  cx.translate(this.position.x - this.size.x * 0.5, this.position.y - this.size.y * 0.5);
  cx.fillRect(0,0,this.size.x,this.size.y)
  cx.strokeStyle='#808010';
  cx.strokeRect(0,0,this.size.x,this.size.y)
  cx.restore();
};

Platform.prototype.update = function (t) {
  this.deltaPosition.copy(this.position);
  this.position.y = this.origin.y + track.barClamp * 32;
  this.deltaPosition.subVectors(this.position, this.deltaPosition);
};
