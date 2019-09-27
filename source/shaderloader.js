// function determines shader type by parsing
// the filename extension (use .frag or .vert)
function loadShader(url) {
  return fetch(url)
  .then(response => {
    if(response.status != 200) {
      console.error("could not load shader " + url);
    }
    return response.text();
  })
  .then(text => {
    let type;
    if(url.slice(-5) == ".vert") {
      type = gl.VERTEX_SHADER;
    } else if(url.slice(-5) == ".frag") {
      type = gl.FRAGMENT_SHADER;
    } else {
      console.error("unkown shader type: " + url);
    }

    let shader = gl.createShader(type);
    gl.shaderSource(shader, text);
    gl.compileShader(shader);
    if(!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error("could not compile shader: " + url);
      console.debug(gl.getShaderInfoLog(shader));
      gl.deleteShader(shader);
      return;
    }
    console.log("successfully loaded shader " + url);
    return shader;
  });
}
