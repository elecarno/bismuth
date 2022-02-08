precision mediump float;

attribute vec2 position;
attribute vec2 texture;

uniform vec2 screenPos;
uniform vec2 screenSize;

void main(void) {
    gl_Position = vec4(position * screenSize + screenPos, 0.0, 1.0);
}
