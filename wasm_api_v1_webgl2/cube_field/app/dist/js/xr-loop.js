
// Copyright SensoriMotion

import { BodyParams } from './BodyParams.js';
import { ZoneParams } from './ZoneParams.js';

let gl = null;
let baseLayer = null;
let xrSession = null;
let xrSessionType = null;
let xrSessionFeatures = null;
let xrReferenceSpace = null;
let xrReferenceSpaceType = null;
let originLevel = null;

let bodyParams = new BodyParams();
bodyParams.shouldResetInits = true;

let zone = {
    params: window.zoneParams,
    paramsOriginalCopy: structuredClone(window.zoneParams),
    previewMotion: 'basic_dance',
};

const inline_width = 800;
const inline_height = 600;
const inline_viewport = { x: 0, y: 0, width: inline_width, height: inline_height };

let startTime = null;
let lastTime = null;
let fpsSmoothing = 200;
let fpsHistory = [];
let frameNumber;

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
            originLevel = 'eye';
            break;
        case 'inline local-floor':
            xrSessionType = 'inline';
            xrSessionFeatures = {};
            xrReferenceSpaceType = 'viewer';
            originLevel = 'floor';
            break;
        case 'immersive local':
            xrSessionType = 'immersive-vr';
            xrSessionFeatures = {};
            xrReferenceSpaceType = 'local';
            originLevel = null;
            break;
        case 'immersive local-floor':
            xrSessionType = 'immersive-vr';
            xrSessionFeatures = { requiredFeatures: ['local-floor'], optionalFeatures: ['bounded-floor'] };
            xrReferenceSpaceType = 'local-floor';
            originLevel = null;
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

function renderXrFrame(time, xrFrame) {
    const elapsedTime = startTime == null ? 0.0 : (time - startTime) / 1000; // (time - startTime) / 1000 || 0.0; // In seconds, default 0.0 eg when startTime null

    // get values for (head) pose and controllers
    if (xrSessionType !== 'inline') {
        xrSession.inputSources.forEach(inputSource => {
            if (inputSource.gripSpace && inputSource.gamepad && inputSource.gamepad.axes) {
                const handPose = xrFrame.getPose(inputSource.gripSpace, xrReferenceSpace);
                bodyParams.updateHand(inputSource.handedness, handPose, inputSource.gamepad.axes);
            }
        });
        bodyParams.head = xrFrame.getViewerPose(xrReferenceSpace);
    } else {
        bodyParams.evaluatePreviewMotionAtT(zone.previewMotion, elapsedTime, originLevel);
        const offsetTransform = new XRRigidTransform(
            bodyParams.head.transform.position, bodyParams.head.transform.orientation);
        bodyParams.head = xrFrame.getViewerPose(xrReferenceSpace.getOffsetReferenceSpace(offsetTransform)); // may not work on Firefox
    }
    if (bodyParams.shouldResetInits) bodyParams.tryResetInits();
    bodyParams.updateHistory(elapsedTime);

    // evaluate params and render
    if (!bodyParams.head) {
        console.error("Viewer pose is null.");
    } else {
        ZoneParams.evaluateZoneParams(zone, elapsedTime, bodyParams);
        bodyParams.resetCachedParams();

        if (startTime === null) {
            startTime = time;
            window.wasmBindings.init_zone(gl, frameNumber, zone.params);
            frameNumber++;
        } else {
            const frameTime = (time - lastTime) / 1000.0;
            displayFPS(frameTime);
        }
        lastTime = time;
        
        enforceGraphicsApiRequirements(gl);
        const framebuffer = xrSessionType === 'immersive-vr' ? baseLayer.framebuffer : null; // TODO do this in startXRSession?
        bodyParams.head.views.forEach((view, idx) => { // only one view in inline mode
            const shouldSetupFramebuffer = idx === 0;
            const viewport = xrSessionType === 'immersive-vr' ? baseLayer.getViewport(view) : inline_viewport;
            window.wasmBindings.render_zone(
                framebuffer,
                shouldSetupFramebuffer,
                viewport,
                view.transform.inverse.matrix,
                view.projectionMatrix,
                frameNumber,
                view.eye === 'left',
                zone.params,
            );
        });
        frameNumber++;
    }
    xrSession.requestAnimationFrame(renderXrFrame);
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
