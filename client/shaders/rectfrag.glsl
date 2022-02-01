precision mediump float;

varying vec2 texCoord;

uniform vec4 colour;

void main(void) {
    gl_FragColor = colour;
    gl_FragColor.rgb *= gl_FragColor.a;
} 
