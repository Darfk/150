var Editor = function () {
  this.position = new THREE.Vector2();
  this.mode = 0;
  this.spawnEntity = null;
  this.spawnEntityIdx = 0;
  this.boxCollider = new TANGENT.BoxCollider(new THREE.Vector2(), new THREE.Vector2(8,8));

  this.spawnEntityEnum = [];
  for(var i in tangentScene.entityMap) {
    this.spawnEntityEnum.push(i);
  }

  this.spawnEntity = tangentScene.createEntity(
    this.spawnEntityEnum[this.spawnEntityIdx],
    [this.position.x, this.position.y, 8, 8]
  );

};

Editor.prototype.gridLines = 4;
Editor.prototype.gridPow = 3;
Editor.prototype.gridSize = 8;

Editor.prototype.update = function () {

  if(input.keys[65] === 1){
    this.spawnEntityIdx = (this.spawnEntityIdx - 1).wrap(this.spawnEntityEnum.length);
    this.spawnEntity = tangentScene.createEntity(
      this.spawnEntityEnum[this.spawnEntityIdx],
      [this.position.x, this.position.y, 8, 8]
    );
  }

  if(input.keys[83] === 1){
    this.spawnEntityIdx = (this.spawnEntityIdx + 1).wrap(this.spawnEntityEnum.length);
    this.spawnEntity = tangentScene.createEntity(
      this.spawnEntityEnum[this.spawnEntityIdx],
      [this.position.x, this.position.y, 8, 8]
    );
  }

  if(input.keys[79] === 1) {
    localStorage.setItem("level", JSON.stringify(tangentScene.serialize()))
    console.log("saved");
  }    

  // if(input.keys[73] === 1) {
  //   console.log();
  //   if(typeof localStorage.level !== "undefined"){
  //     tangentScene.loadScene(JSON.parse(localStorage.level));
  //     tangentScene.add(new Editor());
  //     console.log("loaded");
  //   }
  // }    

  if(input.keys[39] === 1 || input.keys[39] > 20){
    this.position.x += this.gridSize
  }
  if(input.keys[37] === 1 || input.keys[37] > 20){
    this.position.x -= this.gridSize
  }
  if(input.keys[38] === 1 || input.keys[38] > 20){
    this.position.y += this.gridSize
  }
  if(input.keys[40] === 1 || input.keys[40] > 20){
    this.position.y -= this.gridSize
  }

  if(input.keys[88]){
    this.boxCollider.OnCollision = function (x, y, o){
      o.trash = true;
    };
    tangentScene.ColliderCast(this.boxCollider)
  }

  if(input.keys[90] === 1){
    tangentScene.add(tangentScene.createEntity(
      this.spawnEntityEnum[this.spawnEntityIdx],
      [this.position.x, this.position.y, 8, 8]
    ));
  }

  if(input.keys[69] === 1){
    this.gridPow++;
    this.gridPow = Math.max(0, Math.min(7, this.gridPow));
  }

  if(input.keys[87] === 1){
    this.gridPow--;
    this.gridPow = Math.max(0, Math.min(7, this.gridPow));
  }

  this.gridSize = Math.pow(2, this.gridPow);

  if(input.keys[81] === 1){
    this.position.x = this.gridSize * Math.floor(this.position.x / this.gridSize);
    this.position.y = this.gridSize * Math.floor(this.position.y / this.gridSize);
  }

  this.boxCollider.size.x = this.gridSize;
  this.boxCollider.size.y = this.gridSize;
  this.boxCollider.position.x = this.position.x;
  this.boxCollider.position.y = this.position.y;

};

Editor.prototype.draw = function () {

  if(this.spawnEntity && !input.keys[88]) {
    this.spawnEntity.position.x = this.position.x;
    this.spawnEntity.position.y = this.position.y;
    cx.save();
    cx.globalAlpha = 0.5;
    this.spawnEntity.draw();
    cx.restore();
  }

  cx.save();
  cx.translate(this.position.x, this.position.y);

  if(input.keys[88]){
    cx.strokeStyle = '#ff8080';
    cx.strokeRect(-this.gridSize / 2, -this.gridSize / 2, this.gridSize, this.gridSize);
  }else{
    cx.strokeStyle = '#a0a0a0';
    cx.beginPath();
    cx.moveTo(-this.gridSize / 2, 0);
    cx.lineTo( this.gridSize / 2, 0);
    cx.moveTo(0, -this.gridSize / 2);
    cx.lineTo(0,  this.gridSize / 2);
    cx.stroke();
  }

  var y=1;

  debug.fillText('Z: place ' + this.spawnEntityEnum[this.spawnEntityIdx], 10, (++y*16));
  debug.fillText('X: delete', 10, (++y*16));
  debug.fillText('A/S: prev/next', 10, (++y*16));
  debug.fillText('Q: snap grid', 10, (++y*16));
  debug.fillText('W/E: -/+ grid', 10, (++y*16));
  debug.fillText('O: save', 10, (++y*16));
  debug.fillText('grid: ' + this.gridSize, 10, (++y*16));
  debug.fillText('x, y: ' + this.position.x + ', ' + this.position.y, 10, (++y*16));


  cx.restore();
};
