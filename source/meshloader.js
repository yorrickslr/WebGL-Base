function loadMtl(url) {
  return fetch(url)
  .then(response => {
    if(response.status != 200) {
      console.error("could not load Mtl " + url + "(" + response.status + ")");
    }
    return response.text();
  })
  .then(text => {
    let lines = text.split("\n");
    let mtl = [];
    let name = "";
    let Kd = glMatrix.vec3.create();

    for(let i = 0; i < lines.length; ++i) {
      let parts = lines[i].trimRight().split(" ");
      if(parts.length > 0) {
        switch(parts[0]) {
          case "newmtl": name = parts[1];          
            break;
          case "Kd":
            mtl[name] = glMatrix.vec3.fromValues(
              parts[1], parts[2], parts[3]
            );
            break;
        }
      }
    }
    console.log("successfully loaded materials " + url);
    return mtl;
  });
}

function loadObj(url) {
  return fetch(url)
  .then(response => {
    if(response.status != 200) {
      console.error("could not load OBJ " + url);
    }
    return response.text();
  })
  .then(async text => {
    let lines = text.split("\n");
    let positions = [];
    let normals = [];
    let vertices = [];
    let coordinates = [];
    let colors = [];
    let mtl;
    let color = glMatrix.vec3.fromValues(0, 0, 0);
    for(let i = 0; i < lines.length; ++i) {
      let parts = lines[i].trimRight().split(" ");
      if(parts.length > 0) {
        switch(parts[0]) {
          case "mtllib":
            let mtlPath = url.substring(0, url.lastIndexOf("/"));
            mtlPath += "/" + parts[1];
            mtl = await loadMtl(mtlPath);
            break;
          case "usemtl":
            if(mtl != "undefined") {
              color = mtl[parts[1]];
            }
            break;
          case "v":
            positions.push(
              glMatrix.vec3.fromValues(
                parseFloat(parts[1]),
                parseFloat(parts[2]),
                parseFloat(parts[3])
              )
            );
            break;
          // currently not included
          // in returned object
          case "vn":
            normals.push(
              glMatrix.vec3.fromValues(
                parseFloat(parts[1]),
                parseFloat(parts[2]),
                parseFloat(parts[3])
              )
            );
            break;
          // currently not included
          // in returned object
          case "vt":
            coordinates.push(
              glMatrix.vec2.fromValues(
                parseFloat(parts[1]),
                parseFloat(parts[2])
              )
            );
            break;
          case "f": {
            let f1 = parts[1].split("/");
            let f2 = parts[2].split("/");
            let f3 = parts[3].split("/");
            Array.prototype.push.apply(
              vertices, positions[parseInt(f1[0]) - 1]
            );
            Array.prototype.push.apply(
              vertices, color
            );
            Array.prototype.push.apply(
              vertices, positions[parseInt(f2[0]) - 1]
            );
            Array.prototype.push.apply(
              vertices, color
            );
            Array.prototype.push.apply(
              vertices, positions[parseInt(f3[0]) - 1]
            );
            Array.prototype.push.apply(
              vertices, color
            );
            break;
          }
        }
      }
    }
    console.debug(positions);
    let vertexCount = vertices.length / 6;
    console.log("successfully loaded mesh " + url);
    return {
      primitiveType: 'TRIANGLES',
      vertices: new Float32Array(vertices),
      vertexCount: vertexCount
    };
  });
}
