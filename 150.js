var aspect = 16/9;
var height = 720;
var cx = document.createElement('canvas');
document.body.appendChild(cx);
cx = cx.getContext('2d');
cx.canvas.width = 1024;
cx.canvas.height = 768;
cx.canvas.id = "main";

var debug = document.createElement('canvas');
document.body.appendChild(debug);
debug = debug.getContext('2d');
debug.canvas.width = 240;
debug.canvas.height = 10 * 16;
debug.font = '16pt Courier';
debug.canvas.id = "debug";

var textarea = document.createElement('textarea');
textarea.id = "params";
document.body.appendChild(textarea);

var tangentScene = new TANGENT.Scene();

var input = new TANGENT.Input();

cx.canvas.tabIndex = 1;
cx.canvas.focus();
cx.canvas.addEventListener("keydown", function (e) {
  input.keyPress(e.keyCode);
}, false);

cx.canvas.addEventListener("keyup", function (e) {
  input.keyRelease(e.keyCode);
}, false);

var world = {
  gravity: new THREE.Vector2(0, -0.2),
};

// tangentScene.add(new Wall(0, -80, 128, 16));
// tangentScene.add(new Platform(-64, -128, 64, 16));
// tangentScene.add(new Platform(-96, -128, 64, 16));

tangentScene.registerEntityTypes([Wall, JumpPad, Coin, Platform]);

// tangentScene.add(new JumpPad(0, -64));
// tangentScene.add(new JumpPad(64, -64));

// tangentScene.add(new Wall(0, -80, 128, 8));

var camera = new TANGENT.Camera();
camera.zoom = 4;

var mode = 0, player, editor;

function switchMode() {
    mode = mode === 0 ? 1 : 0;
    tangentScene.entities = [];

    if(mode){
      if(typeof localStorage.level !== "undefined"){
        tangentScene.loadScene(JSON.parse(localStorage.level));
      }
      console.log("loaded");
      player = new Player();
      tangentScene.add(player);
    }else{
      if(typeof localStorage.level !== "undefined"){
        tangentScene.loadScene(JSON.parse(localStorage.level));
      }
      editor = new Editor();

      if(typeof localStorage.spawnParams !== "undefined"){
        editor.SpawnParamsString = localStorage.spawnParams;
        editor.MakeParams();
        textarea.value = localStorage.spawnParams;
      }
      tangentScene.add(editor);
    }
}

switchMode();

textarea.addEventListener("keyup", function (e) {
  e.stopPropagation();
  if(!editor) return;
  editor.SpawnParamsString = e.target.value;
  if (editor.MakeParams() === true) {
    e.target.className = "";
  }else{
    e.target.className = "invalid";
  }
}, false);

if(editor) {
  textarea.value = editor.SpawnParamsString;
}

function main(t) {
  debug.fillStyle = '#fff';
  debug.save();
  debug.fillStyle = '#000';
  debug.globalAlpha = 0.75;
  debug.clearRect(0, 0, debug.canvas.width, debug.canvas.height);
  debug.fillRect(0, 0, debug.canvas.width, debug.canvas.height);
  debug.restore();

  if(mode){
    var y = 0;
    debug.fillText("P: editor", 10, (++y*16));
    debug.fillText('Z: jump', 10, (++y*16));
    debug.fillText('←/→: move', 10, (++y*16));
    debug.fillText('arbitrarium: ' + player.coin, 10, (++y*16));
  }else{
    var y = 0;
    debug.fillText("P: game", 10, (++y*16));
  }

  input.update();

  if(input.keys[80] === 1){
    switchMode();
  }

  tangentScene.update(t);
  tangentScene.collide();

  tangentScene.destroy();

  cx.clearRect(0, 0, cx.canvas.width, cx.canvas.height);
  cx.save();
  cx.scale(1, -1);

  if(mode) {
    camera.position.x += (player.position.x - camera.position.x) / 10;
    camera.position.y += (player.position.y - camera.position.y) / 10;
  }else{
    camera.position.x += (editor.position.x - camera.position.x) / 4;
    camera.position.y += (editor.position.y - camera.position.y) / 4;
  }

  camera.frame(cx);

  tangentScene.draw();

  cx.restore();

  requestAnimationFrame(main);
}

main();
