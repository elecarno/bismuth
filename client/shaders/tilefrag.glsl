precision mediump float;

varying vec2 pixelCoord;
varying vec2 texCoord;

uniform sampler2D tiles;
uniform sampler2D sprites;

uniform vec2 inverseTileTextureSize;
uniform vec2 inverseSpriteTextureSize;
uniform float tileSize;
uniform bool isTop;

void main(void) {
    const float sheetWidth = 10.0;
    vec2 down_tex_coord = texCoord + vec2(0, inverseTileTextureSize.y);
    
    vec4 tile = texture2D(tiles, texCoord);
    vec4 down_tile = texture2D(tiles, down_tex_coord);

    vec2 spriteCoord = mod(pixelCoord, tileSize);
    float from_bottom = tileSize - spriteCoord.y;

    vec4 texColour;

    if (from_bottom < down_tile.z * 255.0 && isTop) {

        vec2 downSpritePos = floor(vec2(mod(down_tile.x * 255.0, sheetWidth), down_tile.x * 255.0 / sheetWidth));
        vec2 downSpriteOffset = downSpritePos * tileSize;
        vec2 downSpriteCoord = mod(pixelCoord, tileSize) - vec2(0, tileSize - down_tile.z * 255.0);
        texColour = texture2D(sprites, (downSpriteOffset + downSpriteCoord) * inverseSpriteTextureSize);
    } else if (from_bottom < tile.z * 255.0 && isTop) {
        texColour = vec4(0, 0, 0, 0);
        
    } else {
        vec2 spritePos = floor(vec2(mod(tile.x * 255.0, sheetWidth), tile.x * 255.0 / sheetWidth));
        vec2 spriteOffset = spritePos * tileSize;
        texColour = texture2D(sprites, (spriteOffset + spriteCoord + vec2(0, tile.z * 255.0 * float(isTop))) * inverseSpriteTextureSize);
    }

    if (tile.w > 0.0 && texColour.w < 1.0) {
        vec2 underSpritePos = floor(vec2(mod(tile.w * 255.0, sheetWidth), tile.w * 255.0 / sheetWidth));
        vec2 underSpriteOffset = underSpritePos * tileSize;
        vec2 underSpriteCoord = mod(pixelCoord, tileSize);
        gl_FragColor = texture2D(sprites, (underSpriteOffset + underSpriteCoord) * inverseSpriteTextureSize);
    } else {
        gl_FragColor = texColour;
    }
    gl_FragColor.rgb *= gl_FragColor.a;
}
