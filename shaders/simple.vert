precision mediump float;

attribute vec3 inPosition;
attribute vec3 inColor;

uniform mat4 ProjectionMat;
uniform mat4 ViewMat;
uniform mat4 ModelMat;

varying vec3 passColor;

void main(void) {
  passColor = inColor;
  gl_Position = ProjectionMat * ViewMat * ModelMat * vec4(inPosition, 1.0);
}
