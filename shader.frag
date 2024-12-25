varying highp vec2 vTextureCoord;
varying highp vec3 vLighting;

uniform sampler2D uSampler;
uniform bool uHighlighted;

void main(void) {
    highp vec4 texelColor = texture2D(uSampler, vTextureCoord);

    highp vec4 color = vec4((texelColor.rgb * texelColor.a + vec3(1.0, 1.0, 1.0) * (1.0 - texelColor.a)) * vLighting, texelColor.a);
    
    if (uHighlighted) {
        color = (color + vec4(0.0, 0.0, 1.0, 1.0) * 0.25) * 0.8;
    }
    
    gl_FragColor = color;
}