let wasm;

function addHeapObject(obj) {
    if (heap_next === heap.length) heap.push(heap.length + 1);
    const idx = heap_next;
    heap_next = heap[idx];

    heap[idx] = obj;
    return idx;
}

function dropObject(idx) {
    if (idx < 132) return;
    heap[idx] = heap_next;
    heap_next = idx;
}

function getArrayF32FromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    return getFloat32ArrayMemory0().subarray(ptr / 4, ptr / 4 + len);
}

function getArrayU32FromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    return getUint32ArrayMemory0().subarray(ptr / 4, ptr / 4 + len);
}

let cachedDataViewMemory0 = null;
function getDataViewMemory0() {
    if (cachedDataViewMemory0 === null || cachedDataViewMemory0.buffer.detached === true || (cachedDataViewMemory0.buffer.detached === undefined && cachedDataViewMemory0.buffer !== wasm.memory.buffer)) {
        cachedDataViewMemory0 = new DataView(wasm.memory.buffer);
    }
    return cachedDataViewMemory0;
}

let cachedFloat32ArrayMemory0 = null;
function getFloat32ArrayMemory0() {
    if (cachedFloat32ArrayMemory0 === null || cachedFloat32ArrayMemory0.byteLength === 0) {
        cachedFloat32ArrayMemory0 = new Float32Array(wasm.memory.buffer);
    }
    return cachedFloat32ArrayMemory0;
}

function getStringFromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    return decodeText(ptr, len);
}

let cachedUint32ArrayMemory0 = null;
function getUint32ArrayMemory0() {
    if (cachedUint32ArrayMemory0 === null || cachedUint32ArrayMemory0.byteLength === 0) {
        cachedUint32ArrayMemory0 = new Uint32Array(wasm.memory.buffer);
    }
    return cachedUint32ArrayMemory0;
}

let cachedUint8ArrayMemory0 = null;
function getUint8ArrayMemory0() {
    if (cachedUint8ArrayMemory0 === null || cachedUint8ArrayMemory0.byteLength === 0) {
        cachedUint8ArrayMemory0 = new Uint8Array(wasm.memory.buffer);
    }
    return cachedUint8ArrayMemory0;
}

function getObject(idx) { return heap[idx]; }

let heap = new Array(128).fill(undefined);
heap.push(undefined, null, true, false);

let heap_next = heap.length;

function isLikeNone(x) {
    return x === undefined || x === null;
}

function passStringToWasm0(arg, malloc, realloc) {
    if (realloc === undefined) {
        const buf = cachedTextEncoder.encode(arg);
        const ptr = malloc(buf.length, 1) >>> 0;
        getUint8ArrayMemory0().subarray(ptr, ptr + buf.length).set(buf);
        WASM_VECTOR_LEN = buf.length;
        return ptr;
    }

    let len = arg.length;
    let ptr = malloc(len, 1) >>> 0;

    const mem = getUint8ArrayMemory0();

    let offset = 0;

    for (; offset < len; offset++) {
        const code = arg.charCodeAt(offset);
        if (code > 0x7F) break;
        mem[ptr + offset] = code;
    }
    if (offset !== len) {
        if (offset !== 0) {
            arg = arg.slice(offset);
        }
        ptr = realloc(ptr, len, len = offset + arg.length * 3, 1) >>> 0;
        const view = getUint8ArrayMemory0().subarray(ptr + offset, ptr + len);
        const ret = cachedTextEncoder.encodeInto(arg, view);

        offset += ret.written;
        ptr = realloc(ptr, len, offset, 1) >>> 0;
    }

    WASM_VECTOR_LEN = offset;
    return ptr;
}

function takeObject(idx) {
    const ret = getObject(idx);
    dropObject(idx);
    return ret;
}

let cachedTextDecoder = new TextDecoder('utf-8', { ignoreBOM: true, fatal: true });
cachedTextDecoder.decode();
const MAX_SAFARI_DECODE_BYTES = 2146435072;
let numBytesDecoded = 0;
function decodeText(ptr, len) {
    numBytesDecoded += len;
    if (numBytesDecoded >= MAX_SAFARI_DECODE_BYTES) {
        cachedTextDecoder = new TextDecoder('utf-8', { ignoreBOM: true, fatal: true });
        cachedTextDecoder.decode();
        numBytesDecoded = len;
    }
    return cachedTextDecoder.decode(getUint8ArrayMemory0().subarray(ptr, ptr + len));
}

const cachedTextEncoder = new TextEncoder();

if (!('encodeInto' in cachedTextEncoder)) {
    cachedTextEncoder.encodeInto = function (arg, view) {
        const buf = cachedTextEncoder.encode(arg);
        view.set(buf);
        return {
            read: arg.length,
            written: buf.length
        };
    }
}

let WASM_VECTOR_LEN = 0;

/**
 * @param {WebGL2RenderingContext} gl
 * @param {number} _frame_number
 * @param {any} _zone_params
 */
export function init_zone(gl, _frame_number, _zone_params) {
    wasm.init_zone(addHeapObject(gl), _frame_number, addHeapObject(_zone_params));
}

/**
 * @param {WebGLFramebuffer | null | undefined} framebuffer
 * @param {boolean} should_setup_framebuffer
 * @param {XRViewport} viewport
 * @param {Float32Array} view_matrix
 * @param {Float32Array} projection_matrix
 * @param {number} _frame_number
 * @param {boolean} _is_left_eye
 * @param {any} zone_params
 */
export function render_zone(framebuffer, should_setup_framebuffer, viewport, view_matrix, projection_matrix, _frame_number, _is_left_eye, zone_params) {
    wasm.render_zone(isLikeNone(framebuffer) ? 0 : addHeapObject(framebuffer), should_setup_framebuffer, addHeapObject(viewport), addHeapObject(view_matrix), addHeapObject(projection_matrix), _frame_number, _is_left_eye, addHeapObject(zone_params));
}

const EXPECTED_RESPONSE_TYPES = new Set(['basic', 'cors', 'default']);

async function __wbg_load(module, imports) {
    if (typeof Response === 'function' && module instanceof Response) {
        if (typeof WebAssembly.instantiateStreaming === 'function') {
            try {
                return await WebAssembly.instantiateStreaming(module, imports);
            } catch (e) {
                const validResponse = module.ok && EXPECTED_RESPONSE_TYPES.has(module.type);

                if (validResponse && module.headers.get('Content-Type') !== 'application/wasm') {
                    console.warn("`WebAssembly.instantiateStreaming` failed because your server does not serve Wasm with `application/wasm` MIME type. Falling back to `WebAssembly.instantiate` which is slower. Original error:\n", e);

                } else {
                    throw e;
                }
            }
        }

        const bytes = await module.arrayBuffer();
        return await WebAssembly.instantiate(bytes, imports);
    } else {
        const instance = await WebAssembly.instantiate(module, imports);

        if (instance instanceof WebAssembly.Instance) {
            return { instance, module };
        } else {
            return instance;
        }
    }
}

function __wbg_get_imports() {
    const imports = {};
    imports.wbg = {};
    imports.wbg.__wbg__Color1B_90bc4b2113e3b142 = function(arg0) {
        const ret = getObject(arg0)._Color1B;
        return ret;
    };
    imports.wbg.__wbg__Color1G_2138f842a9b389c9 = function(arg0) {
        const ret = getObject(arg0)._Color1G;
        return ret;
    };
    imports.wbg.__wbg__Color1R_b4ccd4f6f682fac6 = function(arg0) {
        const ret = getObject(arg0)._Color1R;
        return ret;
    };
    imports.wbg.__wbg__Color2B_d734af8a444bb44b = function(arg0) {
        const ret = getObject(arg0)._Color2B;
        return ret;
    };
    imports.wbg.__wbg__Color2G_f26b90ac48a4ff90 = function(arg0) {
        const ret = getObject(arg0)._Color2G;
        return ret;
    };
    imports.wbg.__wbg__Color2R_66214300b92cd1c7 = function(arg0) {
        const ret = getObject(arg0)._Color2R;
        return ret;
    };
    imports.wbg.__wbg__Color3B_aeb031933f541b1d = function(arg0) {
        const ret = getObject(arg0)._Color3B;
        return ret;
    };
    imports.wbg.__wbg__Color3G_74f50670c68eb7c2 = function(arg0) {
        const ret = getObject(arg0)._Color3G;
        return ret;
    };
    imports.wbg.__wbg__Color3R_a1d0ba4517fa0aa9 = function(arg0) {
        const ret = getObject(arg0)._Color3R;
        return ret;
    };
    imports.wbg.__wbg__ColorShift_7f9d8a13d5137b86 = function(arg0) {
        const ret = getObject(arg0)._ColorShift;
        return ret;
    };
    imports.wbg.__wbg__ColorSteps_45532a38fcc29855 = function(arg0) {
        const ret = getObject(arg0)._ColorSteps;
        return ret;
    };
    imports.wbg.__wbg__IsColorSmooth_5f30dc55d6b79346 = function(arg0) {
        const ret = getObject(arg0)._IsColorSmooth;
        return ret;
    };
    imports.wbg.__wbg__IsJulia_68e7c29df15d15ea = function(arg0) {
        const ret = getObject(arg0)._IsJulia;
        return ret;
    };
    imports.wbg.__wbg__MaxIterations_0e390538119a66de = function(arg0) {
        const ret = getObject(arg0)._MaxIterations;
        return ret;
    };
    imports.wbg.__wbg__Power_7d0ce00b5dc5aeb8 = function(arg0) {
        const ret = getObject(arg0)._Power;
        return ret;
    };
    imports.wbg.__wbg__SetColorB_c36fa35900e21538 = function(arg0) {
        const ret = getObject(arg0)._SetColorB;
        return ret;
    };
    imports.wbg.__wbg__SetColorG_41b93a296dc65b09 = function(arg0) {
        const ret = getObject(arg0)._SetColorG;
        return ret;
    };
    imports.wbg.__wbg__SetColorR_c6cb4887fa39daad = function(arg0) {
        const ret = getObject(arg0)._SetColorR;
        return ret;
    };
    imports.wbg.__wbg___wbindgen_boolean_get_26f5f6437beeea62 = function(arg0) {
        const v = getObject(arg0);
        const ret = typeof(v) === 'boolean' ? v : undefined;
        return isLikeNone(ret) ? 0xFFFFFF : ret ? 1 : 0;
    };
    imports.wbg.__wbg___wbindgen_throw_0a01f95cbfe10f7c = function(arg0, arg1) {
        throw new Error(getStringFromWasm0(arg0, arg1));
    };
    imports.wbg.__wbg__c_im_3c775b3b909aa7bf = function(arg0) {
        const ret = getObject(arg0)._c_im;
        return ret;
    };
    imports.wbg.__wbg__c_re_d05abea43f8338ee = function(arg0) {
        const ret = getObject(arg0)._c_re;
        return ret;
    };
    imports.wbg.__wbg_attachShader_5d1750264807ca7c = function(arg0, arg1, arg2) {
        getObject(arg0).attachShader(getObject(arg1), getObject(arg2));
    };
    imports.wbg.__wbg_bindBuffer_ff1985b2082203d5 = function(arg0, arg1, arg2) {
        getObject(arg0).bindBuffer(arg1 >>> 0, getObject(arg2));
    };
    imports.wbg.__wbg_bindFramebuffer_d7a5c15e0d4594f9 = function(arg0, arg1, arg2) {
        getObject(arg0).bindFramebuffer(arg1 >>> 0, getObject(arg2));
    };
    imports.wbg.__wbg_bindVertexArray_bc513f07fe2bc532 = function(arg0, arg1) {
        getObject(arg0).bindVertexArray(getObject(arg1));
    };
    imports.wbg.__wbg_bufferData_110634d5e768cf7e = function(arg0, arg1, arg2, arg3) {
        getObject(arg0).bufferData(arg1 >>> 0, getObject(arg2), arg3 >>> 0);
    };
    imports.wbg.__wbg_bufferSubData_e830733167957632 = function(arg0, arg1, arg2, arg3) {
        getObject(arg0).bufferSubData(arg1 >>> 0, arg2, getObject(arg3));
    };
    imports.wbg.__wbg_clearColor_294c5204e5c05b8f = function(arg0, arg1, arg2, arg3, arg4) {
        getObject(arg0).clearColor(arg1, arg2, arg3, arg4);
    };
    imports.wbg.__wbg_clear_2c72c614b8f44b2f = function(arg0, arg1) {
        getObject(arg0).clear(arg1 >>> 0);
    };
    imports.wbg.__wbg_compileShader_4e085b43954c4be9 = function(arg0, arg1) {
        getObject(arg0).compileShader(getObject(arg1));
    };
    imports.wbg.__wbg_createBuffer_a2f03ebae27e423e = function(arg0) {
        const ret = getObject(arg0).createBuffer();
        return isLikeNone(ret) ? 0 : addHeapObject(ret);
    };
    imports.wbg.__wbg_createProgram_ad4e7ffbbcf2d132 = function(arg0) {
        const ret = getObject(arg0).createProgram();
        return isLikeNone(ret) ? 0 : addHeapObject(ret);
    };
    imports.wbg.__wbg_createShader_48aa898a94419b4e = function(arg0, arg1) {
        const ret = getObject(arg0).createShader(arg1 >>> 0);
        return isLikeNone(ret) ? 0 : addHeapObject(ret);
    };
    imports.wbg.__wbg_createVertexArray_e113af57a79ed763 = function(arg0) {
        const ret = getObject(arg0).createVertexArray();
        return isLikeNone(ret) ? 0 : addHeapObject(ret);
    };
    imports.wbg.__wbg_deleteShader_0b26a2645c9706a6 = function(arg0, arg1) {
        getObject(arg0).deleteShader(getObject(arg1));
    };
    imports.wbg.__wbg_depthFunc_1391b897c45104e9 = function(arg0, arg1) {
        getObject(arg0).depthFunc(arg1 >>> 0);
    };
    imports.wbg.__wbg_depthMask_98975bdacaf97ba9 = function(arg0, arg1) {
        getObject(arg0).depthMask(arg1 !== 0);
    };
    imports.wbg.__wbg_drawElements_0442e396abbf12be = function(arg0, arg1, arg2, arg3, arg4) {
        getObject(arg0).drawElements(arg1 >>> 0, arg2, arg3 >>> 0, arg4);
    };
    imports.wbg.__wbg_enableVertexAttribArray_58a550866be7e469 = function(arg0, arg1) {
        getObject(arg0).enableVertexAttribArray(arg1 >>> 0);
    };
    imports.wbg.__wbg_enable_6f8a0f3cee33fe6f = function(arg0, arg1) {
        getObject(arg0).enable(arg1 >>> 0);
    };
    imports.wbg.__wbg_flush_0d2fe4106f8e5537 = function(arg0) {
        getObject(arg0).flush();
    };
    imports.wbg.__wbg_getProgramInfoLog_35d780f39585756f = function(arg0, arg1, arg2) {
        const ret = getObject(arg1).getProgramInfoLog(getObject(arg2));
        var ptr1 = isLikeNone(ret) ? 0 : passStringToWasm0(ret, wasm.__wbindgen_export, wasm.__wbindgen_export2);
        var len1 = WASM_VECTOR_LEN;
        getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
        getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
    };
    imports.wbg.__wbg_getProgramParameter_96ff9c0f3098da85 = function(arg0, arg1, arg2) {
        const ret = getObject(arg0).getProgramParameter(getObject(arg1), arg2 >>> 0);
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_getShaderInfoLog_2c4caeffceacd06f = function(arg0, arg1, arg2) {
        const ret = getObject(arg1).getShaderInfoLog(getObject(arg2));
        var ptr1 = isLikeNone(ret) ? 0 : passStringToWasm0(ret, wasm.__wbindgen_export, wasm.__wbindgen_export2);
        var len1 = WASM_VECTOR_LEN;
        getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
        getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
    };
    imports.wbg.__wbg_getShaderParameter_62939190d12689ac = function(arg0, arg1, arg2) {
        const ret = getObject(arg0).getShaderParameter(getObject(arg1), arg2 >>> 0);
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_getUniformLocation_2b6521c6dc3e0d7b = function(arg0, arg1, arg2, arg3) {
        const ret = getObject(arg0).getUniformLocation(getObject(arg1), getStringFromWasm0(arg2, arg3));
        return isLikeNone(ret) ? 0 : addHeapObject(ret);
    };
    imports.wbg.__wbg_height_1f5aa2200aac56b8 = function(arg0) {
        const ret = getObject(arg0).height;
        return ret;
    };
    imports.wbg.__wbg_linkProgram_488ab53e480f3211 = function(arg0, arg1) {
        getObject(arg0).linkProgram(getObject(arg1));
    };
    imports.wbg.__wbg_log_5b2347ef955af24f = function(arg0) {
        console.log(getObject(arg0));
    };
    imports.wbg.__wbg_new_from_slice_7656c77be743ffeb = function(arg0, arg1) {
        const ret = new Uint32Array(getArrayU32FromWasm0(arg0, arg1));
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_new_from_slice_96b979d1287dc097 = function(arg0, arg1) {
        const ret = new Float32Array(getArrayF32FromWasm0(arg0, arg1));
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_screen_position_x_7a88e1b12ec4bd79 = function(arg0) {
        const ret = getObject(arg0).screen_position_x;
        return ret;
    };
    imports.wbg.__wbg_screen_position_y_9e00ff7464106a19 = function(arg0) {
        const ret = getObject(arg0).screen_position_y;
        return ret;
    };
    imports.wbg.__wbg_screen_position_z_5f1613913540b815 = function(arg0) {
        const ret = getObject(arg0).screen_position_z;
        return ret;
    };
    imports.wbg.__wbg_screen_scale_x_9ade8fe1cfb37904 = function(arg0) {
        const ret = getObject(arg0).screen_scale_x;
        return ret;
    };
    imports.wbg.__wbg_screen_scale_y_93682f6c99c6bee1 = function(arg0) {
        const ret = getObject(arg0).screen_scale_y;
        return ret;
    };
    imports.wbg.__wbg_screen_scale_z_3eaa9e19f481ebf2 = function(arg0) {
        const ret = getObject(arg0).screen_scale_z;
        return ret;
    };
    imports.wbg.__wbg_shaderSource_a52e9ad972321b38 = function(arg0, arg1, arg2, arg3) {
        getObject(arg0).shaderSource(getObject(arg1), getStringFromWasm0(arg2, arg3));
    };
    imports.wbg.__wbg_sky_b_c777d60e1f33ebb5 = function(arg0) {
        const ret = getObject(arg0).sky_b;
        return ret;
    };
    imports.wbg.__wbg_sky_g_9dd027595fda57f1 = function(arg0) {
        const ret = getObject(arg0).sky_g;
        return ret;
    };
    imports.wbg.__wbg_sky_r_f704a7845d2ee89e = function(arg0) {
        const ret = getObject(arg0).sky_r;
        return ret;
    };
    imports.wbg.__wbg_triangle_spacing_d96ee4db188d085a = function(arg0) {
        const ret = getObject(arg0).triangle_spacing;
        return ret;
    };
    imports.wbg.__wbg_u_center_f4f129f7c2ef048a = function(arg0) {
        const ret = getObject(arg0).u_center;
        return ret;
    };
    imports.wbg.__wbg_u_width_b6d042888352d42f = function(arg0) {
        const ret = getObject(arg0).u_width;
        return ret;
    };
    imports.wbg.__wbg_uniform1f_e5020fa4f4fb0596 = function(arg0, arg1, arg2) {
        getObject(arg0).uniform1f(getObject(arg1), arg2);
    };
    imports.wbg.__wbg_uniform1i_57f14ee37c7244e5 = function(arg0, arg1, arg2) {
        getObject(arg0).uniform1i(getObject(arg1), arg2);
    };
    imports.wbg.__wbg_uniform3f_994fb6fb5da10dd6 = function(arg0, arg1, arg2, arg3, arg4) {
        getObject(arg0).uniform3f(getObject(arg1), arg2, arg3, arg4);
    };
    imports.wbg.__wbg_uniformMatrix4fv_610b357c3fe9d6a1 = function(arg0, arg1, arg2, arg3) {
        getObject(arg0).uniformMatrix4fv(getObject(arg1), arg2 !== 0, getObject(arg3));
    };
    imports.wbg.__wbg_useProgram_10565626974290e7 = function(arg0, arg1) {
        getObject(arg0).useProgram(getObject(arg1));
    };
    imports.wbg.__wbg_v_center_c793202e50e11ed0 = function(arg0) {
        const ret = getObject(arg0).v_center;
        return ret;
    };
    imports.wbg.__wbg_v_height_63bbf1c13e77e453 = function(arg0) {
        const ret = getObject(arg0).v_height;
        return ret;
    };
    imports.wbg.__wbg_vertexAttribPointer_4df8d0058f20594d = function(arg0, arg1, arg2, arg3, arg4, arg5, arg6) {
        getObject(arg0).vertexAttribPointer(arg1 >>> 0, arg2, arg3 >>> 0, arg4 !== 0, arg5, arg6);
    };
    imports.wbg.__wbg_viewport_db16a1ec4c50c514 = function(arg0, arg1, arg2, arg3, arg4) {
        getObject(arg0).viewport(arg1, arg2, arg3, arg4);
    };
    imports.wbg.__wbg_width_8fbaec5e451ba42f = function(arg0) {
        const ret = getObject(arg0).width;
        return ret;
    };
    imports.wbg.__wbg_x_00f101e0938dd9bc = function(arg0) {
        const ret = getObject(arg0).x;
        return ret;
    };
    imports.wbg.__wbg_y_b88b4fb20f011761 = function(arg0) {
        const ret = getObject(arg0).y;
        return ret;
    };
    imports.wbg.__wbindgen_cast_2241b6af4c4b2941 = function(arg0, arg1) {
        // Cast intrinsic for `Ref(String) -> Externref`.
        const ret = getStringFromWasm0(arg0, arg1);
        return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_object_drop_ref = function(arg0) {
        takeObject(arg0);
    };

    return imports;
}

function __wbg_finalize_init(instance, module) {
    wasm = instance.exports;
    __wbg_init.__wbindgen_wasm_module = module;
    cachedDataViewMemory0 = null;
    cachedFloat32ArrayMemory0 = null;
    cachedUint32ArrayMemory0 = null;
    cachedUint8ArrayMemory0 = null;



    return wasm;
}

function initSync(module) {
    if (wasm !== undefined) return wasm;


    if (typeof module !== 'undefined') {
        if (Object.getPrototypeOf(module) === Object.prototype) {
            ({module} = module)
        } else {
            console.warn('using deprecated parameters for `initSync()`; pass a single object instead')
        }
    }

    const imports = __wbg_get_imports();
    if (!(module instanceof WebAssembly.Module)) {
        module = new WebAssembly.Module(module);
    }
    const instance = new WebAssembly.Instance(module, imports);
    return __wbg_finalize_init(instance, module);
}

async function __wbg_init(module_or_path) {
    if (wasm !== undefined) return wasm;


    if (typeof module_or_path !== 'undefined') {
        if (Object.getPrototypeOf(module_or_path) === Object.prototype) {
            ({module_or_path} = module_or_path)
        } else {
            console.warn('using deprecated parameters for the initialization function; pass a single object instead')
        }
    }

    if (typeof module_or_path === 'undefined') {
        module_or_path = new URL('fractal_window_bg.wasm', import.meta.url);
    }
    const imports = __wbg_get_imports();

    if (typeof module_or_path === 'string' || (typeof Request === 'function' && module_or_path instanceof Request) || (typeof URL === 'function' && module_or_path instanceof URL)) {
        module_or_path = fetch(module_or_path);
    }

    const { instance, module } = await __wbg_load(await module_or_path, imports);

    return __wbg_finalize_init(instance, module);
}

export { initSync };
export default __wbg_init;
