precision mediump float;

varying vec3 passColor;

void main(void) {
  gl_FragColor = vec4(passColor, 1.0);
}
