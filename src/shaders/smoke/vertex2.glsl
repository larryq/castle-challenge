// Vertex shader for smoke effect
varying vec2 vUv;
uniform float uTime;
uniform sampler2D uPerlinTexture;

vec2 rotate2D(vec2 value, float angle)
{
    float s = sin(angle);
    float c = cos(angle);
    mat2 m = mat2(c, s, -s, c);
    return m * value;
}

void main() {
    vec3 newPosition = position;
    // Twist
    // Twisting the smoke object, so it doesn't look like 2D scene
    float twistPerlin = texture(uPerlinTexture, vec2(0.5, uv.y * 0.2 - uTime * 0.005)).r;
    float angle = twistPerlin * 10.0;
    newPosition.xz = rotate2D(newPosition.xz, angle);

    // Wind, adding wind effect, you can change the wind direction by tweaking
    // the vec2(), first parameter and speed in second parameter
    vec2 windOffset = vec2(
      texture(uPerlinTexture, vec2(0.25, uTime * 0.05)).r - 0.5,
      texture(uPerlinTexture, vec2(0.75, uTime * 0.05)).r - 0.5
    );
    windOffset *= pow(uv.y, 2.0) * 10.0;
    newPosition.xz += windOffset;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);

    // Varying
    vUv = uv;
}