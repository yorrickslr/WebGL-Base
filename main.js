// meta vars
let gl;
let canvas;
let frame;

// shaders and programs
let vertShader;
let fragShader;
let shader;

// resources
let monkeyGeometry;
let monkeyBuffer;

// matrices
let projectionMat = glMatrix.mat4.create();
let viewMat = glMatrix.mat4.create();
let modelMat = glMatrix.mat4.create();


// initShaders and initGeometry are asynchronous functions;
// however, the subsequent lines depend on these functions;
// therefore we AWAIT these functions and have to declare
// the init() function as ASYNC, too
async function init() {
  // init DOM elements and WebGL
  canvas = document.querySelector("canvas");
  // gl = canvas.getContext("webgl"); // for WebGL1
  gl = canvas.getContext("webgl2"); // for WebGL2
  gl.clearColor(0.15, 0.15, 0.15, 1.0);
  gl.enable(gl.DEPTH_TEST);
  gl.depthFunc(gl.LEQUAL);
  gl.enable(gl.BLEND);
  // call gl.getExtension() here

  await initShaders();
  await initGeometry();

  // set camera view back 5 units
  glMatrix.mat4.translate(viewMat, viewMat, glMatrix.vec3.fromValues(0, 0, -3));

  // initial resize of canvas and viewport
  resizeCallback();

  // initiate the browser-controlled rendering loop
  start();
}

// loadShader returns a PROMISE whose result we have to AWAIT
// in order to compile the shader; therefore the function is
// declared as ASYNC
async function initShaders() {
  vertShader = await loadShader("shaders/simple.vert");
  fragShader = await loadShader("shaders/simple.frag");

  shader = gl.createProgram();
  gl.attachShader(shader, vertShader);
  gl.attachShader(shader, fragShader);
  gl.linkProgram(shader);

  if(!gl.getProgramParameter(shader, gl.LINK_STATUS)) {
    console.error("could not link shader");
  }
}

// loadObj returns a PROMISE whose result we have to AWAIT
// in order to upload the geometry; therefore the function is
// declared as ASYNC
async function initGeometry() {
  monkeyGeometry = await loadObj("objects/monkey.obj");

  gl.useProgram(shader);

  // upload monkey geometry to monkey array buffer
  monkeyBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, monkeyBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, monkeyGeometry.vertices, gl.STATIC_DRAW);
}

// main rendering function that is looped by browser
function draw() {
  frame = window.requestAnimationFrame(draw);

  // rotate model every frame and upload adjusated model matrix
  glMatrix.mat4.rotateY(modelMat, modelMat, -0.005);
  let modelMatLoc = gl.getUniformLocation(shader, "ModelMat");
  gl.uniformMatrix4fv(modelMatLoc, false, new Float32Array(modelMat));

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  
  gl.useProgram(shader);

  // bind monkey buffer to array buffer
  gl.bindBuffer(gl.ARRAY_BUFFER, monkeyBuffer);
  // define the vertex layout for the position attachment
  let positionLocation = gl.getAttribLocation(shader, "inPosition");
  gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, gl.FALSE, Float32Array.BYTES_PER_ELEMENT * 6, 0);
  gl.enableVertexAttribArray(positionLocation);

  // define the vertex layout for the color attachment
  let colorLocation = gl.getAttribLocation(shader, "inColor");
  gl.vertexAttribPointer(colorLocation, 3, gl.FLOAT, gl.FALSE, Float32Array.BYTES_PER_ELEMENT * 6, Float32Array.BYTES_PER_ELEMENT * 3);
  gl.enableVertexAttribArray(colorLocation);

  gl.drawArrays(gl.TRIANGLES, 0, monkeyGeometry.vertexCount);
};

// request browser-controlled rendering loop for draw()
function start() {
  frame = window.requestAnimationFrame(draw);
}

// this function cancels the browser-controlled rendering loop
// and can be useful for debugging; is not needed for deploy
function stop() {
  window.cancelAnimationFrame(frame);
}

// handles the adjustment of the canvas resolution
function resizeCallback() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  gl.viewport(0, 0, canvas.width, canvas.height);
  projectionMat = glMatrix.mat4.create();
  // perspective projection
  glMatrix.mat4.perspective(projectionMat, 45, canvas.width/canvas.height, 0.1, 100.0);
  
  // exemplary orthogonal projection
  // let ratio = canvas.width/canvas.height;
  // let zoom = 1.5;
  // glMatrix.mat4.ortho(projectionMat, ratio * -zoom, ratio * zoom, -zoom, zoom, 0.1, 100);

  // upload changed uniforms
  let projectionMatLoc = gl.getUniformLocation(shader, "ProjectionMat");
  gl.uniformMatrix4fv(projectionMatLoc, false, new Float32Array(projectionMat));

  let viewMatLoc = gl.getUniformLocation(shader, "ViewMat");
  gl.uniformMatrix4fv(viewMatLoc, false, new Float32Array(viewMat));
}

// register init() for execution when the content of the HTML file is ready
document.addEventListener("DOMContentLoaded", init);

//register the resizeCallback() for when the browser window is resized
window.addEventListener("resize", resizeCallback);

// get rid of the WebGL context when tab is closed or reloaded
window.addEventListener("beforeunload", event => {
  gl.getExtension('WEBGL_lose_context').loseContext();
});
