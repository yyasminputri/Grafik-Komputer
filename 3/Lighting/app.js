"use strict";

function main() {
  // webgl canvas
  var canvas = document.querySelector("#canvas");
  var gl = canvas.getContext("webgl");
  if (!gl) {
    return;
  }

  
  var program = webglUtils.createProgramFromScripts(gl, ["vertex-shader-3d", "fragment-shader-3d"]);

  var positionLocation = gl.getAttribLocation(program, "a_position");
  var normalLocation = gl.getAttribLocation(program, "a_normal");


  var worldViewProjectionLocation = gl.getUniformLocation(program, "u_worldViewProjection");
  var worldInverseTransposeLocation = gl.getUniformLocation(program, "u_worldInverseTranspose");
  var colorFrontLocation = gl.getUniformLocation(program, "u_colorFront");
  var colorBackLocation = gl.getUniformLocation(program, "u_colorBack");
  var colorTopLocation = gl.getUniformLocation(program, "u_colorTop");
  var colorBottomLocation = gl.getUniformLocation(program, "u_colorBottom");
  var colorLeftLocation = gl.getUniformLocation(program, "u_colorLeft");
  var colorRightLocation = gl.getUniformLocation(program, "u_colorRight");
  var shininessLocation = gl.getUniformLocation(program, "u_shininess");
  var lightDirectionLocation = gl.getUniformLocation(program, "u_lightDirection");
  var limitLocation = gl.getUniformLocation(program, "u_limit");
  var lightWorldPositionLocation = gl.getUniformLocation(program, "u_lightWorldPosition");
  var viewWorldPositionLocation = gl.getUniformLocation(program, "u_viewWorldPosition");
  var worldLocation = gl.getUniformLocation(program, "u_world");

  // buffer postion
  var positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  setGeometry(gl);

  // buffer normal
  var normalBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
  setNormals(gl);

  function radToDeg(r) {
    return r * 180 / Math.PI;
  }

  function degToRad(d) {
    return d * Math.PI / 180;
  }

  var fieldOfViewRadians = degToRad(75);
  var fRotationRadians = 0;
  var shininess = 150;
  var lightRotationX = 0;
  var lightRotationY = 0;
  var lightDirection = [0, 0, 1];
  var limit = degToRad(10);

  drawScene();

  // Setup ui slider
  webglLessonsUI.setupSlider("#Limit", {value: radToDeg(limit), slide: updateLimit, min: 0, max: 180});
  webglLessonsUI.setupSlider("#LightXRotation", {value: lightRotationX, slide: updatelightRotationX, min: -2, max: 2, precision: 2, step: 0.001});
  webglLessonsUI.setupSlider("#LightYRotation", {value: lightRotationY, slide: updatelightRotationY, min: -2, max: 2, precision: 2, step: 0.001});
   webglLessonsUI.setupSlider("#CubeRotation", {value: radToDeg(fRotationRadians), slide: updateRotation, min: -360, max: 360});

   // rotation cube
  function updateRotation(event, ui) {
    fRotationRadians = degToRad(ui.value);
    drawScene();
  }

  // light rotation x
  function updatelightRotationX(event, ui) {
    lightRotationX = ui.value;
    drawScene();
  }
  
  // light rotation y
  function updatelightRotationY(event, ui) {
    lightRotationY = ui.value;
    drawScene();
  }

  // light limit
  function updateLimit(event, ui) {
    limit = degToRad(ui.value);
    drawScene();
  }

  // draw the cube in canvas
  function drawScene() {
    webglUtils.resizeCanvasToDisplaySize(gl.canvas);

    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.enable(gl.CULL_FACE);
    gl.enable(gl.DEPTH_TEST);

    gl.useProgram(program);

    gl.enableVertexAttribArray(positionLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 0, 0);

    gl.enableVertexAttribArray(normalLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
    gl.vertexAttribPointer(normalLocation, 3, gl.FLOAT, false, 0, 0);

    var aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
    var projectionMatrix = m4.perspective(fieldOfViewRadians, aspect, 1, 2000);

    var camera = [15, 17, 25];
    var target = [0, 0, 0];
    var up = [0, 1, 0];
    var cameraMatrix = m4.lookAt(camera, target, up);
    var viewMatrix = m4.inverse(cameraMatrix);
    var viewProjectionMatrix = m4.multiply(projectionMatrix, viewMatrix);

    var worldMatrix = m4.yRotation(fRotationRadians);
    var worldViewProjectionMatrix = m4.multiply(viewProjectionMatrix, worldMatrix);
    var worldInverseMatrix = m4.inverse(worldMatrix);
    var worldInverseTransposeMatrix = m4.transpose(worldInverseMatrix);

    gl.uniformMatrix4fv(worldViewProjectionLocation, false, worldViewProjectionMatrix);
    gl.uniformMatrix4fv(worldInverseTransposeLocation, false, worldInverseTransposeMatrix);
    gl.uniformMatrix4fv(worldLocation, false, worldMatrix);

    gl.uniform4fv(colorFrontLocation, [0.9, 0.7, 0.9, 1]); // Light Pink
gl.uniform4fv(colorBackLocation, [0.6, 0.4, 0.8, 1]); // Soft Purple
gl.uniform4fv(colorTopLocation, [0.9, 0.7, 0.9, 1]); // Light Pink
gl.uniform4fv(colorBottomLocation, [0.6, 0.4, 0.8, 1]); // Soft Purple
gl.uniform4fv(colorLeftLocation, [0.9, 0.7, 0.9, 1]); // Light Pink
gl.uniform4fv(colorRightLocation, [0.6, 0.4, 0.8, 1]); // Soft Purple
    

    const lightPosition = [40, 60, 120];
    gl.uniform3fv(lightWorldPositionLocation, lightPosition);

    gl.uniform3fv(viewWorldPositionLocation, camera);

    gl.uniform1f(shininessLocation, shininess);

    {
      var lmat = m4.lookAt(lightPosition, target, up);
      lmat = m4.multiply(m4.xRotation(lightRotationX), lmat);
      lmat = m4.multiply(m4.yRotation(lightRotationY), lmat);
      lightDirection = [-lmat[8], -lmat[9], -lmat[10]];
    }

    gl.uniform3fv(lightDirectionLocation, lightDirection);
    gl.uniform1f(limitLocation, Math.cos(limit));

    gl.drawArrays(gl.TRIANGLES, 0, 36);
  }
}

// cube geometry
function setGeometry(gl) {
  var scale = 10; // Increased scaling factor
  var positions = new Float32Array([
    // Front face
    -scale, -scale,  scale,
     scale, -scale,  scale,
     scale,  scale,  scale,
    -scale, -scale,  scale,
     scale,  scale,  scale,
    -scale,  scale,  scale,

    // Back face
    -scale, -scale, -scale,
    -scale,  scale, -scale,
     scale,  scale, -scale,
    -scale, -scale, -scale,
     scale,  scale, -scale,
     scale, -scale, -scale,

    // Top face
    -scale,  scale, -scale,
    -scale,  scale,  scale,
     scale,  scale,  scale,
    -scale,  scale, -scale,
     scale,  scale,  scale,
     scale,  scale, -scale,

    // Bottom face
    -scale, -scale, -scale,
     scale, -scale, -scale,
     scale, -scale,  scale,
    -scale, -scale, -scale,
     scale, -scale,  scale,
    -scale, -scale,  scale,

    // Right face
     scale, -scale, -scale,
     scale,  scale, -scale,
     scale,  scale,  scale,
     scale, -scale, -scale,
     scale,  scale,  scale,
     scale, -scale,  scale,

    // Left face
    -scale, -scale, -scale,
    -scale, -scale,  scale,
    -scale,  scale,  scale,
    -scale, -scale, -scale,
    -scale,  scale,  scale,
    -scale,  scale, -scale,
  ]);
  
  gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);
}

// cube normals
function setNormals(gl) {
  var normals = new Float32Array([
    // Front face
    0, 0, 1,
    0, 0, 1,
    0, 0, 1,
    0, 0, 1,
    0, 0, 1,
    0, 0, 1,

    // Back face
    0, 0, -1,
    0, 0, -1,
    0, 0, -1,
    0, 0, -1,
    0, 0, -1,
    0, 0, -1,

    // Top face
    0, 1, 0,
    0, 1, 0,
    0, 1, 0,
    0, 1, 0,
    0, 1, 0,
    0, 1, 0,

    // Bottom face
    0, -1, 0,
    0, -1, 0,
    0, -1, 0,
    0, -1, 0,
    0, -1, 0,
    0, -1, 0,

    // Right face
    1, 0, 0,
    1, 0, 0,
    1, 0, 0,
    1, 0, 0,
    1, 0, 0,
    1, 0, 0,

    // Left face
    -1, 0, 0,
    -1, 0, 0,
    -1, 0, 0,
    -1, 0, 0,
    -1, 0, 0,
    -1, 0, 0,
  ]);

  gl.bufferData(gl.ARRAY_BUFFER, normals, gl.STATIC_DRAW);
}

main();
