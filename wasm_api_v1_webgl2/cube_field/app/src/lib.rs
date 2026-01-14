#[global_allocator]
static ALLOC: wee_alloc::WeeAlloc = wee_alloc::WeeAlloc::INIT;

use std::f32::consts::PI;
use wasm_bindgen::prelude::wasm_bindgen;
use web_sys::{
    console as ws_console,
    WebGl2RenderingContext as GL,
    WebGlFramebuffer,
    WebGlProgram,
    WebGlShader,
    WebGlTexture,
    WebGlUniformLocation,
    WebGlVertexArrayObject,
    XrViewport,
};


struct Zone {
    gl: GL,
    vao: WebGlVertexArrayObject,
    shader_program: WebGlProgram,
    uniform_locations: UniformLocations,
    n_history: i32,
    history: CubeHistory,
    history_textures: CubeHistoryTextures,
    instance_count: i32,
    frame_number: u32,
}

thread_local! {
    static ZONE: std::cell::RefCell<Option<Zone>> = std::cell::RefCell::new(None);
}

#[wasm_bindgen]
pub fn init_zone(
    gl: GL,
    frame_number: u32,
    zone_params: ZoneParams,
) {
    ZONE.with(|z| {
        // std::panic::set_hook(Box::new(console_error_panic_hook::hook));
        ws_console::log_1(&"WASM: start_zone.".into());

        gl.enable(GL::DEPTH_TEST);
        gl.depth_func(GL::LESS);
        gl.depth_mask(true);
        
        // vao and upload vertices and indices once because they don't change
        let vao = gl.create_vertex_array().expect("Failed to create VAO");
        gl.bind_vertex_array(Some(&vao));

        let vertex_buffer = gl.create_buffer().expect("Failed to create vertex buffer");
        gl.bind_buffer(GL::ARRAY_BUFFER, Some(&vertex_buffer));
        let vertices_array = js_sys::Float32Array::from(&VERTICES[..]);
        gl.buffer_data_with_array_buffer_view(GL::ARRAY_BUFFER, &vertices_array, GL::STATIC_DRAW);
        
        let index_buffer = gl.create_buffer().expect("Failed to create index buffer");
        gl.bind_buffer(GL::ELEMENT_ARRAY_BUFFER, Some(&index_buffer));
        let indices_array = js_sys::Uint32Array::from(&INDICES[..]);
        gl.buffer_data_with_array_buffer_view(GL::ELEMENT_ARRAY_BUFFER, &indices_array, GL::STATIC_DRAW);

        // shader program and uniform locations
        let vertex_shader = compile_shader(&gl, GL::VERTEX_SHADER, VERTEX_SHADER_SOURCE)
            .expect("Failed to compile vertex shader");
        let fragment_shader = compile_shader(&gl, GL::FRAGMENT_SHADER, FRAGMENT_SHADER_SOURCE)
            .expect("Failed to compile fragment shader");
        let shader_program = create_shader_program(&gl, vertex_shader, fragment_shader);

        gl.use_program(Some(&shader_program)); // start use shader program
        let pos_attrib = gl.get_attrib_location(&shader_program, "position");
        gl.enable_vertex_attrib_array(pos_attrib as u32);
        gl.vertex_attrib_pointer_with_i32(pos_attrib as u32, FLOAT_SIZE, GL::FLOAT, false, GPU_STRIDE, 0);

        let uniform_locations = UniformLocations {
            projection: gl.get_uniform_location(&shader_program, "projection")
                .expect("Failed to get projection uniform"),
            view: gl.get_uniform_location(&shader_program, "view")
                .expect("Failed to get view uniform"),
            n_side_cubes: gl.get_uniform_location(&shader_program, "n_side_cubes")
                .expect("Failed to get n_side_cubes uniform"),
            viscosity: gl.get_uniform_location(&shader_program, "viscosity")
                .expect("Failed to get viscosity uniform"),
            cube_spacing: gl.get_uniform_location(&shader_program, "cube_spacing")
                .expect("Failed to get cube_spacing uniform"),
            cube_color: gl.get_uniform_location(&shader_program, "cube_color")
                .expect("Failed to get cube_color uniform"),
            odd_cube_size: gl.get_uniform_location(&shader_program, "odd_cube_size")
                .expect("Failed to get odd_cube_size uniform"),
            even_cube_size: gl.get_uniform_location(&shader_program, "even_cube_size")
                .expect("Failed to get even_cube_size uniform"),
            odd_cube_rotation: gl.get_uniform_location(&shader_program, "odd_cube_rotation")
                .expect("Failed to get odd_cube_rotation uniform"),
            even_cube_rotation: gl.get_uniform_location(&shader_program, "even_cube_rotation")
                .expect("Failed to get even_cube_rotation uniform"),
        };
        gl.use_program(None); // end use shader program

        // n_history and history and history textures
        let n_side_cubes = zone_params.n_side_cubes();
        
        let n_history_raw = (n_side_cubes as f32 / 2.0 * ROOT_THREE * zone_params.viscosity()).ceil() as i32;
        let n_history = ((n_history_raw + 4 - 1) / 4) * 4; // round up to multiple of 4 (= GPU_STRIDE / FLOAT_SIZE)

        let history = CubeHistory::new(&zone_params);

        let history_textures = CubeHistoryTextures {
            cube_color: gl.create_texture().expect("Failed to create cube_color texture"),
            odd_cube_size: gl.create_texture().expect("Failed to create odd_cube_size texture"),
            even_cube_size: gl.create_texture().expect("Failed to create even_cube_size texture"),
            odd_cube_rotation: gl.create_texture().expect("Failed to create odd_cube_rotation texture"),
            even_cube_rotation: gl.create_texture().expect("Failed to create even_cube_rotation texture"),
        };

        // instance count
        let instance_count = n_side_cubes * n_side_cubes * n_side_cubes;

        ws_console::log_1(&format!("n_side_cubes: {n_side_cubes}").into());
        ws_console::log_1(&format!("n_history: {n_history}").into());
        ws_console::log_1(&format!("instance_count: {instance_count}").into());

        let zone = Zone {
            gl,
            vao,
            shader_program,
            uniform_locations,
            n_history,
            history,
            history_textures,
            instance_count,
            frame_number,
        };
        *z.borrow_mut() = Some(zone);
    });
}

fn compile_shader(gl: &GL, shader_type: u32, source: &str) -> Result<web_sys::WebGlShader, String> {
    let shader = gl.create_shader(shader_type).ok_or_else(|| "Failed to create shader".to_string())?;
    gl.shader_source(&shader, source);
    gl.compile_shader(&shader);

    if gl.get_shader_parameter(&shader, GL::COMPILE_STATUS).as_bool().unwrap_or(false) {
        Ok(shader)
    } else {
        Err(gl.get_shader_info_log(&shader).unwrap_or_else(|| "Unknown shader compilation error".into()))
    }
}

fn create_shader_program(gl: &GL, vertex_shader: WebGlShader, fragment_shader: WebGlShader) -> WebGlProgram {
    // Create and link the program
    let program = gl.create_program().expect("Failed to create program");
    gl.attach_shader(&program, &vertex_shader);
    gl.attach_shader(&program, &fragment_shader);
    gl.link_program(&program);

    // Check for linking errors
    if !gl.get_program_parameter(&program, GL::LINK_STATUS).as_bool().unwrap_or(false) {
        let log = gl.get_program_info_log(&program).unwrap_or_else(|| "Unknown program linking error".into());
        std::panic!("Program Linking Error: {}", log);
    }

    // Clean up shaders (optional; shaders can be reused)
    gl.delete_shader(Some(&vertex_shader));
    gl.delete_shader(Some(&fragment_shader));

    program
}

#[wasm_bindgen]
pub fn render_zone(
    framebuffer: Option<WebGlFramebuffer>,
    should_setup_framebuffer: bool,
    viewport: XrViewport,
    view_matrix: js_sys::Float32Array,
    projection_matrix: js_sys::Float32Array,
    frame_number: u32,
    _is_left_eye: bool,
    zone_params: ZoneParams,
) {
    ZONE.with(|z| {
        if let Some(zone) = z.borrow_mut().as_mut() {
            // Set up
            zone.gl.bind_framebuffer(GL::FRAMEBUFFER, framebuffer.as_ref());
            if should_setup_framebuffer {
                zone.gl.clear_color(0.0, 0.0, 0.0, 1.0);
                zone.gl.clear(GL::COLOR_BUFFER_BIT | GL::DEPTH_BUFFER_BIT);
            }
            zone.gl.viewport(viewport.x(), viewport.y(), viewport.width(), viewport.height());
            zone.gl.use_program(Some(&zone.shader_program));
            zone.gl.bind_vertex_array(Some(&zone.vao));
            
            // Update uniforms
            zone.gl.uniform_matrix4fv_with_f32_sequence(
                Some(&zone.uniform_locations.projection),
                false,
                &projection_matrix
            );
            zone.gl.uniform_matrix4fv_with_f32_sequence(
                Some(&zone.uniform_locations.view),
                false,
                &view_matrix
            );

            zone.gl.uniform1i(Some(&zone.uniform_locations.n_side_cubes), zone_params.n_side_cubes());
            zone.gl.uniform1f(Some(&zone.uniform_locations.viscosity), zone_params.viscosity());
            zone.gl.uniform1f(Some(&zone.uniform_locations.cube_spacing), zone_params.cube_spacing());
            if frame_number != zone.frame_number {
                zone.history.rotate(&zone_params);
                update_history(zone);
                zone.frame_number = frame_number;
            }

            // Draw
            zone.gl.draw_elements_instanced_with_i32(
                GL::TRIANGLES,
                INDICES.len() as i32,
                GL::UNSIGNED_INT,
                0,
                zone.instance_count,
            );
            // let error = self.gl.get_error();
            // assert_eq!(error, GL::NO_ERROR, "OpenGL error: {:?}", error);

            // Wrap up
            zone.gl.flush();
            zone.gl.bind_vertex_array(None);
            zone.gl.use_program(None);
        } else {
            web_sys::console::log_1(&"State not initialized. Call start() first.".into());
        }
    });
}

fn update_history(zone: &Zone) {
    update_texture(
        zone,
        &zone.history_textures.cube_color,
        GL::TEXTURE0,
        &zone.uniform_locations.cube_color,
        js_sys::Float32Array::from(&(zone.history.cube_color.concat()[..])),
        GL::RGBA32F,
        GL::RGBA,
    );
    update_texture(
        zone,
        &zone.history_textures.odd_cube_size,
        GL::TEXTURE1,
        &zone.uniform_locations.odd_cube_size,
        js_sys::Float32Array::from(&(zone.history.odd_cube_size[..])),
        GL::R32F,
        GL::RED,
    );
    update_texture(
        zone,
        &zone.history_textures.even_cube_size,
        GL::TEXTURE2,
        &zone.uniform_locations.even_cube_size,
        js_sys::Float32Array::from(&(zone.history.even_cube_size[..])),
        GL::R32F,
        GL::RED,
    );
    update_texture(
        zone,
        &zone.history_textures.odd_cube_rotation,
        GL::TEXTURE3,
        &zone.uniform_locations.odd_cube_rotation,
        js_sys::Float32Array::from(&(zone.history.odd_cube_rotation.concat()[..])),
        GL::RGBA32F,
        GL::RGBA,
    );
    update_texture(
        zone,
        &zone.history_textures.even_cube_rotation,
        GL::TEXTURE4,
        &zone.uniform_locations.even_cube_rotation,
        js_sys::Float32Array::from(&(zone.history.even_cube_rotation.concat()[..])),
        GL::RGBA32F,
        GL::RGBA,
    );
}

fn update_texture(
    zone: &Zone,
    texture: &WebGlTexture,
    texture_unit: u32,
    uniform_location: &WebGlUniformLocation,
    data: js_sys::Float32Array,
    internal_format: u32,
    format: u32,
) {
    let js_data = js_sys::Float32Array::from(data);

    zone.gl.active_texture(texture_unit);
    zone.gl.bind_texture(GL::TEXTURE_2D, Some(&texture));
    let _result = zone.gl.tex_image_2d_with_i32_and_i32_and_i32_and_format_and_type_and_opt_array_buffer_view(
        GL::TEXTURE_2D,
        0,                      // Level of detail
        internal_format as i32, // Internal format
        zone.n_history,         // Width of the texture
        1,                      // Height of the texture
        0,                      // Border (must be 0)
        format,                 // Format of the pixel data
        GL::FLOAT,              // Data type of the pixel data
        Some(&js_data),         // Data source
    );

    zone.gl.tex_parameteri(GL::TEXTURE_2D, GL::TEXTURE_MIN_FILTER, GL::NEAREST as i32);
    zone.gl.tex_parameteri(GL::TEXTURE_2D, GL::TEXTURE_MAG_FILTER, GL::NEAREST as i32);
    zone.gl.tex_parameteri(GL::TEXTURE_2D, GL::TEXTURE_WRAP_S, GL::CLAMP_TO_EDGE as i32);
    zone.gl.tex_parameteri(GL::TEXTURE_2D, GL::TEXTURE_WRAP_T, GL::CLAMP_TO_EDGE as i32);
    zone.gl.uniform1i(Some(uniform_location), (texture_unit - GL::TEXTURE0) as i32);
    // zone.gl.bind_texture(GL::TEXTURE_2D, None); // ABSOLUTELY NOT THIS. THE TEXTURES DO NOT GET TRANSMITTED
}

#[wasm_bindgen]
extern "C" {
    #[wasm_bindgen(typescript_type = "any")]
    pub type ZoneParams;
    
    #[wasm_bindgen(method, getter, js_name = n_side_cubes)] pub fn n_side_cubes(this: &ZoneParams) -> i32; // not changeable
    #[wasm_bindgen(method, getter, js_name = viscosity)] pub fn viscosity(this: &ZoneParams) -> f32;       // not changeable
    #[wasm_bindgen(method, getter, js_name = cube_spacing)] pub fn cube_spacing(this: &ZoneParams) -> f32; // changeable, but historyless
    #[wasm_bindgen(method, getter, js_name = cube_color_r)] pub fn cube_color_r(this: &ZoneParams) -> f32;
    #[wasm_bindgen(method, getter, js_name = cube_color_g)] pub fn cube_color_g(this: &ZoneParams) -> f32;
    #[wasm_bindgen(method, getter, js_name = cube_color_b)] pub fn cube_color_b(this: &ZoneParams) -> f32;
    #[wasm_bindgen(method, getter, js_name = odd_cube_size)] pub fn odd_cube_size(this: &ZoneParams) -> f32;
    #[wasm_bindgen(method, getter, js_name = even_cube_size)] pub fn even_cube_size(this: &ZoneParams) -> f32;
    #[wasm_bindgen(method, getter, js_name = odd_cube_rotation_x)] pub fn odd_cube_rotation_x(this: &ZoneParams) -> f32;
    #[wasm_bindgen(method, getter, js_name = odd_cube_rotation_y)] pub fn odd_cube_rotation_y(this: &ZoneParams) -> f32;
    #[wasm_bindgen(method, getter, js_name = odd_cube_rotation_z)] pub fn odd_cube_rotation_z(this: &ZoneParams) -> f32;
    #[wasm_bindgen(method, getter, js_name = even_cube_rotation_x)] pub fn even_cube_rotation_x(this: &ZoneParams) -> f32;
    #[wasm_bindgen(method, getter, js_name = even_cube_rotation_y)] pub fn even_cube_rotation_y(this: &ZoneParams) -> f32;
    #[wasm_bindgen(method, getter, js_name = even_cube_rotation_z)] pub fn even_cube_rotation_z(this: &ZoneParams) -> f32;
}

struct UniformLocations {
    projection: WebGlUniformLocation,
    view: WebGlUniformLocation,
    n_side_cubes: WebGlUniformLocation,
    viscosity: WebGlUniformLocation,
    cube_spacing: WebGlUniformLocation,
    cube_color: WebGlUniformLocation,
    odd_cube_size: WebGlUniformLocation,
    even_cube_size: WebGlUniformLocation,
    odd_cube_rotation: WebGlUniformLocation,
    even_cube_rotation: WebGlUniformLocation,
}

struct CubeHistory {
    cube_color: Vec<[f32; 4]>,
    odd_cube_size: Vec<f32>,
    even_cube_size: Vec<f32>,
    odd_cube_rotation: Vec<[f32; 4]>,
    even_cube_rotation: Vec<[f32; 4]>,
}

impl CubeHistory {
    fn new(zone_params: &ZoneParams) -> Self {
        let n_history_raw = (zone_params.n_side_cubes() as f32 / 2.0 * ROOT_THREE * zone_params.viscosity()).ceil() as usize;
        let n_history = ((n_history_raw + 4 - 1) / 4) * 4; // round up to multiple of 4 (= 16 bytes (GPU stride) / 4 bytes (f32))

        Self {
            cube_color: vec![[0.0, 0.0, 0.0, 1.0]; n_history], // best to match sky color
            odd_cube_size: vec![0.0; n_history],
            even_cube_size: vec![0.0; n_history],
            odd_cube_rotation: vec![[0.0, 0.0, 0.0, 0.0]; n_history],
            even_cube_rotation: vec![[0.0, 0.0, 0.0, 0.0]; n_history],
        }
    }

    fn rotate(&mut self, zone_params: &ZoneParams) {
        self.cube_color.rotate_right(1);
        self.odd_cube_size.rotate_right(1);
        self.even_cube_size.rotate_right(1);
        self.odd_cube_rotation.rotate_right(1);
        self.even_cube_rotation.rotate_right(1);

        self.cube_color[0] = [
            zone_params.cube_color_r(),
            zone_params.cube_color_g(),
            zone_params.cube_color_b(),
            1.0,
        ];
        self.odd_cube_size[0] = zone_params.odd_cube_size();
        self.even_cube_size[0] = zone_params.even_cube_size();
        self.odd_cube_rotation[0] = [
            zone_params.odd_cube_rotation_x() * PI / 180.0,
            zone_params.odd_cube_rotation_y() * PI / 180.0,
            zone_params.odd_cube_rotation_z() * PI / 180.0,
            0.0, // just padding
        ];
        self.even_cube_rotation[0] = [
            zone_params.even_cube_rotation_x() * PI / 180.0,
            zone_params.even_cube_rotation_y() * PI / 180.0,
            zone_params.even_cube_rotation_z() * PI / 180.0,
            0.0, // just padding
        ];
    }
}

struct CubeHistoryTextures {
    cube_color: WebGlTexture,
    odd_cube_size: WebGlTexture,
    even_cube_size: WebGlTexture,
    odd_cube_rotation: WebGlTexture,
    even_cube_rotation: WebGlTexture,
}

const VERTICES: [f32; 32] = [
    // Front face
    -0.5, -0.5, -0.5, 1.0,
     0.5, -0.5, -0.5, 1.0,
    -0.5,  0.5, -0.5, 1.0,
     0.5,  0.5, -0.5, 1.0,
    // Back face
    -0.5, -0.5,  0.5, 1.0,
     0.5, -0.5,  0.5, 1.0,
    -0.5,  0.5,  0.5, 1.0,
     0.5,  0.5,  0.5, 1.0,
];

const INDICES: [u32; 36] = [
    // Front face
    0, 2, 1, // Triangle 1
    3, 1, 2, // Triangle 2
    // Back face
    4, 5, 6, // Triangle 3
    7, 6, 5, // Triangle 4
    // Left face
    4, 6, 0, // Triangle 5
    2, 0, 6, // Triangle 6
    // Right face
    1, 3, 5, // Triangle 7
    7, 5, 3, // Triangle 8
    // Top face
    2, 6, 3, // Triangle 9
    7, 3, 6, // Triangle 10
    // Bottom face
    4, 0, 5, // Triangle 11
    1, 5, 0, // Triangle 12
];

const ROOT_THREE: f32 = 1.7320508076; // f32::sqrt(3.0)
const GPU_STRIDE: i32 = 16;
const FLOAT_SIZE: i32 = 4;

const VERTEX_SHADER_SOURCE: &str = include_str!("vertex.glsl");
const FRAGMENT_SHADER_SOURCE: &str = include_str!("fragment.glsl");
