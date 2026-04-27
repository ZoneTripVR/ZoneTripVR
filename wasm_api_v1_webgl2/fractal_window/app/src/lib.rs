#[global_allocator]
static ALLOC: wee_alloc::WeeAlloc = wee_alloc::WeeAlloc::INIT;

use wasm_bindgen::prelude::wasm_bindgen;
use web_sys::{
    console as ws_console,
    WebGl2RenderingContext as GL,
    WebGlBuffer,
    WebGlFramebuffer,
    WebGlProgram,
    WebGlShader,
    WebGlUniformLocation,
    WebGlVertexArrayObject,
    XrViewport,
};


struct Zone {
    gl: GL,
    vao: WebGlVertexArrayObject,
    shader_program: WebGlProgram,
    attribute_buffer: WebGlBuffer,
    uniform_locations: UniformLocations,
}

thread_local! {
    static ZONE: std::cell::RefCell<Option<Zone>> = std::cell::RefCell::new(None);
}

#[wasm_bindgen]
pub fn init_zone(
    gl: GL,
    _frame_number: u32,
    _zone_params: ZoneParams,
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

        let attribute_buffer = gl.create_buffer().expect("Failed to create attribute buffer");
        gl.bind_buffer(GL::ARRAY_BUFFER, Some(&attribute_buffer));
        let attributes = create_attributes(0.0, 0.0, 0.0, 4.0, 4.0);
        let attributes_array = js_sys::Float32Array::from(&attributes[..]);
        gl.buffer_data_with_array_buffer_view(GL::ARRAY_BUFFER, &attributes_array, GL::DYNAMIC_DRAW);

        let index_buffer = gl.create_buffer().expect("Failed to create index buffer");
        gl.bind_buffer(GL::ELEMENT_ARRAY_BUFFER, Some(&index_buffer));
        let indices_array = js_sys::Uint32Array::from(&INDICES[..]);
        gl.buffer_data_with_array_buffer_view(GL::ELEMENT_ARRAY_BUFFER, &indices_array, GL::STATIC_DRAW);

        // shader program and attributes and uniforms
        let vertex_shader = compile_shader(&gl, GL::VERTEX_SHADER, VERTEX_SHADER_SOURCE)
            .expect("Failed to compile vertex shader");
        let fragment_shader = compile_shader(&gl, GL::FRAGMENT_SHADER, FRAGMENT_SHADER_SOURCE)
            .expect("Failed to compile fragment shader");
        let shader_program = create_shader_program(&gl, vertex_shader, fragment_shader);

        gl.use_program(Some(&shader_program)); // start use shader program
        gl.bind_buffer(GL::ARRAY_BUFFER, Some(&attribute_buffer));
        gl.enable_vertex_attrib_array(0); // position. see location=0 in vertex shader
        gl.vertex_attrib_pointer_with_i32(0, 2, GL::FLOAT, false, 4 * FLOAT_SIZE, 0); // 4 = floats per vertex + floats per uv
        gl.enable_vertex_attrib_array(1); // uv. see location=1 in vertex shader
        gl.vertex_attrib_pointer_with_i32(1, 2, GL::FLOAT, false, 4 * FLOAT_SIZE, 2 * FLOAT_SIZE); // 2 = floats before uv

        let uniform_locations = UniformLocations {
            projection: gl.get_uniform_location(&shader_program, "projection")
                .expect("Failed to get projection uniform"),
            view: gl.get_uniform_location(&shader_program, "view")
                .expect("Failed to get view uniform"),
            screen_position: gl.get_uniform_location(&shader_program, "screen_position")
                .expect("Failed to get screen_position uniform"),
            screen_scale: gl.get_uniform_location(&shader_program, "screen_scale")
                .expect("Failed to get screen_scale uniform"),
            is_julia: gl.get_uniform_location(&shader_program, "is_julia")
                .expect("Failed to get is_julia uniform"),
            c_re: gl.get_uniform_location(&shader_program, "c_re")
                .expect("Failed to get c_re uniform"),
            c_im: gl.get_uniform_location(&shader_program, "c_im")
                .expect("Failed to get c_im uniform"),
            max_iterations: gl.get_uniform_location(&shader_program, "max_iterations")
                .expect("Failed to get max_iterations uniform"),
            power: gl.get_uniform_location(&shader_program, "power")
                .expect("Failed to get power uniform"),
            color1: gl.get_uniform_location(&shader_program, "color1")
                .expect("Failed to get color1 uniform"),
            color2: gl.get_uniform_location(&shader_program, "color2")
                .expect("Failed to get color2 uniform"),
            color3: gl.get_uniform_location(&shader_program, "color3")
                .expect("Failed to get color3 uniform"),
            set_color: gl.get_uniform_location(&shader_program, "set_color")
                .expect("Failed to get set_color uniform"),
            color_steps: gl.get_uniform_location(&shader_program, "color_steps")
                .expect("Failed to get color_steps uniform"),
            color_shift: gl.get_uniform_location(&shader_program, "color_shift")
                .expect("Failed to get color_shift uniform"),
            is_color_smooth: gl.get_uniform_location(&shader_program, "is_color_smooth")
                .expect("Failed to get is_color_smooth uniform"),
        };
        gl.use_program(None); // end use shader program

        let zone = Zone {
            gl,
            vao,
            shader_program,
            attribute_buffer,
            uniform_locations,
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
    _frame_number: u32,
    _is_left_eye: bool,
    zone_params: ZoneParams,
) {
    ZONE.with(|z| {
        if let Some(zone) = z.borrow_mut().as_mut() {
            // Set up
            zone.gl.bind_framebuffer(GL::FRAMEBUFFER, framebuffer.as_ref());
            if should_setup_framebuffer {
                zone.gl.clear_color(zone_params.sky_r(), zone_params.sky_g(), zone_params.sky_b(), 1.0);
                zone.gl.clear(GL::COLOR_BUFFER_BIT | GL::DEPTH_BUFFER_BIT);
            }
            zone.gl.viewport(viewport.x(), viewport.y(), viewport.width(), viewport.height());
            zone.gl.use_program(Some(&zone.shader_program));
            zone.gl.bind_vertex_array(Some(&zone.vao));

            // Update attributes
            zone.gl.bind_buffer(GL::ARRAY_BUFFER, Some(&zone.attribute_buffer));
            let attributes = create_attributes(
                zone_params.triangle_spacing(),
                zone_params.u_center(), zone_params.v_center(), zone_params.u_width(), zone_params.v_height()
            );
            let attributes_array = js_sys::Float32Array::from(&attributes[..]);
            zone.gl.buffer_sub_data_with_i32_and_array_buffer_view(GL::ARRAY_BUFFER, 0, &attributes_array);

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

            zone.gl.uniform3f(
                Some(&zone.uniform_locations.screen_position),
                zone_params.screen_position_x(), zone_params.screen_position_y(), -zone_params.screen_position_z() // -z because originally Unity coordinate frame
            );
            zone.gl.uniform3f(
                Some(&zone.uniform_locations.screen_scale),
                zone_params.screen_scale_x(), zone_params.screen_scale_y(), zone_params.screen_scale_z()
            );
            zone.gl.uniform1i(Some(&zone.uniform_locations.is_julia), if zone_params._IsJulia() { 1 } else { 0 });
            zone.gl.uniform1f(Some(&zone.uniform_locations.c_re), zone_params._c_re());
            zone.gl.uniform1f(Some(&zone.uniform_locations.c_im), zone_params._c_im());
            zone.gl.uniform1f(Some(&zone.uniform_locations.max_iterations), zone_params._MaxIterations());
            zone.gl.uniform1f(Some(&zone.uniform_locations.power), zone_params._Power());
            zone.gl.uniform3f(
                Some(&zone.uniform_locations.color1),
                zone_params._Color1R(), zone_params._Color1G(), zone_params._Color1B()
            );
            zone.gl.uniform3f(
                Some(&zone.uniform_locations.color2),
                zone_params._Color2R(), zone_params._Color2G(), zone_params._Color2B()
            );
            zone.gl.uniform3f(
                Some(&zone.uniform_locations.color3),
                zone_params._Color3R(), zone_params._Color3G(), zone_params._Color3B()
            );
            zone.gl.uniform3f(
                Some(&zone.uniform_locations.set_color),
                zone_params._SetColorR(), zone_params._SetColorG(), zone_params._SetColorB()
            );
            zone.gl.uniform1f(Some(&zone.uniform_locations.color_steps), zone_params._ColorSteps());
            zone.gl.uniform1f(Some(&zone.uniform_locations.color_shift), zone_params._ColorShift());
            zone.gl.uniform1i(Some(&zone.uniform_locations.is_color_smooth), if zone_params._IsColorSmooth() { 1 } else { 0 });

            // Draw
            zone.gl.draw_elements_with_i32(
                GL::TRIANGLES,
                INDICES.len() as i32,
                GL::UNSIGNED_INT,
                0,
            );
            // let error = self.gl.get_error();
            // assert_eq!(error, GL::NO_ERROR, "OpenGL error: {:?}", error);

            // Wrap up
            zone.gl.bind_vertex_array(None);
            zone.gl.use_program(None);
        } else {
            web_sys::console::log_1(&"State not initialized. Call start() first.".into());
        }
    });
}

#[wasm_bindgen]
extern "C" {
    #[wasm_bindgen(typescript_type = "any")]
    pub type ZoneParams;
    
    #[wasm_bindgen(method, getter, js_name = triangle_spacing)] pub fn triangle_spacing(this: &ZoneParams) -> f32; // everything changeable
    #[wasm_bindgen(method, getter, js_name = sky_r)] pub fn sky_r(this: &ZoneParams) -> f32;
    #[wasm_bindgen(method, getter, js_name = sky_g)] pub fn sky_g(this: &ZoneParams) -> f32;
    #[wasm_bindgen(method, getter, js_name = sky_b)] pub fn sky_b(this: &ZoneParams) -> f32;
    #[wasm_bindgen(method, getter, js_name = screen_position_x)] pub fn screen_position_x(this: &ZoneParams) -> f32;
    #[wasm_bindgen(method, getter, js_name = screen_position_y)] pub fn screen_position_y(this: &ZoneParams) -> f32;
    #[wasm_bindgen(method, getter, js_name = screen_position_z)] pub fn screen_position_z(this: &ZoneParams) -> f32;
    #[wasm_bindgen(method, getter, js_name = screen_scale_x)] pub fn screen_scale_x(this: &ZoneParams) -> f32;
    #[wasm_bindgen(method, getter, js_name = screen_scale_y)] pub fn screen_scale_y(this: &ZoneParams) -> f32;
    #[wasm_bindgen(method, getter, js_name = screen_scale_z)] pub fn screen_scale_z(this: &ZoneParams) -> f32;
    #[wasm_bindgen(method, getter, js_name = u_center)] pub fn u_center(this: &ZoneParams) -> f32;
    #[wasm_bindgen(method, getter, js_name = v_center)] pub fn v_center(this: &ZoneParams) -> f32;
    #[wasm_bindgen(method, getter, js_name = u_width)] pub fn u_width(this: &ZoneParams) -> f32;
    #[wasm_bindgen(method, getter, js_name = v_height)] pub fn v_height(this: &ZoneParams) -> f32;
    #[wasm_bindgen(method, getter, js_name = _IsJulia)] pub fn _IsJulia(this: &ZoneParams) -> bool;
    #[wasm_bindgen(method, getter, js_name = _c_re)] pub fn _c_re(this: &ZoneParams) -> f32;
    #[wasm_bindgen(method, getter, js_name = _c_im)] pub fn _c_im(this: &ZoneParams) -> f32;
    #[wasm_bindgen(method, getter, js_name = _MaxIterations)] pub fn _MaxIterations(this: &ZoneParams) -> f32;
    #[wasm_bindgen(method, getter, js_name = _Power)] pub fn _Power(this: &ZoneParams) -> f32;
    #[wasm_bindgen(method, getter, js_name = _Color1R)] pub fn _Color1R(this: &ZoneParams) -> f32;
    #[wasm_bindgen(method, getter, js_name = _Color1G)] pub fn _Color1G(this: &ZoneParams) -> f32;
    #[wasm_bindgen(method, getter, js_name = _Color1B)] pub fn _Color1B(this: &ZoneParams) -> f32;
    #[wasm_bindgen(method, getter, js_name = _Color2R)] pub fn _Color2R(this: &ZoneParams) -> f32;
    #[wasm_bindgen(method, getter, js_name = _Color2G)] pub fn _Color2G(this: &ZoneParams) -> f32;
    #[wasm_bindgen(method, getter, js_name = _Color2B)] pub fn _Color2B(this: &ZoneParams) -> f32;
    #[wasm_bindgen(method, getter, js_name = _Color3R)] pub fn _Color3R(this: &ZoneParams) -> f32;
    #[wasm_bindgen(method, getter, js_name = _Color3G)] pub fn _Color3G(this: &ZoneParams) -> f32;
    #[wasm_bindgen(method, getter, js_name = _Color3B)] pub fn _Color3B(this: &ZoneParams) -> f32;
    #[wasm_bindgen(method, getter, js_name = _SetColorR)] pub fn _SetColorR(this: &ZoneParams) -> f32;
    #[wasm_bindgen(method, getter, js_name = _SetColorG)] pub fn _SetColorG(this: &ZoneParams) -> f32;
    #[wasm_bindgen(method, getter, js_name = _SetColorB)] pub fn _SetColorB(this: &ZoneParams) -> f32;
    #[wasm_bindgen(method, getter, js_name = _ColorSteps)] pub fn _ColorSteps(this: &ZoneParams) -> f32;
    #[wasm_bindgen(method, getter, js_name = _ColorShift)] pub fn _ColorShift(this: &ZoneParams) -> f32;
    #[wasm_bindgen(method, getter, js_name = _IsColorSmooth)] pub fn _IsColorSmooth(this: &ZoneParams) -> bool;
}

struct UniformLocations {
    projection: WebGlUniformLocation,
    view: WebGlUniformLocation,
    screen_position: WebGlUniformLocation,
    screen_scale: WebGlUniformLocation,
    is_julia: WebGlUniformLocation,
    c_re: WebGlUniformLocation,
    c_im: WebGlUniformLocation,
    max_iterations: WebGlUniformLocation,
    power: WebGlUniformLocation,
    color1: WebGlUniformLocation,
    color2: WebGlUniformLocation,
    color3: WebGlUniformLocation,
    set_color: WebGlUniformLocation,
    color_steps: WebGlUniformLocation,
    color_shift: WebGlUniformLocation,
    is_color_smooth: WebGlUniformLocation,
}

fn create_attributes(
    triangle_spacing: f32,
    u_center: f32,
    v_center: f32,
    u_width: f32,
    v_height: f32
) -> [f32; 8 * 3 * 4] {
    // 8 triangles, each triangle with 3 vertices, each vertex is vec2 (x, y) + vec2 (u, v)
    
    let spacer0 = triangle_spacing;
    let spacer1 = spacer0 * 2.0 * ROOT_TWO;
    
    let u_min = u_center - u_width/2.0;
    let u_max = u_center + u_width/2.0;
    let v_min = v_center - v_height/2.0;
    let v_max = v_center + v_height/2.0;

    [
        // inner triangles
        0.0 + spacer0, 0.0 + spacer0, u_center, v_center,
        1.0 + spacer0, 0.0 + spacer0, u_max, v_center,
        0.0 + spacer0, 1.0 + spacer0, u_center, v_max,

        0.0 + spacer0, 0.0 - spacer0, u_center, v_center,
        0.0 + spacer0, -1.0 - spacer0, u_center, v_min,
        1.0 + spacer0, 0.0 - spacer0, u_max, v_center,

        0.0 - spacer0, 0.0 - spacer0, u_center, v_center,
        -1.0 - spacer0, 0.0 - spacer0, u_min, v_center,
        0.0 - spacer0, -1.0 - spacer0, u_center, v_min,

        0.0 - spacer0, 0.0 + spacer0, u_center, v_center,
        0.0 - spacer0, 1.0 + spacer0, u_center, v_max,
        -1.0 - spacer0, 0.0 + spacer0, u_min, v_center,

        // outer triangles
        1.0 + spacer1, 1.0 + spacer1, u_max, v_max,
        0.0 + spacer1, 1.0 + spacer1, u_center, v_max,
        1.0 + spacer1, 0.0 + spacer1, u_max, v_center,

        1.0 + spacer1, -1.0 - spacer1, u_max, v_min,
        1.0 + spacer1, 0.0 - spacer1, u_max, v_center,
        0.0 + spacer1, -1.0 - spacer1, u_center, v_min,

        -1.0 - spacer1, -1.0 - spacer1, u_min, v_min,
        0.0 - spacer1, -1.0 - spacer1, u_center, v_min,
        -1.0 - spacer1, 0.0 - spacer1, u_min, v_center,

        -1.0 - spacer1, 1.0 + spacer1, u_min, v_max,
        -1.0 - spacer1, 0.0 + spacer1, u_min, v_center,
        0.0 - spacer1, 1.0 + spacer1, u_center, v_max,
    ]
}

const INDICES: [u32; 8 * 3] = [
    // inner triangles
    0, 1, 2, // Triangle 1
    3, 4, 5, // Triangle 2
    6, 7, 8, // Triangle 3
    9, 10, 11, // Triangle 4
    // outer triangles
    12, 13, 14, // Triangle 5
    15, 16, 17, // Triangle 6
    18, 19, 20, // Triangle 7
    21, 22, 23, // Triangle 8
];

const ROOT_TWO: f32 = 1.414213562; // f32::sqrt(2.0)
const FLOAT_SIZE: i32 = 4;

const VERTEX_SHADER_SOURCE: &str = include_str!("vertex.glsl");
const FRAGMENT_SHADER_SOURCE: &str = include_str!("fragment.glsl");
