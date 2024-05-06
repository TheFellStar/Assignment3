var VSHADER_SOURCE = `
  precision mediump float;
  attribute vec4 a_Position;
  attribute vec2 a_UV;
  varying vec2 v_UV;
  uniform mat4 u_ModelMatrix;
  uniform mat4 u_GlobalRotateMatrix;
  uniform mat4 u_ViewMatrix;
  uniform mat4 u_ProjectionMatrix;
  void main(){
    gl_Position = u_ProjectionMatrix * u_ViewMatrix * u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
    v_UV = a_UV;
  }`

var FSHADER_SOURCE = `
precision mediump float;
varying vec2 v_UV;
uniform vec4 u_FragColor;
uniform sampler2D u_Sampler0;
uniform sampler2D u_Sampler1;
uniform int u_whichTexture;
void main(){
  if(u_whichTexture == -2){
    gl_FragColor = u_FragColor;
  }else if(u_whichTexture == -1){
    gl_FragColor = vec4(v_UV,1.0,1.0);
  }else if(u_whichTexture == 0){
    gl_FragColor = texture2D(u_Sampler0, v_UV);
  }else if(u_whichTexture ==1){
    gl_FragColor = texture2D(u_Sampler1, v_UV);
  }else{
    gl_FragColor = vec4(1,.2,.2,1);
  }
}`

let canvas;
let gl;
let a_Position;
let a_UV;
let u_FragColor;
let u_Size;
let u_ModelMatrix;
let u_ProjectionMatrix;
let u_ViewMatrix;
let u_GlobalRotateMatrix;
let u_Sampler0;
let u_Sampler1;
let u_whichTexture;

function setupWebGL(){
    //Retrieve <canvas> element
    canvas = document.getElementById('webgl');

    //Get the rendering context for WebGL
    gl = canvas.getContext("webgl",{ preserveDrawingBuffer: true});
    if(!gl){
        console.log('Failed to get the rendering context for WebGL');
        return;
    }    

    gl.enable(gl.DEPTH_TEST);
}

function connectVariablesToGLSL(){
    // Initialize shaders
    if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
        console.log('Failed to initialize shaders.');
        return;
    }

    // Get the storage location of a_Position variable
    a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    if(a_Position < 0){
        console.log('Failed to get the storage location of a_Position');
        return;
    }

    a_UV = gl.getAttribLocation(gl.program, 'a_UV');
    if(a_UV < 0){
        console.log('Failed to get the storage location of a_UV');
        return;
    }

    // Get the  storage location of u_FragColor variable
    u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
    if(!u_FragColor){
        console.log('Failed to get the storage location of u_FragColor');
        return;
    }

    u_whichTexture = gl.getUniformLocation(gl.program, 'u_whichTexture');

    //Get the storage location of u_Size
    // u_Size = gl.getUniformLocation(gl.program, 'u_Size');
    // if(!u_Size){
    //     console.log('Failed to get the storage location of u_Size');
    //     return;
    // }

    u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
    if(!u_ModelMatrix){
        console.log('Failed to get the storage location of u_ModelMatrix');
        return;
    }

    u_GlobalRotateMatrix = gl.getUniformLocation(gl.program, 'u_GlobalRotateMatrix');
    if(!u_GlobalRotateMatrix){
        console.log('Failed to get the storage location of u_GlobalRotateMatrix');
    }

    u_ViewMatrix = gl.getUniformLocation(gl.program, 'u_ViewMatrix');
    if(!u_ViewMatrix){
        console.log('Failed to get the storage location of u_ViewMatrix');
        return;
    }

    u_ProjectionMatrix = gl.getUniformLocation(gl.program, 'u_ProjectionMatrix');
    if(!u_ProjectionMatrix){
        console.log('Failed to get the storage location of u_ProjectionMatrix');
        return;
    }

    u_Sampler0 = gl.getUniformLocation(gl.program, 'u_Sampler0');
    if(!u_Sampler0){
        console.log('Failed to get the storage location of u_Sampler0');
        return;
    }

    u_Sampler1 = gl.getUniformLocation(gl.program, 'u_Sampler1');
    if(!u_Sampler1){
        console.log('Failed to get the storage location of u_Sampler1');
        return;
    }

    var identityM = new Matrix4();
    gl.uniformMatrix4fv(u_ModelMatrix, false, identityM.elements);
}

//Constants
const POINT = 0;
const TRIANGLE = 1;
const CIRCLE = 2;

let g_selectedColor=[1.0,1.0,1.0,1.0];
let g_size=5;
let g_selectedType=POINT;
let g_globalAngle=45;
let g_mainAngle=0;
let g_yellowAngle=0;
let g_magentaAngle=0;
let g_bodyAngle=0;
let g_backAngle=0;
let g_yellowAnimation=false;
let g_magentaAnimation=false;
let g_bodyAnimation=false;
//let g_segment=10;

//Set up actions for the HTML UI elements
function addActionsForHtmlUI(){

    //Button Events (Shape Type)
    document.getElementById('animationYellowOffButton').onclick = function() {g_yellowAnimation=false;};
    document.getElementById('animationYellowOnButton').onclick = function() {g_yellowAnimation=true;};
    document.getElementById('animationMagentaOffButton').onclick = function() {g_magentaAnimation=false;};
    document.getElementById('animationMagentaOnButton').onclick = function() {g_magentaAnimation=true;};
    document.getElementById('animationBodyOffButton').onclick = function() {g_bodyAnimation=false;};
    document.getElementById('animationBodyOnButton').onclick = function() {g_bodyAnimation=true;};
    //document.getElementById('green').onclick = function() { g_selectedColor = [0.0,1.0,0.0,1.0];};
    //document.getElementById('red').onclick = function() { g_selectedColor = [1.0,0.0,0.0,1.0];};
    //document.getElementById('clearButton').onclick = function() {g_shapesList=[]; renderAllShapes();};

    //document.getElementById('pointButton').onclick = function() {g_selectedType=POINT};
    //document.getElementById('triButton').onclick = function() {g_selectedType=TRIANGLE};
    //document.getElementById('circleButton').onclick = function() {g_selectedType=CIRCLE};

    //Slider Events
    //document.getElementById('redSlide').addEventListener('mouseup', function() {g_selectedColor[0] = this.value/100;});
    document.getElementById('magentaSlide').addEventListener('mousemove', function() {g_magentaAngle = this.value; renderScene();});
    document.getElementById('yellowSlide').addEventListener('mousemove', function() {g_yellowAngle = this.value; renderScene();});
    document.getElementById('mainSlide').addEventListener('mousemove', function() {g_mainAngle = this.value; renderScene();});
    document.getElementById('backSlide').addEventListener('mousemove', function() {g_backAngle = this.value; renderScene();});

    //Size Slider Events
    document.getElementById('angleSlide').addEventListener('mousemove', function() { g_globalAngle = this.value; renderScene();});
    //document.getElementById('segSlide').addEventListener('mouseup', function() { g_segment = this.value;});


    //document.getElementById('pictureButton').onclick = function() {drawPicture();};

    canvas.onmousemove = function(ev){ if(ev.buttons ==1){ click(ev); } };
}

function initTextures(){
    // var u_Sampler0 = gl.getUniformLocation(gl.program, 'u_Sampler0');
    // if(!u_Sampler0){
    //     console.log('Failed to get the storage location of u_Sampler0');
    //     return false;
    // }
    var image = new Image();
    if(!image){
        console.log('Failed to create the image object');
        return false;
    }

    image.onload = function(){ sendImageToTEXTURE0(image, 0);};

    image.src = 'sky.jpg';

    var groundImg = new Image();
    if(!groundImg){
        console.log('Failed to create the image object');
        return false;
    }

    groundImg.onload = function(){ sendImageToTEXTURE0(groundImg, 1);};

    groundImg.src = 'ground.jpeg';

    return true;
}

function sendImageToTEXTURE0(image, type){
    var texture = gl.createTexture();
    if(!texture){
        console.log('Failed to create the texture object');
        return false;
    }

    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1); //Flip the image's y axis
    //Enable texture unit0
    
    if(type == 0){
        gl.activeTexture(gl.TEXTURE0);
    }else{
        gl.activeTexture(gl.TEXTURE1);
    }
    //Bind the texture object to the target
    gl.bindTexture(gl.TEXTURE_2D, texture);

    //set the texture parameters
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    //set the texture image
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);

    //set the texture unit0 to the sampler
    if(type == 0){
        gl.uniform1i(u_Sampler0, 0);
    }else{
        gl.uniform1i(u_Sampler1, 1);
    }

    console.log('finished loadTexture');
}

function main() {

    setupWebGL();
    connectVariablesToGLSL();
    addActionsForHtmlUI();

    document.onkeydown = keydown;

    initTextures();

    //Specify the color for clearing <canvas>
    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    //Clear <canvas>
    //gl.clear(gl.COLOR_BUFFER_BIT);
    //renderScene();
    requestAnimationFrame(tick);
}

var g_startTime = performance.now()/1000.0;
var g_seconds = performance.now()/1000.0-g_startTime;

function tick(){

    g_seconds=performance.now()/1000.0-g_startTime;
    //console.log(g_seconds);

    updateAnimationAngles();
    renderScene();

    requestAnimationFrame(tick);
}

function updateAnimationAngles(){
    if(g_yellowAnimation){
        g_yellowAngle = (45*Math.sin(g_seconds));
    }
    if(g_magentaAnimation){
        g_magentaAngle = (45*Math.sin(3*g_seconds));
    }
    if(g_bodyAnimation){
        g_bodyAngle = 50*g_seconds;
    }
}

function keydown(ev){
    if(ev.keyCode==39){ //Right arrow
        g_eye[0] += 0.2;
    }else if(ev.keyCode == 37){ //left arrow
        g_eye[0] -= 0.2;
    }
    if(ev.keyCode==38){
        g_eye[2] -= 0.2;
    }else if(ev.keyCode == 40){
        g_eye[2] += 0.2;
    }

    renderScene();
    console.log(ev.keyCode);
}

var g_eye=[0,0,3];
var g_at=[0,0,-100];
var g_up=[0,1,0];

//var g_camera=new Camera();

var g_map=[
    [1,1,1,1,1,1,1,1],
    [1,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,1],
    [1,0,0,1,1,0,0,1],
    [1,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,1],
    [1,0,0,0,1,0,0,1],
    [1,0,0,0,0,0,0,1],
];

function drawMap(){
    for(x=0;x<32;x++){
        for(y=0;y<32;y++){
            if(x<1||x==31||y==0||y==31){
                var body = new Cube();
                body.color = [0.8,1,1,1];
                body.matrix.translate(0,-.75,0);
                body.matrix.scale(.4,.4,.4);
                body.matrix.translate(x-16,0,y-16);
                body.renderfast();
            }
        }
    }
}

function renderScene(){
    var startTime = performance.now();

    var projMat=new Matrix4();
    projMat.setPerspective(50, 1*canvas.width/canvas.height, 1, 100);
    gl.uniformMatrix4fv(u_ProjectionMatrix, false, projMat.elements);

    var viewMat=new Matrix4();
    //viewMat.setLookAt(g_camera.eye.x, g_camera.eye.y, g_camera.eye.z, g_camera.at.x, g_camera.at.y, g_camera.at.z, g_camera.up.x, g_camera.up.y, g_camera.up.z);
    viewMat.setLookAt(g_eye[0],g_eye[1],g_eye[2],g_at[0],g_at[1],g_at[2],g_up[0],g_up[1],g_up[2]);
    gl.uniformMatrix4fv(u_ViewMatrix, false, viewMat.elements);

    var globalRotMat = new Matrix4().rotate(g_globalAngle,0,1,0);
    gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.clear(gl.COLOR_BUFFER_BIT);

    //drawMap();

    var floor = new Cube();
    floor.color = [1.0,0.0,0.0,1.0];
    floor.textureNum=1;
    floor.matrix.translate(0,-.75,0.0);
    floor.matrix.scale(10,0,10);
    floor.matrix.translate(-.5,0,-.5);
    floor.render();

    var sky = new Cube();
    sky.color =[1.0,0.0,0.0,1.0];
    sky.textureNum=0;
    sky.matrix.scale(50,50,50);
    sky.matrix.translate(-.5,-.5,-0.5);
    sky.render();

    var body = new Cube();
    body.color = [1.0,0.0,0.0,1.0];
    body.textureNum=-2;
    body.matrix.translate(-.25, -.75, 0.0);
    body.matrix.rotate(-5,1,0,0);
    body.matrix.scale(0.5, .3, .5);
    body.render();

    var yellow = new Cube();
    yellow.color = [1,1,0,1];
    yellow.textureNum=-2;
    yellow.matrix.setTranslate(0, -.5, 0.0);
    yellow.matrix.rotate(-5, 1,0,0);
    yellow.matrix.rotate(-g_yellowAngle, 0, 0,1);
    var yellowCoordinatesMat=new Matrix4(yellow.matrix);
    yellow.matrix.scale(0.25, .7, .5);
    yellow.matrix.translate(-.5,0,0);
    yellow.render();

    var magenta = new Cube();
    magenta.color = [1,0,1,1];
    magenta.textureNum=-2;
    magenta.matrix = yellowCoordinatesMat;
    magenta.matrix.translate(0, 0.65, 0);
    magenta.matrix.rotate(g_magentaAngle,0,0,1);
    magenta.matrix.scale(.3,.3,.3);
    magenta.matrix.translate(-.5,0,-0.001);
    magenta.render();

    var ground = new Cube();
    ground.matrix.translate(0,0,-1);
    ground.matrix.scale(2,.1,2);
    ground.render();

    var duration = performance.now() - startTime;
    sendTextToHTML( " ms: " + Math.floor(duration) + " fps: " + Math.floor(10000/duration)/10, "numdot");
}

function sendTextToHTML(text, htmlID) {
    var htmlElm = document.getElementById(htmlID);
    if(!htmlElm){
        console.log("Failed to get " + htmlID + " from HTML");
        return;
    }
    htmlElm.innerHTML = text;
}
