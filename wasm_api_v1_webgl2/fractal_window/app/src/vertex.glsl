#version 300 es

// Inputs
layout(location = 0) in vec2 position;
layout(location = 1) in vec2 uv;

// Uniforms
uniform mat4 projection;
uniform mat4 view;
uniform vec3 screen_position;
uniform vec3 screen_scale;

// Outputs to fragment shader
out vec2 v_uv;

void main() {
    vec3 local = vec3(position, 0.0) * screen_scale;
    vec3 world = local + screen_position;
    gl_Position = projection * view * vec4(world, 1.0);
    v_uv = uv;
}
