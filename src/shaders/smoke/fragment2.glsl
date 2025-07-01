uniform float uTime;
varying vec2 vUv;
uniform sampler2D uPerlinTexture;

void main() {
    vec2 smokeUv = vUv;
    smokeUv.x *= 0.5;
    smokeUv.y *= 0.3;
    smokeUv.y -= uTime * 0.05;

    // Smoothing the edges around smoke
    float smoke = texture(uPerlinTexture, smokeUv).r;
    smoke = smoothstep(0.4, 1.0, smoke);
    // left and right
    smoke *= smoothstep(0.0, 0.1, vUv.x);
    smoke *= smoothstep(1.0, 0.9, vUv.x);
    // up and bottom
    smoke *= smoothstep(0.0, 0.1, vUv.y);
    smoke *= smoothstep(1.0, 0.4, vUv.y);

    // Color the saders, parameter is RGB and Material
    gl_FragColor = vec4(0.9, 0.0, 0.1, smoke);
    //gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
}