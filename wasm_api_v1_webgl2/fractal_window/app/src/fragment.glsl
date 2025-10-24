#version 300 es
precision highp float;

// Inputs
in vec2 v_uv;

// Uniforms
uniform bool is_julia;
uniform float c_re;
uniform float c_im;
uniform float max_iterations;
uniform float power;
uniform vec3 color1;
uniform vec3 color2;
uniform vec3 color3;
uniform vec3 set_color;
uniform float color_steps;
uniform float color_shift;
uniform bool is_color_smooth;

// Outputs
out vec4 fragColor;

// n-th Power of a Complex Number using De Moivre's Theorem
vec2 complex_pow(vec2 z, float n) {
    if (z.x == 0.0 && z.y == 0.0) return vec2(0.0);
    if (n == 2.0) return vec2(z.x * z.x - z.y * z.y, 2.0 * z.x * z.y);
    float theta = atan(z.y, z.x);
    return pow(length(z), n) * vec2(cos(n * theta), sin(n * theta));
}

float pos_mod(float n, float m) {
    return mod(mod(n, m) + m, m);
}

void main() {
    // Fractal iteration
    vec2 c = is_julia ? vec2(c_re, c_im) : v_uv; // For Mandelbrot, c is the current point
    vec2 z = is_julia ? v_uv : vec2(0.0); // For Mandelbrot, start z at 0; for Julia, z is the current point
    const float ESCAPE_RADIUS = 4.0;
    const float ESCAPE_RADIUS_SQ = ESCAPE_RADIUS * ESCAPE_RADIUS;
    float iteration = 0.0;
    while (iteration < max_iterations && dot(z, z) < ESCAPE_RADIUS_SQ) {
        z = complex_pow(z, power) + c;
        iteration += 1.0;
    }

    // Smoothing
    if (iteration < max_iterations && is_color_smooth) {
        float log_zn = log(dot(z, z)) / 2.0; // Equivalent to log(|z|^2)/2, or log of magnitude squared of z, divided by 2
        float nu = log(log_zn / log(power)) / log(power); // This calculates the smooth factor
        iteration += 1.0 - nu; // Adjust 'iteration' by subtracting the smooth factor
    }

    // Color mapping
    float phase = pos_mod(iteration + color_shift, color_steps * 3.0) / color_steps;
    vec3 color;
    if (iteration >= max_iterations) {
        color = set_color;
    } else if (phase >= 0.0 && phase < 1.0) {
        color = mix(color1, color2, phase);
    } else if (phase >= 1.0 && phase < 2.0) {
        color = mix(color2, color3, phase - 1.0);
    } else if (phase >= 2.0 && phase <= 3.0) {
        color = mix(color3, color1, phase - 2.0);
    }
    fragColor = vec4(color, 1.0);
}
