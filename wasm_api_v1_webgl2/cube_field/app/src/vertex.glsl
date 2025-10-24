#version 300 es

// Uniforms
uniform mat4 projection;
uniform mat4 view;
uniform int n_side_cubes;
uniform float viscosity;
uniform float cube_spacing;

// Storage buffers (uniform blocks in WebGL2)
uniform sampler2D cube_color;
uniform sampler2D odd_cube_size;
uniform sampler2D even_cube_size;
uniform sampler2D odd_cube_rotation;
uniform sampler2D even_cube_rotation;

// Inputs
layout(location = 0) in vec4 position;

// Outputs to fragment shader
out vec4 v_color;

vec4 calculate_instance_reference_position(int iid) {
    int n_cubes_per_face = n_side_cubes * n_side_cubes;
    int z_index = (iid / n_cubes_per_face) % n_side_cubes;
    int y_index = (iid / n_side_cubes) % n_side_cubes;
    int x_index = iid % n_side_cubes;

    float center_offset = float(n_side_cubes - 1) / 2.0; // -1 for fencepost

    return vec4(
        float(x_index) - center_offset,
        float(y_index) - center_offset,
        float(z_index) - center_offset,
        float((x_index + y_index + z_index) % 2)
    );
}

void main() {
    // Calculate instance reference position
    vec4 irp = calculate_instance_reference_position(gl_InstanceID);

    // Skip rendering if reference position is (0, 0, 0)
    if (irp.xyz == vec3(0.0)) {
        gl_Position = vec4(-2.0); // Push outside clip space
        return; // Exit the shader
    }

    ivec2 history_idx = ivec2(int(length(irp.xyz) * viscosity), 0);

    // Determine cube properties based on even/odd position
    vec4 cube_rotation;
    float cube_size;
    if (irp.w == 0.0) {
        cube_rotation = texelFetch(even_cube_rotation, history_idx, 0);
        cube_size = texelFetch(even_cube_size, history_idx, 0).r;
    } else {
        cube_rotation = texelFetch(odd_cube_rotation, history_idx, 0);
        cube_size = texelFetch(odd_cube_size, history_idx, 0).r;
    }

    // Rotation matrices
    mat4 rx = mat4(
        1.0, 0.0, 0.0, 0.0,
        0.0, cos(cube_rotation.x), -sin(cube_rotation.x), 0.0,
        0.0, sin(cube_rotation.x), cos(cube_rotation.x), 0.0,
        0.0, 0.0, 0.0, 1.0
    );
    mat4 ry = mat4(
        cos(cube_rotation.y), 0.0, sin(cube_rotation.y), 0.0,
        0.0, 1.0, 0.0, 0.0,
        -sin(cube_rotation.y), 0.0, cos(cube_rotation.y), 0.0,
        0.0, 0.0, 0.0, 1.0
    );
    mat4 rz = mat4(
        cos(cube_rotation.z), -sin(cube_rotation.z), 0.0, 0.0,
        sin(cube_rotation.z), cos(cube_rotation.z), 0.0, 0.0,
        0.0, 0.0, 1.0, 0.0,
        0.0, 0.0, 0.0, 1.0
    );
    mat4 rotation = rx * ry * rz;

    // Scale matrix
    mat4 scale = mat4(
        cube_size, 0.0, 0.0, 0.0,
        0.0, cube_size, 0.0, 0.0,
        0.0, 0.0, cube_size, 0.0,
        0.0, 0.0, 0.0, 1.0
    );

    // Instance position transform
    vec3 instance_pos = irp.xyz * cube_spacing;
    mat4 instance_transform = mat4(
        1.0, 0.0, 0.0, 0.0,
        0.0, 1.0, 0.0, 0.0,
        0.0, 0.0, 1.0, 0.0,
        instance_pos.x, instance_pos.y, instance_pos.z, 1.0
    );

    v_color = texelFetch(cube_color, history_idx, 0);
    gl_Position = projection * view * instance_transform * rotation * scale * position;
}
