#version 300 es
precision highp float;

// Input from vertex shader
in vec4 v_color;

// Output
out vec4 fragColor;

void main() {
    fragColor = v_color;
}
