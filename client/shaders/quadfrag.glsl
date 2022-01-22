precision mediump float;

varying vec2 texCoord;

uniform vec2 screenPos;
uniform vec2 screenSize;
uniform vec2 sheetPos;
uniform vec2 sheetSize;

uniform sampler2D sheet;

void main(void) {
    gl_FragColor = texture2D(sheet, texCoord);
} 
