precision mediump float;

attribute vec2 position;
attribute vec2 texture;

varying vec2 texCoord;

uniform vec2 screenPos;
uniform vec2 screenSize;
uniform vec2 sheetPos;
uniform vec2 sheetSize;

void main(void) {
    texCoord = texture * sheetSize + sheetPos;
    gl_Position = vec4(position * screenSize + screenPos, 0.0, 1.0);
}
