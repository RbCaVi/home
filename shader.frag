varying highp vec2 vTextureCoord;
varying highp vec3 vLighting;

uniform sampler2D uSampler;

void main(void) {
    highp vec4 texelColor = texture2D(uSampler, vTextureCoord);

    gl_FragColor = vec4((texelColor.rgb * texelColor.a + vec3(1.0, 1.0, 1.0) * (1.0 - texelColor.a)) * vLighting, texelColor.a);
}