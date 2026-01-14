
let gl = null;
let baseLayer = null;
let xrSession = null;
let xrReferenceSpace = null;
let bodyParams = null;
let zoneParams = null;

let xrSessionType = null;
let xrSessionFeatures = null;
let xrReferenceSpaceType = null;
let xrReferenceSpaceDeltaY = null;

// if (xrSessionType === 'inline') {
//     console.log('Forcing `xrReferenceSpaceType = "viewer"` for `inline` mode');
//     xrReferenceSpaceType = 'viewer';
// }
// if (xrReferenceSpaceType === 'local-floor') {
//     console.log('Adding XR Features for local-floor');
//     xrSessionFeatures = {
//         requiredFeatures: ['local-floor'],
//         optionalFeatures: ['bounded-floor'] // without this, `local-floor` merely = `local` + { x: 0, y: 1.6, z: 0 }
//     }
// }

const inline_width = 800;
const inline_height = 600;
const inline_viewport = { x: 0, y: 0, width: inline_width, height: inline_height };

let startTime = null;
let lastTime = null;
let fpsSmoothing = 200;
let fpsHistory = [];
let frameNumber;

const DEFAULT_LEFT_HAND_INPUT_SOURCE = {
    transform: {
        position: { x: -0.2, y: 0.75, z: -0.2 },
        orientation: { x: 0, y: 0, z: 0, w: 1 }
    },
    gamepad: { axes: [0, 0, 0, 0] }
};
const DEFAULT_RIGHT_HAND_INPUT_SOURCE = {
    transform: {
        position: { x: 0.2, y: 0.75, z: -0.2 },
        orientation: { x: 0, y: 0, z: 0, w: 1 }
    },
    gamepad: { axes: [0, 0, 0, 0] }
};
let leftHand = DEFAULT_LEFT_HAND_INPUT_SOURCE;
let rightHand = DEFAULT_RIGHT_HAND_INPUT_SOURCE;
let leftThumbstick = DEFAULT_LEFT_HAND_INPUT_SOURCE.gamepad.axes;
let rightThumbstick = DEFAULT_RIGHT_HAND_INPUT_SOURCE.gamepad.axes;

window.addEventListener("ZTApplicationStarted", (event) => {
    createXRStartButton();
});

function createXRStartButton() {
    let topOffset = 20;
    const buttonSpacing = 50;

    ['inline local', 'inline local-floor', 'immersive local', 'immersive local-floor', ''].forEach(vrMode => {
        const button = document.createElement('button');
        button.textContent = 'Start VR ' + vrMode;
        button.style.position = 'absolute';
        button.style.top = `${topOffset}px`;
        button.style.right = '20px';
        button.style.zIndex = '10';
        button.style.padding = '10px 20px';
        button.style.fontSize = '16px';

        document.body.appendChild(button);

        if (vrMode === '') {
            button.textContent = '0 FPS';
            window.vrButton = button;
        } else {
            button.style.cursor = 'pointer';
            button.addEventListener('click', () => {
                startXRSession(vrMode);
            });
        }

        topOffset += buttonSpacing;
    });
}

function startXRSession(vrMode) {
    switch (vrMode) {
        case 'inline local':
            xrSessionType = 'inline';
            xrSessionFeatures = {};
            xrReferenceSpaceType = 'viewer';
            xrReferenceSpaceDeltaY = 0.0;
            break;
        case 'inline local-floor':
            xrSessionType = 'inline';
            xrSessionFeatures = {};
            xrReferenceSpaceType = 'viewer';
            xrReferenceSpaceDeltaY = -1.6;
            break;
        case 'immersive local':
            xrSessionType = 'immersive-vr';
            xrSessionFeatures = {};
            xrReferenceSpaceType = 'local';
            xrReferenceSpaceDeltaY = 0.0;
            break;
        case 'immersive local-floor':
            xrSessionType = 'immersive-vr';
            xrSessionFeatures = { requiredFeatures: ['local-floor'], optionalFeatures: ['bounded-floor'] };
            xrReferenceSpaceType = 'local-floor';
            xrReferenceSpaceDeltaY = 0.0;
            break;
        default:
            console.error(`Unrecognized vrMode: ${vrMode}`);
    }
    
    const canvas = document.getElementById('xr_canvas');
    canvas.width = inline_width;
    canvas.height = inline_height;
    canvas.style.width = inline_width + 'px';
    canvas.style.height = inline_height + 'px';
    gl = canvas.getContext('webgl2', { xrCompatible: true });

    if (gl && navigator.xr) {
        navigator.xr.requestSession(xrSessionType, xrSessionFeatures).then(session => {
            console.log('XR Session started');

            baseLayer = new XRWebGLLayer(session, gl);
            session.updateRenderState({ baseLayer: baseLayer });
            console.log('XRWebGLLayer created');

            session.requestReferenceSpace(xrReferenceSpaceType).then(referenceSpace => {
                console.log('XR reference space requested');
                
                xrSession = session;
                xrReferenceSpace = referenceSpace;

                frameNumber = 0;
                session.requestAnimationFrame(renderXrFrame);
            }).catch(err => {
                console.error('Failed to request reference space:', err);
            });
        }).catch(err => {
            console.error('Failed to start XR session:', err);
        });
    } else {
        console.error('WebGL2 or WebXR not supported');
    }
}

function eulerAnglesToQuaternion(x, y, z) {
    const cx = Math.cos(x / 2);
    const sx = Math.sin(x / 2);
    const cy = Math.cos(y / 2);
    const sy = Math.sin(y / 2);
    const cz = Math.cos(z / 2);
    const sz = Math.sin(z / 2);

    return {
        x: sx * cy * cz - cx * sy * sz,
        y: cx * sy * cz + sx * cy * sz,
        z: cx * cy * sz - sx * sy * cz,
        w: cx * cy * cz + sx * sy * sz,
    };
}

function renderXrFrame(time, xrFrame) {
    const elapsedTime = startTime == null ? 0.0 : (time - startTime) / 1000; // (time - startTime) / 1000 || 0.0; // In seconds, default 0.0 eg when startTime null
    let pose = null;

    if (xrSessionType === 'inline') {
        const xRotation = Math.sin(elapsedTime) * 0.4;
        const yRotation = Math.cos(elapsedTime) * 0.4;
        const zRotation = 0.0;
        const handsDeltaY = -xrReferenceSpaceDeltaY - 0.7;

        leftHand.transform.position.y = Math.cos(2.0 * elapsedTime) * 0.4 + handsDeltaY;
        leftHand.transform.orientation = eulerAnglesToQuaternion(xRotation, yRotation, zRotation);
        rightHand.transform.position.y = Math.sin(2.0 * elapsedTime) * 0.4 + handsDeltaY;
        rightHand.transform.orientation = eulerAnglesToQuaternion(-xRotation, -yRotation, zRotation);
        // leftThumbstick = something;
        // rightThumbstick = something;

        const quat = eulerAnglesToQuaternion(xRotation, yRotation, zRotation);
        const offsetTransform = new XRRigidTransform(
            { x: 0, y: xrReferenceSpaceDeltaY, z: 0 },           // Position offset
            new DOMPointReadOnly(quat.x, quat.y, quat.z, quat.w) // Rotation offset
        );
        pose = xrFrame.getViewerPose(xrReferenceSpace.getOffsetReferenceSpace(offsetTransform));
    } else {
        pose = xrFrame.getViewerPose(xrReferenceSpace);
    }

    if (!pose) {
        console.error("Viewer pose is null.");
    } else {
        if (xrSessionType !== 'inline') {
            xrSession.inputSources.forEach(inputSource => {
                if (inputSource.gripSpace) {
                    handPose = xrFrame.getPose(inputSource.gripSpace, xrReferenceSpace);
                    if (inputSource.handedness === "left") {
                        leftHand = checkUpdate(leftHand, "leftHand", handPose);
                    } else if (inputSource.handedness === "right") {
                        rightHand = checkUpdate(rightHand, "rightHand", handPose);
                    }
                }
                if (inputSource.gamepad && inputSource.gamepad.axes) {
                    handPose = xrFrame.getPose(inputSource.gripSpace, xrReferenceSpace);
                    if (inputSource.handedness === "left") {
                        leftThumbstick = checkUpdate(leftThumbstick, "leftThumbstick", inputSource.gamepad.axes);
                    } else if (inputSource.handedness === "right") {
                        rightThumbstick = checkUpdate(rightThumbstick, "rightThumbstick", inputSource.gamepad.axes);
                    }
                }
            });
        }

        const bodyPose = {
            head: pose,
            leftHand: leftHand,
            rightHand: rightHand,
            leftThumbstick: leftThumbstick,
            rightThumbstick: rightThumbstick
        };
        if (bodyParams === null) {
            bodyParams = new BodyParams(bodyPose);
            zoneParams = new ZoneParams(window.zoneParams, bodyParams);
        }
        const zoneParamsJson = zoneParams.evaluateZoneParams(elapsedTime, bodyPose);
        bodyParams.frameReset();

        if (startTime === null) {
            startTime = time;
            window.wasmBindings.init_zone(gl, frameNumber, zoneParamsJson);
            frameNumber++;
        } else {
            const frameTime = (time - lastTime) / 1000.0;
            displayFPS(frameTime);
        }
        lastTime = time;
        
        const framebuffer = xrSessionType === 'immersive-vr' ? baseLayer.framebuffer : null; // TODO do this in startXRSession?
        pose.views.forEach((view, idx) => { // only one view in inline mode
            const shouldSetupFramebuffer = idx === 0;
            const viewport = xrSessionType === 'immersive-vr' ? baseLayer.getViewport(view) : inline_viewport;
            enforceGraphicsApiRequirements(gl);
            window.wasmBindings.render_zone(
                framebuffer,
                shouldSetupFramebuffer,
                viewport,
                view.transform.inverse.matrix,
                view.projectionMatrix,
                frameNumber,
                view.eye === 'left',
                zoneParamsJson
            );
        });
        frameNumber++;
    }
    xrSession.requestAnimationFrame(renderXrFrame);
}

function checkUpdate(pose, poseName, updatedPose) {
    if (!updatedPose) {
        console.error(`${poseName} is null, using last.`);
        return pose;
    } else {
        return updatedPose;
    }
}

function displayFPS(frameTime) {
    if (fpsHistory.length >= fpsSmoothing) {
        fpsHistory.shift();
    }
    fpsHistory.push(frameTime);

    const avgFrameTime = fpsHistory.reduce((sum, ft) => sum + ft, 0) / fpsHistory.length;
    const fps = avgFrameTime > 0 ? 1.0 / avgFrameTime : 0;

    window.vrButton.textContent = Math.round(fps) + ' FPS';
}

function enforceGraphicsApiRequirements(gl) {
    // Reset GPU settings
    // Depth
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LESS);
    gl.depthMask(true);
    gl.depthRange(0.0, 1.0);
    // Blending
    gl.disable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ZERO);
    gl.blendEquation(gl.FUNC_ADD);
    gl.blendColor(0, 0, 0, 0);
    // Face culling
    gl.enable(gl.CULL_FACE);
    gl.frontFace(gl.CCW);
    gl.cullFace(gl.BACK);
    // Color writing
    gl.colorMask(true, true, true, true);
    // Viewport/scissor
    const { drawingBufferWidth: w, drawingBufferHeight: h } = gl;
    gl.viewport(0, 0, w, h);
    gl.scissor(0, 0, w, h);
    gl.disable(gl.SCISSOR_TEST);
    // Misc
    gl.enable(gl.DITHER);
    gl.disable(gl.STENCIL_TEST);
    gl.disable(gl.POLYGON_OFFSET_FILL);
    gl.lineWidth(1);
    gl.polygonOffset(0, 0);

    // Unbind program/VAO/textures
    gl.useProgram(null);
    gl.bindVertexArray(null);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
    gl.bindTexture(gl.TEXTURE_2D, null);
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, null);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    // Clear color, depth, stencil buffer bits
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT | gl.STENCIL_BUFFER_BIT);
}
