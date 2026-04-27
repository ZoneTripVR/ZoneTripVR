/* @ts-self-types="./foo.d.ts" */

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
function __wbg_get_imports() {
    const import0 = {
        __proto__: null,
        __wbg__Color1B_491eb31b1efe4f19: function(arg0) {
            const ret = getObject(arg0)._Color1B;
            return ret;
        },
        __wbg__Color1G_792a3f691a94d1ed: function(arg0) {
            const ret = getObject(arg0)._Color1G;
            return ret;
        },
        __wbg__Color1R_a18e2c83ea713520: function(arg0) {
            const ret = getObject(arg0)._Color1R;
            return ret;
        },
        __wbg__Color2B_9d8a50304f8f605d: function(arg0) {
            const ret = getObject(arg0)._Color2B;
            return ret;
        },
        __wbg__Color2G_5b3149445021707d: function(arg0) {
            const ret = getObject(arg0)._Color2G;
            return ret;
        },
        __wbg__Color2R_60bb64b66f28fc16: function(arg0) {
            const ret = getObject(arg0)._Color2R;
            return ret;
        },
        __wbg__Color3B_eebabd82530194d5: function(arg0) {
            const ret = getObject(arg0)._Color3B;
            return ret;
        },
        __wbg__Color3G_e9e6b5eec5a17ca0: function(arg0) {
            const ret = getObject(arg0)._Color3G;
            return ret;
        },
        __wbg__Color3R_901a9aa23775cb44: function(arg0) {
            const ret = getObject(arg0)._Color3R;
            return ret;
        },
        __wbg__ColorShift_c6489bc05cec8cf0: function(arg0) {
            const ret = getObject(arg0)._ColorShift;
            return ret;
        },
        __wbg__ColorSteps_c81c627b1ce5568b: function(arg0) {
            const ret = getObject(arg0)._ColorSteps;
            return ret;
        },
        __wbg__IsColorSmooth_9cad4cba3ae5b31a: function(arg0) {
            const ret = getObject(arg0)._IsColorSmooth;
            return ret;
        },
        __wbg__IsJulia_7e3281ee09d68604: function(arg0) {
            const ret = getObject(arg0)._IsJulia;
            return ret;
        },
        __wbg__MaxIterations_fde1a7c6a0ca5a06: function(arg0) {
            const ret = getObject(arg0)._MaxIterations;
            return ret;
        },
        __wbg__Power_ca6c1ed0f95b9b94: function(arg0) {
            const ret = getObject(arg0)._Power;
            return ret;
        },
        __wbg__SetColorB_319289e8a0908451: function(arg0) {
            const ret = getObject(arg0)._SetColorB;
            return ret;
        },
        __wbg__SetColorG_01f8b1db7f31e82d: function(arg0) {
            const ret = getObject(arg0)._SetColorG;
            return ret;
        },
        __wbg__SetColorR_cafc299bfc835f92: function(arg0) {
            const ret = getObject(arg0)._SetColorR;
            return ret;
        },
        __wbg___wbindgen_boolean_get_fa3d04ab13de8c31: function(arg0) {
            const v = getObject(arg0);
            const ret = typeof(v) === 'boolean' ? v : undefined;
            return isLikeNone(ret) ? 0xFFFFFF : ret ? 1 : 0;
        },
        __wbg___wbindgen_throw_b7725190c754ac89: function(arg0, arg1) {
            throw new Error(getStringFromWasm0(arg0, arg1));
        },
        __wbg__c_im_05102f8471857812: function(arg0) {
            const ret = getObject(arg0)._c_im;
            return ret;
        },
        __wbg__c_re_c575197465196218: function(arg0) {
            const ret = getObject(arg0)._c_re;
            return ret;
        },
        __wbg_attachShader_3c577d0ec8f99190: function(arg0, arg1, arg2) {
            getObject(arg0).attachShader(getObject(arg1), getObject(arg2));
        },
        __wbg_bindBuffer_a446281d69c08f39: function(arg0, arg1, arg2) {
            getObject(arg0).bindBuffer(arg1 >>> 0, getObject(arg2));
        },
        __wbg_bindFramebuffer_bc9ff2a98fcfa7b1: function(arg0, arg1, arg2) {
            getObject(arg0).bindFramebuffer(arg1 >>> 0, getObject(arg2));
        },
        __wbg_bindVertexArray_9cb9e04eca981b9c: function(arg0, arg1) {
            getObject(arg0).bindVertexArray(getObject(arg1));
        },
        __wbg_bufferData_c603b593ea25f76a: function(arg0, arg1, arg2, arg3) {
            getObject(arg0).bufferData(arg1 >>> 0, getObject(arg2), arg3 >>> 0);
        },
        __wbg_bufferSubData_a18c55869f41bfd3: function(arg0, arg1, arg2, arg3) {
            getObject(arg0).bufferSubData(arg1 >>> 0, arg2, getObject(arg3));
        },
        __wbg_clearColor_4e3e7fecf8a7315a: function(arg0, arg1, arg2, arg3, arg4) {
            getObject(arg0).clearColor(arg1, arg2, arg3, arg4);
        },
        __wbg_clear_c0383a0bb700e931: function(arg0, arg1) {
            getObject(arg0).clear(arg1 >>> 0);
        },
        __wbg_compileShader_151f292dd90f6620: function(arg0, arg1) {
            getObject(arg0).compileShader(getObject(arg1));
        },
        __wbg_createBuffer_08f477ea69cf3c49: function(arg0) {
            const ret = getObject(arg0).createBuffer();
            return isLikeNone(ret) ? 0 : addHeapObject(ret);
        },
        __wbg_createProgram_2ca35254fd1545ad: function(arg0) {
            const ret = getObject(arg0).createProgram();
            return isLikeNone(ret) ? 0 : addHeapObject(ret);
        },
        __wbg_createShader_8b881679335434c4: function(arg0, arg1) {
            const ret = getObject(arg0).createShader(arg1 >>> 0);
            return isLikeNone(ret) ? 0 : addHeapObject(ret);
        },
        __wbg_createVertexArray_5139f64363d2acf2: function(arg0) {
            const ret = getObject(arg0).createVertexArray();
            return isLikeNone(ret) ? 0 : addHeapObject(ret);
        },
        __wbg_deleteShader_60b8ab55da9088cd: function(arg0, arg1) {
            getObject(arg0).deleteShader(getObject(arg1));
        },
        __wbg_depthFunc_256ab7bea5180e4f: function(arg0, arg1) {
            getObject(arg0).depthFunc(arg1 >>> 0);
        },
        __wbg_depthMask_273fd3e56bba1015: function(arg0, arg1) {
            getObject(arg0).depthMask(arg1 !== 0);
        },
        __wbg_drawElements_534cfa20c733c6b3: function(arg0, arg1, arg2, arg3, arg4) {
            getObject(arg0).drawElements(arg1 >>> 0, arg2, arg3 >>> 0, arg4);
        },
        __wbg_enableVertexAttribArray_e13ce7e20782a64c: function(arg0, arg1) {
            getObject(arg0).enableVertexAttribArray(arg1 >>> 0);
        },
        __wbg_enable_cc5d430d869cd760: function(arg0, arg1) {
            getObject(arg0).enable(arg1 >>> 0);
        },
        __wbg_getProgramInfoLog_671346a87eacf80f: function(arg0, arg1, arg2) {
            const ret = getObject(arg1).getProgramInfoLog(getObject(arg2));
            var ptr1 = isLikeNone(ret) ? 0 : passStringToWasm0(ret, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            var len1 = WASM_VECTOR_LEN;
            getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
            getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
        },
        __wbg_getProgramParameter_21ddce5a705dd684: function(arg0, arg1, arg2) {
            const ret = getObject(arg0).getProgramParameter(getObject(arg1), arg2 >>> 0);
            return addHeapObject(ret);
        },
        __wbg_getShaderInfoLog_e3168cf969e202eb: function(arg0, arg1, arg2) {
            const ret = getObject(arg1).getShaderInfoLog(getObject(arg2));
            var ptr1 = isLikeNone(ret) ? 0 : passStringToWasm0(ret, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            var len1 = WASM_VECTOR_LEN;
            getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
            getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
        },
        __wbg_getShaderParameter_c72f0de6255b5406: function(arg0, arg1, arg2) {
            const ret = getObject(arg0).getShaderParameter(getObject(arg1), arg2 >>> 0);
            return addHeapObject(ret);
        },
        __wbg_getUniformLocation_ac9828a13d0f118a: function(arg0, arg1, arg2, arg3) {
            const ret = getObject(arg0).getUniformLocation(getObject(arg1), getStringFromWasm0(arg2, arg3));
            return isLikeNone(ret) ? 0 : addHeapObject(ret);
        },
        __wbg_height_8125ace27b5a6670: function(arg0) {
            const ret = getObject(arg0).height;
            return ret;
        },
        __wbg_linkProgram_2088333bc5333396: function(arg0, arg1) {
            getObject(arg0).linkProgram(getObject(arg1));
        },
        __wbg_log_aa23a2f01b704114: function(arg0) {
            console.log(getObject(arg0));
        },
        __wbg_new_from_slice_77871c7e95d3467b: function(arg0, arg1) {
            const ret = new Float32Array(getArrayF32FromWasm0(arg0, arg1));
            return addHeapObject(ret);
        },
        __wbg_new_from_slice_f837244c289fa930: function(arg0, arg1) {
            const ret = new Uint32Array(getArrayU32FromWasm0(arg0, arg1));
            return addHeapObject(ret);
        },
        __wbg_screen_position_x_f49e99f7ad392f6b: function(arg0) {
            const ret = getObject(arg0).screen_position_x;
            return ret;
        },
        __wbg_screen_position_y_a4d23d9e8cc816a1: function(arg0) {
            const ret = getObject(arg0).screen_position_y;
            return ret;
        },
        __wbg_screen_position_z_38178bc53513c6ab: function(arg0) {
            const ret = getObject(arg0).screen_position_z;
            return ret;
        },
        __wbg_screen_scale_x_edbfef0d00c5a10b: function(arg0) {
            const ret = getObject(arg0).screen_scale_x;
            return ret;
        },
        __wbg_screen_scale_y_1f123a59d3cb96db: function(arg0) {
            const ret = getObject(arg0).screen_scale_y;
            return ret;
        },
        __wbg_screen_scale_z_713348fb38a2c673: function(arg0) {
            const ret = getObject(arg0).screen_scale_z;
            return ret;
        },
        __wbg_shaderSource_1ce5f3d65bde8437: function(arg0, arg1, arg2, arg3) {
            getObject(arg0).shaderSource(getObject(arg1), getStringFromWasm0(arg2, arg3));
        },
        __wbg_sky_b_e0b0bb0f68af5766: function(arg0) {
            const ret = getObject(arg0).sky_b;
            return ret;
        },
        __wbg_sky_g_a851c21111ea9eeb: function(arg0) {
            const ret = getObject(arg0).sky_g;
            return ret;
        },
        __wbg_sky_r_a56404dc14a7f83c: function(arg0) {
            const ret = getObject(arg0).sky_r;
            return ret;
        },
        __wbg_triangle_spacing_e320aac047050ca4: function(arg0) {
            const ret = getObject(arg0).triangle_spacing;
            return ret;
        },
        __wbg_u_center_efc8949100b1af82: function(arg0) {
            const ret = getObject(arg0).u_center;
            return ret;
        },
        __wbg_u_width_4b2de842f44d2d0e: function(arg0) {
            const ret = getObject(arg0).u_width;
            return ret;
        },
        __wbg_uniform1f_72a4ce0649f00d2c: function(arg0, arg1, arg2) {
            getObject(arg0).uniform1f(getObject(arg1), arg2);
        },
        __wbg_uniform1i_8bd7324db599aff2: function(arg0, arg1, arg2) {
            getObject(arg0).uniform1i(getObject(arg1), arg2);
        },
        __wbg_uniform3f_a1cb266d1e8e226c: function(arg0, arg1, arg2, arg3, arg4) {
            getObject(arg0).uniform3f(getObject(arg1), arg2, arg3, arg4);
        },
        __wbg_uniformMatrix4fv_1c17f948d2a894ce: function(arg0, arg1, arg2, arg3) {
            getObject(arg0).uniformMatrix4fv(getObject(arg1), arg2 !== 0, getObject(arg3));
        },
        __wbg_useProgram_83a8f19eb5ce80bb: function(arg0, arg1) {
            getObject(arg0).useProgram(getObject(arg1));
        },
        __wbg_v_center_85f2e8deb674217a: function(arg0) {
            const ret = getObject(arg0).v_center;
            return ret;
        },
        __wbg_v_height_0ef835d2369ba2a7: function(arg0) {
            const ret = getObject(arg0).v_height;
            return ret;
        },
        __wbg_vertexAttribPointer_bada5698f1c14e21: function(arg0, arg1, arg2, arg3, arg4, arg5, arg6) {
            getObject(arg0).vertexAttribPointer(arg1 >>> 0, arg2, arg3 >>> 0, arg4 !== 0, arg5, arg6);
        },
        __wbg_viewport_430a6d2910c37d6c: function(arg0, arg1, arg2, arg3, arg4) {
            getObject(arg0).viewport(arg1, arg2, arg3, arg4);
        },
        __wbg_width_79e7d77d9b3f5a19: function(arg0) {
            const ret = getObject(arg0).width;
            return ret;
        },
        __wbg_x_0d0491ed61353793: function(arg0) {
            const ret = getObject(arg0).x;
            return ret;
        },
        __wbg_y_78081913e6d3b9ec: function(arg0) {
            const ret = getObject(arg0).y;
            return ret;
        },
        __wbindgen_cast_0000000000000001: function(arg0, arg1) {
            // Cast intrinsic for `Ref(String) -> Externref`.
            const ret = getStringFromWasm0(arg0, arg1);
            return addHeapObject(ret);
        },
        __wbindgen_object_drop_ref: function(arg0) {
            takeObject(arg0);
        },
    };
    return {
        __proto__: null,
        "./foo_bg.js": import0,
    };
}

function addHeapObject(obj) {
    if (heap_next === heap.length) heap.push(heap.length + 1);
    const idx = heap_next;
    heap_next = heap[idx];

    heap[idx] = obj;
    return idx;
}

function dropObject(idx) {
    if (idx < 1028) return;
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

let heap = new Array(1024).fill(undefined);
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
    };
}

let WASM_VECTOR_LEN = 0;

let wasmModule, wasm;
function __wbg_finalize_init(instance, module) {
    wasm = instance.exports;
    wasmModule = module;
    cachedDataViewMemory0 = null;
    cachedFloat32ArrayMemory0 = null;
    cachedUint32ArrayMemory0 = null;
    cachedUint8ArrayMemory0 = null;
    return wasm;
}

async function __wbg_load(module, imports) {
    if (typeof Response === 'function' && module instanceof Response) {
        if (typeof WebAssembly.instantiateStreaming === 'function') {
            try {
                return await WebAssembly.instantiateStreaming(module, imports);
            } catch (e) {
                const validResponse = module.ok && expectedResponseType(module.type);

                if (validResponse && module.headers.get('Content-Type') !== 'application/wasm') {
                    console.warn("`WebAssembly.instantiateStreaming` failed because your server does not serve Wasm with `application/wasm` MIME type. Falling back to `WebAssembly.instantiate` which is slower. Original error:\n", e);

                } else { throw e; }
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

    function expectedResponseType(type) {
        switch (type) {
            case 'basic': case 'cors': case 'default': return true;
        }
        return false;
    }
}

function initSync(module) {
    if (wasm !== undefined) return wasm;


    if (module !== undefined) {
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


    if (module_or_path !== undefined) {
        if (Object.getPrototypeOf(module_or_path) === Object.prototype) {
            ({module_or_path} = module_or_path)
        } else {
            console.warn('using deprecated parameters for the initialization function; pass a single object instead')
        }
    }

    if (module_or_path === undefined) {
        module_or_path = new URL('fractal_window_bg.wasm', import.meta.url);
    }
    const imports = __wbg_get_imports();

    if (typeof module_or_path === 'string' || (typeof Request === 'function' && module_or_path instanceof Request) || (typeof URL === 'function' && module_or_path instanceof URL)) {
        module_or_path = fetch(module_or_path);
    }

    const { instance, module } = await __wbg_load(await module_or_path, imports);

    return __wbg_finalize_init(instance, module);
}

export { initSync, __wbg_init as default };
