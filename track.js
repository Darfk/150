var Track = function () {
  this.a = new Audio();
  this.a.src = 'wing.ogg';
  this.a.volume = 1;
  this.a.play();
  this.bpm = 112.0;
  this.offset = -0.0;
};

Track.prototype.type = 'track';

Track.prototype.draw = function () {
  if(this.startBeat){
    debug.fillStyle="#ffffff";
    if(this.startBar)
      debug.fillStyle="#ff0000";
    debug.fillRect(0, 0, 10, 10);
  }
};

Track.prototype.update = function (t) {
  if(this.a.played.length > 0) {
    this.cur = this.a.played.end(0);
    this.beatClamp = ((this.cur + this.offset) * (this.bpm / 60.0)) % 1;
    this.barClamp = ((this.cur + this.offset) * (this.bpm / 60.0)) / 4 % 1;
    this.beat = ((this.cur + this.offset) * (this.bpm / 60.0)).toFixed(0);
    this.startBeat = this.prevBeat !== this.beat;
    this.prevBeat = this.beat;
    this.barBeat = this.beat % 4 + 1;
    this.bar = Math.floor((this.beat / 4 + 1));
    this.startBar = this.prevBar !== this.bar;
    this.prevBar = this.bar;
  }
};
