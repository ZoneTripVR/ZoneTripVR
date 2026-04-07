
// Copyright SensoriMotion

export class BodyParams {

    static DEFAULT_HEAD_POSE = {transform: {
        position: { x: 0, y: 0, z: 0 }, // y replaced in evaluatePreviewMotionAtT()
        orientation: { x: 0, y: 0, z: 0, w: 1 },
    }}; // mocks XRViewerPose. ideally would use `new XRViewerPose()`, but that's an illegal constructor
    static DEFAULT_LEFT_HAND_POSE = {transform: {
        position: { x: -0.2, y: 0, z: -0.2 }, // y replaced in evaluatePreviewMotionAtT()
        orientation: { x: 0, y: 0, z: 0, w: 1 },
    }};  // mocks XRPose. ideally would use `new XRPose()`, but that's an illegal constructor
    static DEFAULT_RIGHT_HAND_POSE = {transform: {
        position: { x: 0.2, y: 0, z: -0.2 },
        orientation: { x: 0, y: 0, z: 0, w: 1 },
    }};
    static DEFAULT_THUMBSTICK = [0, 0, 0, 0];  // mocks inputSource.gamepad.axes

    static MAX_HISTORY = 5;

    static APPROX_EYE_LEVEL_STANDING = 1.6; // meters
    static APPROX_EYE_LEVEL_SITTING = 0.9; // meters
    
    static RIGHT = { x: 1, y: 0, z: 0 };
    static UP = { x: 0, y: 1, z: 0 };
    static FORWARD = { x: 0, y: 0, z: -1 };

    constructor() {
        this.head = null;                                     // will be populated with xrFrame.getViewerPose
        this.leftHand = BodyParams.DEFAULT_LEFT_HAND_POSE;    // will be populated with xrFrame.getPose
        this.rightHand = BodyParams.DEFAULT_RIGHT_HAND_POSE;  // will be populated with xrFrame.getPose
        this.leftThumbstick = BodyParams.DEFAULT_THUMBSTICK;  // will be populated with xrFrame.getPose
        this.rightThumbstick = BodyParams.DEFAULT_THUMBSTICK; // will be populated with xrFrame.getPose

        this.headHistory = [];
        this.leftHandHistory = [];
        this.rightHandHistory = [];
        // this.leftThumbstickHistory = [];
        // this.rightThumbstickHistory = [];

        // this.headRightInit = null;
        this.headUpInit = null;
        this.headForwardInit = null;
        this.leftHandInit = null;
        this.rightHandInit = null;
        this.headInit = null;

        this.leftHandRotation = null;
        this.rightHandRotation = null;
        this.headRotation = null;
        this.headRight = null;
        this.headUp = null;
        this.headForward = null;
        this.leftHandLinearAcceleration = null;
        this.rightHandLinearAcceleration = null;
        this.headLinearAcceleration = null;
        this.leftHandAngularVelocity = null;
        this.rightHandAngularVelocity = null;
        this.headAngularVelocity = null;
        this.leftHandAngularAcceleration = null;
        this.rightHandAngularAcceleration = null;
        this.headAngularAcceleration = null;

        this.shouldResetInits = false;
        this.haveLeftHand = false;
        this.haveRightHand = false;

        // for keeping track to only log failures once when they start
        this.didFail = {
            resetInits: false,
            left: { handPose: false, gamepadAxes: false },
            right: { handPose: false, gamepadAxes: false },
        }

        this.previewEyeLevel = null;
        this.deviceQuaternion = { x: 0, y: 0, z: 0, w: 1 };
        this.alphaShift = 0; // set in player.html event listeners
        this.screenOrientationType = ''; // set in PlayerManager.enableDeviceOrientation
    }

    tryResetInits() {
        if (this.haveLeftHand && this.haveRightHand) {
            // this.headRightInit = BodyParams.getDirectionFromRotation(BodyParams.RIGHT, this.head.transform);
            this.headUpInit = BodyParams.getDirectionFromRotation(BodyParams.UP, this.head.transform.orientation);
            this.headForwardInit = BodyParams.getDirectionFromRotation(BodyParams.FORWARD, this.head.transform.orientation);
            this.leftHandInit = {
                x: this.leftHand.transform.position.x,
                y: this.leftHand.transform.position.y,
                z: this.leftHand.transform.position.z,
            };
            this.rightHandInit = {
                x: this.rightHand.transform.position.x,
                y: this.rightHand.transform.position.y,
                z: this.rightHand.transform.position.z,
            };
            this.headInit = {
                x: this.head.transform.position.x,
                y: this.head.transform.position.y,
                z: this.head.transform.position.z,
            };

            this.shouldResetInits = false;
            this.haveLeftHand = false;
            this.haveRightHand = false;

            if (this.didFail.resetInits) {
                console.log('Got hands, inits reset.');
                this.didFail.resetInits = false;
            }
        } else if (!this.didFail.resetInits) {
            console.log("Can't reset inits yet because don't have hands. Will try again.");
            this.didFail.resetInits = true;
        }
    }

    updateHistory(elapsedTime) {
        // history for velocity and acceleration. note the WebXR spec supports controller linearVelocity and angularVelocity
        // (tho not acceleration), but few platforms implement them. TODO periodically check adoption
        if (this.head) this.headHistory.push({
            transform: BodyParams.cloneTransform(this.head.transform),
            time: elapsedTime,
        });
        if (this.leftHand) this.leftHandHistory.push({
            transform: BodyParams.cloneTransform(this.leftHand.transform),
            time: elapsedTime,
        });
        if (this.rightHand) this.rightHandHistory.push({
            transform: BodyParams.cloneTransform(this.rightHand.transform),
            time: elapsedTime,
        });

        if (this.headHistory.length > BodyParams.MAX_HISTORY) this.headHistory.shift();
        if (this.leftHandHistory.length > BodyParams.MAX_HISTORY) this.leftHandHistory.shift();
        if (this.rightHandHistory.length > BodyParams.MAX_HISTORY) this.rightHandHistory.shift();
    }

    resetHistory() {
        this.headHistory = [];
        this.leftHandHistory = [];
        this.rightHandHistory = [];
        // this.leftThumbstickHistory = [];
        // this.rightThumbstickHistory = [];
    }

    evaluatePreviewMotionAtT(previewMotion, elapsedTime, originLevel) {
        // originLevel is 'eye' or 'floor'

        switch (previewMotion) {
            case 'no_motion_standing': {
                this.previewEyeLevel = originLevel === 'floor' ? BodyParams.APPROX_EYE_LEVEL_STANDING : 0; // either 1.6 or 0.0
                const handsLevel = this.previewEyeLevel - 0.7; // either 0.9 or -0.7, respectively

                this.head = {transform: {
                    position: { x: 0, y: this.previewEyeLevel, z: 0 },
                    orientation: BodyParams.DEFAULT_HEAD_POSE.transform.orientation,
                }};
                this.leftHand = {transform: {
                    position: {
                        x: BodyParams.DEFAULT_LEFT_HAND_POSE.transform.position.x,
                        y: handsLevel,
                        z: BodyParams.DEFAULT_LEFT_HAND_POSE.transform.position.z,
                    },
                    orientation: BodyParams.DEFAULT_LEFT_HAND_POSE.transform.orientation,
                }};
                this.rightHand = {transform: {
                    position: {
                        x: BodyParams.DEFAULT_RIGHT_HAND_POSE.transform.position.x,
                        y: handsLevel,
                        z: BodyParams.DEFAULT_RIGHT_HAND_POSE.transform.position.z,
                    },
                    orientation: BodyParams.DEFAULT_RIGHT_HAND_POSE.transform.orientation,
                }};
                this.leftThumbstick = BodyParams.DEFAULT_THUMBSTICK;
                this.rightThumbstick = BodyParams.DEFAULT_THUMBSTICK;
                break;
            }
            
            case 'no_motion_sitting': {
                this.previewEyeLevel = originLevel === 'floor' ? BodyParams.APPROX_EYE_LEVEL_SITTING : 0; // either 0.9 or 0.0
                const handsLevel = this.previewEyeLevel - 0.4; // either 0.5 or -0.4, respectively

                this.head = {transform: {
                    position: { x: 0, y: this.previewEyeLevel, z: 0 },
                    orientation: BodyParams.DEFAULT_HEAD_POSE.transform.orientation,
                }};
                this.leftHand = {transform: {
                    position: {
                        x: BodyParams.DEFAULT_LEFT_HAND_POSE.transform.position.x,
                        y: handsLevel,
                        z: BodyParams.DEFAULT_LEFT_HAND_POSE.transform.position.z,
                    },
                    orientation: BodyParams.DEFAULT_LEFT_HAND_POSE.transform.orientation,
                }};
                this.rightHand = {transform: {
                    position: {
                        x: BodyParams.DEFAULT_RIGHT_HAND_POSE.transform.position.x,
                        y: handsLevel,
                        z: BodyParams.DEFAULT_RIGHT_HAND_POSE.transform.position.z,
                    },
                    orientation: BodyParams.DEFAULT_RIGHT_HAND_POSE.transform.orientation,
                }};
                this.leftThumbstick = BodyParams.DEFAULT_THUMBSTICK;
                this.rightThumbstick = BodyParams.DEFAULT_THUMBSTICK;
                break;
            }

            case 'basic_dance': {
                this.previewEyeLevel = originLevel === 'floor' ? BodyParams.APPROX_EYE_LEVEL_STANDING : 0; // either 1.6 or 0.0
                const handsLevel = this.previewEyeLevel - 0.7; // either 0.9 or -0.7, respectively

                const xRotation = Math.sin(elapsedTime) * 0.4;
                const yRotation = Math.cos(elapsedTime) * 0.4;
                const zRotation = 0.0;

                this.head = {transform: {
                    position: { x: 0, y: this.previewEyeLevel, z: 0 },
                    orientation: BodyParams.eulerAnglesToQuaternion(-xRotation, -yRotation, zRotation),
                }};
                this.leftHand = {transform: {
                    position: {
                        x: -Math.cos(2.0 * elapsedTime) * 0.4,
                        y: Math.cos(2.0 * elapsedTime) * 0.4 + handsLevel,
                        z: -Math.cos(2.0 * elapsedTime) * 0.4,
                    },
                    orientation: BodyParams.eulerAnglesToQuaternion(xRotation, yRotation, zRotation),
                }};
                this.rightHand = {transform: {
                    position: {
                        x: Math.sin(2.0 * elapsedTime) * 0.4,
                        y: Math.sin(2.0 * elapsedTime) * 0.4 + handsLevel,
                        z: -Math.sin(2.0 * elapsedTime) * 0.4,
                    },
                    orientation: BodyParams.eulerAnglesToQuaternion(xRotation, -yRotation, zRotation),
                }};
                this.leftThumbstick = BodyParams.DEFAULT_THUMBSTICK;
                this.rightThumbstick = BodyParams.DEFAULT_THUMBSTICK;
                break;
            }

            case 'reclined_breathing': {
                this.previewEyeLevel = originLevel === 'floor' ? BodyParams.APPROX_EYE_LEVEL_SITTING : 0; // either 0.9 or 0.0
                const handsLevel = this.previewEyeLevel - 0.4; // either 0.5 or -0.4, respectively

                const headRotationX = Math.PI / 3.0;
                const headRotationY = 0.0;
                const headRotationZ = 0.0;

                const handsRotationX = 0.0;
                const handsRotationY = Math.PI / 4.0;
                const handsRotationZ = Math.PI / 8.0;

                this.head = {transform: {
                    position: { x: 0, y: this.previewEyeLevel, z: 0 },
                    orientation: BodyParams.eulerAnglesToQuaternion(headRotationX, headRotationY, headRotationZ),
                }};
                this.leftHand = {transform: {
                    position: {
                        x: 0.0,
                        y: Math.cos(1.5 * elapsedTime) * 0.0013 + handsLevel,
                        z: BodyParams.DEFAULT_LEFT_HAND_POSE.transform.position.z,
                    },
                    orientation: BodyParams.eulerAnglesToQuaternion(handsRotationX, handsRotationY, handsRotationZ),
                }};
                this.rightHand = {transform: {
                    position: {
                        x: 0.0,
                        y: Math.cos(1.5 * elapsedTime) * 0.0013 + handsLevel,
                        z: BodyParams.DEFAULT_RIGHT_HAND_POSE.transform.position.z,
                    },
                    orientation: BodyParams.eulerAnglesToQuaternion(handsRotationX, -handsRotationY, -handsRotationZ),
                }};
                this.leftThumbstick = BodyParams.DEFAULT_THUMBSTICK;
                this.rightThumbstick = BodyParams.DEFAULT_THUMBSTICK;
                break;
            }

            // case 'macarena': {
            //     break;
            // }

            default:
                console.error(`Unrecognized motion: ${previewMotion}`);
        }

        if (this.shouldResetInits) {
            this.haveLeftHand = true;
            this.haveRightHand = true;
        }
    }

    makeViewMatrix(useDeviceOrientation) {
        let px, py, pz, qx, qy, qz, qw;

        if (useDeviceOrientation) {
            ({ x: px, y: py, z: pz } = {x: 0, y: this.previewEyeLevel, z: 0});
            ({ x: qx, y: qy, z: qz, w: qw } = this.deviceQuaternion);
        } else {
            ({ x: px, y: py, z: pz } = this.head.transform.position);
            ({ x: qx, y: qy, z: qz, w: qw } = this.head.transform.orientation);
        }
    
        // Inverse quaternion
        const ix = -qx, iy = -qy, iz = -qz, iw = qw;
    
        // Rotation matrix from inverse quaternion (column-major for WebGL)
        const xx = ix * ix, yy = iy * iy, zz = iz * iz;
        const xy = ix * iy, xz = ix * iz, yz = iy * iz;
        const wx = iw * ix, wy = iw * iy, wz = iw * iz;
    
        const rot = [
            1 - 2 * (yy + zz), 2 * (xy + wz),     2 * (xz - wy),     0,
            2 * (xy - wz),     1 - 2 * (xx + zz), 2 * (yz + wx),     0,
            2 * (xz + wy),     2 * (yz - wx),     1 - 2 * (xx + yy), 0,
            0,                 0,                 0,                 1,
        ];
    
        // Apply inverse rotation to -position
        const tx = -(rot[0] * px + rot[4] * py + rot[8] * pz);
        const ty = -(rot[1] * px + rot[5] * py + rot[9] * pz);
        const tz = -(rot[2] * px + rot[6] * py + rot[10] * pz);
    
        // Set translation (in column-major format)
        rot[12] = tx;
        rot[13] = ty;
        rot[14] = tz;
    
        return new Float32Array(rot);
    }

    updateHand(handedness, handPose, gamepadAxes) {
        if (handPose != null && gamepadAxes != null) {
            if (handedness === 'left') {
                this.leftHand = handPose;
                this.leftThumbstick = gamepadAxes;
                if (this.shouldResetInits) {
                    this.haveLeftHand = true;
                }
            } else if (handedness === 'right') {
                this.rightHand = handPose;
                this.rightThumbstick = gamepadAxes;
                if (this.shouldResetInits) {
                    this.haveRightHand = true;
                }
            }

            if (this.didFail[handedness].handPose) {
                console.log(`Got ${handedness} handPose.`);
                this.didFail[handedness].handPose = false;
            }
            if (this.didFail[handedness].gamepadAxes) {
                console.log(`Got ${handedness} gamepadAxes.`);
                this.didFail[handedness].gamepadAxes = false;
            }
        } else {
            if (!handPose && !this.didFail[handedness].handPose) {
                console.log(`${handedness} handPose is null.`);
                this.didFail[handedness].handPose = true;
            }
            if (!gamepadAxes && !this.didFail[handedness].gamepadAxes) {
                console.log(`${handedness} gamepadAxes is null.`);
                this.didFail[handedness].gamepadAxes = true;
            }
        }
    }

    evaluateBodyParam(paramName, elapsedTime) {
        // const elapsedTime = this.leftHandHistory.at(-1).time; // actually let's just pipe it in from ZoneParams

        let leftHandPosition = this.leftHand.transform.position;
        let rightHandPosition = this.rightHand.transform.position;
        let headPosition = this.head.transform.position;

        let leftHandRotation = this.leftHand.transform.orientation;
        let rightHandRotation = this.rightHand.transform.orientation;
        let headRotation = this.head.transform.orientation;

        let corePosition = null;
        let rRelativeL = null;
        
        // const leftHand0Ago = this.leftHandHistory.at(-1); // could use leftHand0Ago.time instead of elapsedTime
        const leftHand1Ago = this.leftHandHistory.at(-2);
        const leftHand2Ago = this.leftHandHistory.at(-3);
        // const rightHand0Ago = this.rightHandHistory.at(-1); // could use rightHand0Ago.time instead of elapsedTime
        const rightHand1Ago = this.rightHandHistory.at(-2);
        const rightHand2Ago = this.rightHandHistory.at(-3);
        // const head0Ago = this.headHistory.at(-1); // could use head0Ago.time instead of elapsedTime
        const head1Ago = this.headHistory.at(-2);
        const head2Ago = this.headHistory.at(-3);

        switch (paramName) {
            case 'leftHandPosition.x': return leftHandPosition.x;
            case 'leftHandPosition.y': return leftHandPosition.y;
            case 'leftHandPosition.z': return leftHandPosition.z;
            // case 'leftHandPosition.unity_z': return -leftHandPosition.z;
            case 'rightHandPosition.x': return rightHandPosition.x;
            case 'rightHandPosition.y': return rightHandPosition.y;
            case 'rightHandPosition.z': return rightHandPosition.z;
            // case 'rightHandPosition.unity_z': return -rightHandPosition.z;
            case 'headPosition.x': return headPosition.x;
            case 'headPosition.y': return headPosition.y;
            case 'headPosition.z': return headPosition.z;
            // case 'headPosition.unity_z': return -headPosition.z;
            
            // lines with `??=` represent caching that is reset in resetCachedParams()
            // allows eulerAngle rotations to be computed from quaternion once per frame and cached (until reset),
            // or other heavy computation
            case 'leftHandRotation.x':
                this.leftHandRotation ??= BodyParams.eulerAngles(leftHandRotation);
                return this.leftHandRotation.x;
            case 'leftHandRotation.y':
                this.leftHandRotation ??= BodyParams.eulerAngles(leftHandRotation);
                return this.leftHandRotation.y;
            case 'leftHandRotation.z':
                this.leftHandRotation ??= BodyParams.eulerAngles(leftHandRotation);
                return this.leftHandRotation.z;
            case 'rightHandRotation.x':
                this.rightHandRotation ??= BodyParams.eulerAngles(rightHandRotation);
                return this.rightHandRotation.x;
            case 'rightHandRotation.y':
                this.rightHandRotation ??= BodyParams.eulerAngles(rightHandRotation);
                return this.rightHandRotation.y;
            case 'rightHandRotation.z':
                this.rightHandRotation ??= BodyParams.eulerAngles(rightHandRotation);
                return this.rightHandRotation.z;
            case 'headRotation.x':
                this.headRotation ??= BodyParams.eulerAngles(headRotation);
                return this.headRotation.x;
            case 'headRotation.y':
                this.headRotation ??= BodyParams.eulerAngles(headRotation);
                return this.headRotation.y;
            case 'headRotation.z':
                this.headRotation ??= BodyParams.eulerAngles(headRotation);
                return this.headRotation.z;
            case 'headYaw':
                return BodyParams.yawFromQuatDegrees(headRotation);

            case 'leftHandLinearVelocity.x':
                if (!leftHand1Ago) return 0;
                return BodyParams.linearVelocity(leftHandPosition.x, leftHand1Ago.transform.position.x, elapsedTime, leftHand1Ago.time);
            case 'leftHandLinearVelocity.y':
                if (!leftHand1Ago) return 0;
                return BodyParams.linearVelocity(leftHandPosition.y, leftHand1Ago.transform.position.y, elapsedTime, leftHand1Ago.time);
            case 'leftHandLinearVelocity.z':
                if (!leftHand1Ago) return 0;
                return BodyParams.linearVelocity(leftHandPosition.z, leftHand1Ago.transform.position.z, elapsedTime, leftHand1Ago.time);
            case 'leftHandLinearSpeed':
                if (!leftHand1Ago) return 0;
                if (elapsedTime === leftHand1Ago.time) return 0;
                return BodyParams.distance(leftHandPosition, leftHand1Ago.transform.position) / (elapsedTime - leftHand1Ago.time);
            case 'rightHandLinearVelocity.x':
                if (!rightHand1Ago) return 0;
                return BodyParams.linearVelocity(rightHandPosition.x, rightHand1Ago.transform.position.x, elapsedTime, rightHand1Ago.time);
            case 'rightHandLinearVelocity.y':
                if (!rightHand1Ago) return 0;
                return BodyParams.linearVelocity(rightHandPosition.y, rightHand1Ago.transform.position.y, elapsedTime, rightHand1Ago.time);
            case 'rightHandLinearVelocity.z':
                if (!rightHand1Ago) return 0;
                return BodyParams.linearVelocity(rightHandPosition.z, rightHand1Ago.transform.position.z, elapsedTime, rightHand1Ago.time);
            case 'rightHandLinearSpeed':
                if (!rightHand1Ago) return 0;
                if (elapsedTime === rightHand1Ago.time) return 0;
                return BodyParams.distance(rightHandPosition, rightHand1Ago.transform.position) / (elapsedTime - rightHand1Ago.time);
            case 'headLinearVelocity.x':
                if (!head1Ago) return 0;
                return BodyParams.linearVelocity(headPosition.x, head1Ago.transform.position.x, elapsedTime, head1Ago.time);
            case 'headLinearVelocity.y':
                if (!head1Ago) return 0;
                return BodyParams.linearVelocity(headPosition.y, head1Ago.transform.position.y, elapsedTime, head1Ago.time);
            case 'headLinearVelocity.z':
                if (!head1Ago) return 0;
                return BodyParams.linearVelocity(headPosition.z, head1Ago.transform.position.z, elapsedTime, head1Ago.time);
            case 'headLinearSpeed':
                if (!head1Ago) return 0;
                if (elapsedTime === head1Ago.time) return 0;
                return BodyParams.distance(headPosition, head1Ago.transform.position) / (elapsedTime - head1Ago.time);

            case 'leftHandLinearAcceleration.x':
                if (!leftHand1Ago || !leftHand2Ago) return 0;
                return BodyParams.linearAcceleration(leftHandPosition.x, leftHand1Ago.transform.position.x, leftHand2Ago.transform.position.x, elapsedTime, leftHand1Ago.time, leftHand2Ago.time);
            case 'leftHandLinearAcceleration.y':
                if (!leftHand1Ago || !leftHand2Ago) return 0;
                return BodyParams.linearAcceleration(leftHandPosition.y, leftHand1Ago.transform.position.y, leftHand2Ago.transform.position.y, elapsedTime, leftHand1Ago.time, leftHand2Ago.time);
            case 'leftHandLinearAcceleration.z':
                if (!leftHand1Ago || !leftHand2Ago) return 0;
                return BodyParams.linearAcceleration(leftHandPosition.z, leftHand1Ago.transform.position.z, leftHand2Ago.transform.position.z, elapsedTime, leftHand1Ago.time, leftHand2Ago.time);
            case 'leftHandLinearAcceleration':
                if (!leftHand1Ago || !leftHand2Ago) return 0;
                 this.leftHandLinearAcceleration ??= Math.hypot(
                    BodyParams.linearAcceleration(leftHandPosition.x, leftHand1Ago.transform.position.x, leftHand2Ago.transform.position.x, elapsedTime, leftHand1Ago.time, leftHand2Ago.time),
                    BodyParams.linearAcceleration(leftHandPosition.y, leftHand1Ago.transform.position.y, leftHand2Ago.transform.position.y, elapsedTime, leftHand1Ago.time, leftHand2Ago.time),
                    BodyParams.linearAcceleration(leftHandPosition.z, leftHand1Ago.transform.position.z, leftHand2Ago.transform.position.z, elapsedTime, leftHand1Ago.time, leftHand2Ago.time)
                );
                return this.leftHandLinearAcceleration;
            case 'rightHandLinearAcceleration.x':
                if (!rightHand1Ago || !rightHand2Ago) return 0;
                return BodyParams.linearAcceleration(rightHandPosition.x, rightHand1Ago.transform.position.x, rightHand2Ago.transform.position.x, elapsedTime, rightHand1Ago.time, rightHand2Ago.time);
            case 'rightHandLinearAcceleration.y':
                if (!rightHand1Ago || !rightHand2Ago) return 0;
                return BodyParams.linearAcceleration(rightHandPosition.y, rightHand1Ago.transform.position.y, rightHand2Ago.transform.position.y, elapsedTime, rightHand1Ago.time, rightHand2Ago.time);
            case 'rightHandLinearAcceleration.z':
                if (!rightHand1Ago || !rightHand2Ago) return 0;
                return BodyParams.linearAcceleration(rightHandPosition.z, rightHand1Ago.transform.position.z, rightHand2Ago.transform.position.z, elapsedTime, rightHand1Ago.time, rightHand2Ago.time);
            case 'rightHandLinearAcceleration':
                if (!rightHand1Ago || !rightHand2Ago) return 0;
                this.rightHandLinearAcceleration ??= Math.hypot(
                    BodyParams.linearAcceleration(rightHandPosition.x, rightHand1Ago.transform.position.x, rightHand2Ago.transform.position.x, elapsedTime, rightHand1Ago.time, rightHand2Ago.time),
                    BodyParams.linearAcceleration(rightHandPosition.y, rightHand1Ago.transform.position.y, rightHand2Ago.transform.position.y, elapsedTime, rightHand1Ago.time, rightHand2Ago.time),
                    BodyParams.linearAcceleration(rightHandPosition.z, rightHand1Ago.transform.position.z, rightHand2Ago.transform.position.z, elapsedTime, rightHand1Ago.time, rightHand2Ago.time)
                );
                return this.rightHandLinearAcceleration;
            case 'headLinearAcceleration.x':
                if (!head1Ago || !head2Ago) return 0;
                return BodyParams.linearAcceleration(headPosition.x, head1Ago.transform.position.x, head2Ago.transform.position.x, elapsedTime, head1Ago.time, head2Ago.time);
            case 'headLinearAcceleration.y':
                if (!head1Ago || !head2Ago) return 0;
                return BodyParams.linearAcceleration(headPosition.y, head1Ago.transform.position.y, head2Ago.transform.position.y, elapsedTime, head1Ago.time, head2Ago.time);
            case 'headLinearAcceleration.z':
                if (!head1Ago || !head2Ago) return 0;
                return BodyParams.linearAcceleration(headPosition.z, head1Ago.transform.position.z, head2Ago.transform.position.z, elapsedTime, head1Ago.time, head2Ago.time);
            case 'headLinearAcceleration':
                if (!head1Ago || !head2Ago) return 0;
                this.headLinearAcceleration ??= Math.hypot(
                    BodyParams.linearAcceleration(headPosition.x, head1Ago.transform.position.x, head2Ago.transform.position.x, elapsedTime, head1Ago.time, head2Ago.time),
                    BodyParams.linearAcceleration(headPosition.y, head1Ago.transform.position.y, head2Ago.transform.position.y, elapsedTime, head1Ago.time, head2Ago.time),
                    BodyParams.linearAcceleration(headPosition.z, head1Ago.transform.position.z, head2Ago.transform.position.z, elapsedTime, head1Ago.time, head2Ago.time)
                );
                return this.headLinearAcceleration;

            case 'leftHandAngularVelocity.x':
                if (!leftHand1Ago) return 0;
                this.leftHandAngularVelocity ??= BodyParams.angularVelocityVector(
                    leftHandRotation, leftHand1Ago.transform.orientation, elapsedTime, leftHand1Ago.time);
                return this.leftHandAngularVelocity.x;
            case 'leftHandAngularVelocity.y':
                if (!leftHand1Ago) return 0;
                this.leftHandAngularVelocity ??= BodyParams.angularVelocityVector(
                    leftHandRotation, leftHand1Ago.transform.orientation, elapsedTime, leftHand1Ago.time);
                return this.leftHandAngularVelocity.y;
            case 'leftHandAngularVelocity.z':
                if (!leftHand1Ago) return 0;
                this.leftHandAngularVelocity ??= BodyParams.angularVelocityVector(
                    leftHandRotation, leftHand1Ago.transform.orientation, elapsedTime, leftHand1Ago.time);
                return this.leftHandAngularVelocity.z;
            case 'leftHandAngularSpeed':
                if (!leftHand1Ago) return 0;
                this.leftHandAngularVelocity ??= BodyParams.angularVelocityVector(
                    leftHandRotation, leftHand1Ago.transform.orientation, elapsedTime, leftHand1Ago.time);
                return Math.hypot(this.leftHandAngularVelocity.x, this.leftHandAngularVelocity.y, this.leftHandAngularVelocity.z);
            case 'rightHandAngularVelocity.x':
                if (!rightHand1Ago) return 0;
                this.rightHandAngularVelocity ??= BodyParams.angularVelocityVector(
                    rightHandRotation, rightHand1Ago.transform.orientation, elapsedTime, rightHand1Ago.time);
                return this.rightHandAngularVelocity.x;
            case 'rightHandAngularVelocity.y':
                if (!rightHand1Ago) return 0;
                this.rightHandAngularVelocity ??= BodyParams.angularVelocityVector(
                    rightHandRotation, rightHand1Ago.transform.orientation, elapsedTime, rightHand1Ago.time);
                return this.rightHandAngularVelocity.y;
            case 'rightHandAngularVelocity.z':
                if (!rightHand1Ago) return 0;
                this.rightHandAngularVelocity ??= BodyParams.angularVelocityVector(
                    rightHandRotation, rightHand1Ago.transform.orientation, elapsedTime, rightHand1Ago.time);
                return this.rightHandAngularVelocity.z;
            case 'rightHandAngularSpeed':
                if (!rightHand1Ago) return 0;
                this.rightHandAngularVelocity ??= BodyParams.angularVelocityVector(
                    rightHandRotation, rightHand1Ago.transform.orientation, elapsedTime, rightHand1Ago.time);
                return Math.hypot(this.rightHandAngularVelocity.x, this.rightHandAngularVelocity.y, this.rightHandAngularVelocity.z);
            case 'headAngularVelocity.x':
                if (!head1Ago) return 0;
                this.headAngularVelocity ??= BodyParams.angularVelocityVector(
                    headRotation, head1Ago.transform.orientation, elapsedTime, head1Ago.time);
                return this.headAngularVelocity.x;
            case 'headAngularVelocity.y':
                if (!head1Ago) return 0;
                this.headAngularVelocity ??= BodyParams.angularVelocityVector(
                    headRotation, head1Ago.transform.orientation, elapsedTime, head1Ago.time);
                return this.headAngularVelocity.y;
            case 'headAngularVelocity.z':
                if (!head1Ago) return 0;
                this.headAngularVelocity ??= BodyParams.angularVelocityVector(
                    headRotation, head1Ago.transform.orientation, elapsedTime, head1Ago.time);
                return this.headAngularVelocity.z;
            case 'headAngularSpeed':
                if (!head1Ago) return 0;
                this.headAngularVelocity ??= BodyParams.angularVelocityVector(
                    headRotation, head1Ago.transform.orientation, elapsedTime, head1Ago.time);
                return Math.hypot(this.headAngularVelocity.x, this.headAngularVelocity.y, this.headAngularVelocity.z);

            case 'leftHandAngularAcceleration.x':
                if (!leftHand1Ago || !leftHand2Ago) return 0;
                this.leftHandAngularAcceleration ??= BodyParams.angularAccelerationVector(
                    leftHandRotation, leftHand1Ago.transform.orientation, leftHand2Ago.transform.orientation, elapsedTime, leftHand1Ago.time, leftHand2Ago.time);
                return this.leftHandAngularAcceleration.x;
            case 'leftHandAngularAcceleration.y':
                if (!leftHand1Ago || !leftHand2Ago) return 0;
                this.leftHandAngularAcceleration ??= BodyParams.angularAccelerationVector(
                    leftHandRotation, leftHand1Ago.transform.orientation, leftHand2Ago.transform.orientation, elapsedTime, leftHand1Ago.time, leftHand2Ago.time);
                return this.leftHandAngularAcceleration.y;
            case 'leftHandAngularAcceleration.z':
                if (!leftHand1Ago || !leftHand2Ago) return 0;
                this.leftHandAngularAcceleration ??= BodyParams.angularAccelerationVector(
                    leftHandRotation, leftHand1Ago.transform.orientation, leftHand2Ago.transform.orientation, elapsedTime, leftHand1Ago.time, leftHand2Ago.time);
                return this.leftHandAngularAcceleration.z;
            case 'leftHandAngularAcceleration':
                if (!leftHand1Ago || !leftHand2Ago) return 0;
                this.leftHandAngularAcceleration ??= BodyParams.angularAccelerationVector(
                    leftHandRotation, leftHand1Ago.transform.orientation, leftHand2Ago.transform.orientation, elapsedTime, leftHand1Ago.time, leftHand2Ago.time);
                return Math.hypot(this.leftHandAngularAcceleration.x, this.leftHandAngularAcceleration.y, this.leftHandAngularAcceleration.z);
            case 'rightHandAngularAcceleration.x':
                if (!rightHand1Ago || !rightHand2Ago) return 0;
                this.rightHandAngularAcceleration ??= BodyParams.angularAccelerationVector(
                    rightHandRotation, rightHand1Ago.transform.orientation, rightHand2Ago.transform.orientation, elapsedTime, rightHand1Ago.time, rightHand2Ago.time);
                return this.rightHandAngularAcceleration.x;
            case 'rightHandAngularAcceleration.y':
                if (!rightHand1Ago || !rightHand2Ago) return 0;
                this.rightHandAngularAcceleration ??= BodyParams.angularAccelerationVector(
                    rightHandRotation, rightHand1Ago.transform.orientation, rightHand2Ago.transform.orientation, elapsedTime, rightHand1Ago.time, rightHand2Ago.time);
                return this.rightHandAngularAcceleration.y;
            case 'rightHandAngularAcceleration.z':
                if (!rightHand1Ago || !rightHand2Ago) return 0;
                this.rightHandAngularAcceleration ??= BodyParams.angularAccelerationVector(
                    rightHandRotation, rightHand1Ago.transform.orientation, rightHand2Ago.transform.orientation, elapsedTime, rightHand1Ago.time, rightHand2Ago.time);
                return this.rightHandAngularAcceleration.z;
            case 'rightHandAngularAcceleration':
                if (!rightHand1Ago || !rightHand2Ago) return 0;
                this.rightHandAngularAcceleration ??= BodyParams.angularAccelerationVector(
                    rightHandRotation, rightHand1Ago.transform.orientation, rightHand2Ago.transform.orientation, elapsedTime, rightHand1Ago.time, rightHand2Ago.time);
                return Math.hypot(this.rightHandAngularAcceleration.x, this.rightHandAngularAcceleration.y, this.rightHandAngularAcceleration.z);
            case 'headAngularAcceleration.x':
                if (!head1Ago || !head2Ago) return 0;
                this.headAngularAcceleration ??= BodyParams.angularAccelerationVector(
                    headRotation, head1Ago.transform.orientation, head2Ago.transform.orientation, elapsedTime, head1Ago.time, head2Ago.time);
                return this.headAngularAcceleration.x;
            case 'headAngularAcceleration.y':
                if (!head1Ago || !head2Ago) return 0;
                this.headAngularAcceleration ??= BodyParams.angularAccelerationVector(
                    headRotation, head1Ago.transform.orientation, head2Ago.transform.orientation, elapsedTime, head1Ago.time, head2Ago.time);
                return this.headAngularAcceleration.y;
            case 'headAngularAcceleration.z':
                if (!head1Ago || !head2Ago) return 0;
                this.headAngularAcceleration ??= BodyParams.angularAccelerationVector(
                    headRotation, head1Ago.transform.orientation, head2Ago.transform.orientation, elapsedTime, head1Ago.time, head2Ago.time);
                return this.headAngularAcceleration.z;
            case 'headAngularAcceleration':
                if (!head1Ago || !head2Ago) return 0;
                this.headAngularAcceleration ??= BodyParams.angularAccelerationVector(
                    headRotation, head1Ago.transform.orientation, head2Ago.transform.orientation, elapsedTime, head1Ago.time, head2Ago.time);
                return Math.hypot(this.headAngularAcceleration.x, this.headAngularAcceleration.y, this.headAngularAcceleration.z);
                
            case 'leftHandInit.x': return this.leftHandInit?.x ?? 0.0;
            case 'leftHandInit.y': return this.leftHandInit?.y ?? 0.0;
            case 'leftHandInit.z': return this.leftHandInit?.z ?? 0.0;
            case 'rightHandInit.x': return this.rightHandInit?.x ?? 0.0;
            case 'rightHandInit.y': return this.rightHandInit?.y ?? 0.0;
            case 'rightHandInit.z': return this.rightHandInit?.z ?? 0.0;
            case 'headInit.x': return this.headInit?.x ?? 0.0;
            case 'headInit.y': return this.headInit?.y ?? 0.0;
            case 'headInit.z': return this.headInit?.z ?? 0.0;
            
            case 'leftHandDelta.x': return this.leftHandInit ? leftHandPosition.x - this.leftHandInit.x : 0.0;
            case 'leftHandDelta.y': return this.leftHandInit ? leftHandPosition.y - this.leftHandInit.y : 0.0;
            case 'leftHandDelta.z': return this.leftHandInit ? leftHandPosition.z - this.leftHandInit.z : 0.0;
            case 'rightHandDelta.x': return this.rightHandInit ? rightHandPosition.x - this.rightHandInit.x : 0.0;
            case 'rightHandDelta.y': return this.rightHandInit ? rightHandPosition.y - this.rightHandInit.y : 0.0;
            case 'rightHandDelta.z': return this.rightHandInit ? rightHandPosition.z - this.rightHandInit.z : 0.0;
            case 'headDelta.x': return this.headInit ? headPosition.x - this.headInit.x : 0.0;
            case 'headDelta.y': return this.headInit ? headPosition.y - this.headInit.y : 0.0;
            case 'headDelta.z': return this.headInit ? headPosition.z - this.headInit.z : 0.0;

            case 'leftHandHeadDistance': return BodyParams.distance(leftHandPosition, headPosition);
            case 'rightHandHeadDistance': return BodyParams.distance(rightHandPosition, headPosition);

            case 'leftHandRestDistance':
                corePosition = { x: headPosition.x, y: headPosition.y - 0.55, z: headPosition.z };
                return Math.abs(BodyParams.distance(leftHandPosition, corePosition) - 0.15);
            case 'rightHandRestDistance':
                corePosition = { x: headPosition.x, y: headPosition.y - 0.55, z: headPosition.z };
                return Math.abs(BodyParams.distance(rightHandPosition, corePosition) - 0.15);
            case 'rlHandsDisplacement':
                rRelativeL = BodyParams.minus(rightHandPosition, leftHandPosition);
                this.headRight ??= BodyParams.getDirectionFromRotation(BodyParams.RIGHT, headRotation);
                return BodyParams.dot(rRelativeL, this.headRight);
            case 'udHandsDisplacement':
                rRelativeL = BodyParams.minus(rightHandPosition, leftHandPosition);
                this.headUp ??= BodyParams.getDirectionFromRotation(BodyParams.UP, headRotation);
                return BodyParams.dot(rRelativeL, this.headUp);
            case 'fbHandsDisplacement':
                rRelativeL = BodyParams.minus(rightHandPosition, leftHandPosition);
                this.headForward ??= BodyParams.getDirectionFromRotation(BodyParams.FORWARD, headRotation);
                return BodyParams.dot(rRelativeL, this.headForward);
            case 'gazeAltitude':
                this.headForward ??= BodyParams.getDirectionFromRotation(BodyParams.FORWARD, headRotation);
                return 90.0 - BodyParams.angle(BodyParams.UP, this.headForward);
            case 'relativeGazeAltitude':
                this.headForward ??= BodyParams.getDirectionFromRotation(BodyParams.FORWARD, headRotation);
                return 90.0 - BodyParams.angle(this.headUpInit, this.headForward);
            case 'relativeGazeDeviation':
                this.headForward ??= BodyParams.getDirectionFromRotation(BodyParams.FORWARD, headRotation);
                return BodyParams.angle(this.headForwardInit, this.headForward);
            
            case 'leftThumbstick.x': return this.leftThumbstick[2];
            case 'leftThumbstick.y': return this.leftThumbstick[3];
            case 'rightThumbstick.x': return this.rightThumbstick[2];
            case 'rightThumbstick.y': return this.rightThumbstick[3];

            default:
                console.error(`Unrecognized bodyParam: ${paramName}`);
        }
    }

    resetCachedParams() {
        this.leftHandRotation = null;
        this.rightHandRotation = null;
        this.headRotation = null;
        this.headRight = null;
        this.headUp = null;
        this.headForward = null;
        this.leftHandLinearAcceleration = null;
        this.rightHandLinearAcceleration = null;
        this.headLinearAcceleration = null;
        this.leftHandAngularVelocity = null;
        this.rightHandAngularVelocity = null;
        this.headAngularVelocity = null;
        this.leftHandAngularAcceleration = null;
        this.rightHandAngularAcceleration = null;
        this.headAngularAcceleration = null;
    }
    
    static getDirectionFromRotation(direction, quaternion) {
        const { x, y, z, w } = quaternion;

        // Quaternion-vector multiplication
        const uv = {
            x: 2 * (y * direction.z - z * direction.y),
            y: 2 * (z * direction.x - x * direction.z),
            z: 2 * (x * direction.y - y * direction.x),
        };

        const uuv = {
            x: 2 * (y * uv.z - z * uv.y),
            y: 2 * (z * uv.x - x * uv.z),
            z: 2 * (x * uv.y - y * uv.x),
        };

        // Final transformed vector
        return {
            x: direction.x + w * uv.x + uuv.x,
            y: direction.y + w * uv.y + uuv.y,
            z: direction.z + w * uv.z + uuv.z,
        };
    }
    
    static eulerAngles(quaternion) {
        const { x, y, z, w } = quaternion;
        const ysqr = y * y;

        const t0 = +2.0 * (w * x + y * z);
        const t1 = +1.0 - 2.0 * (x * x + ysqr);
        const roll = Math.atan2(t0, t1);

        let t2 = +2.0 * (w * y - z * x);
        t2 = Math.max(-1.0, Math.min(1.0, t2)); // Clamp t2 to [-1, 1]
        const pitch = Math.asin(t2);

        const t3 = +2.0 * (w * z + x * y);
        const t4 = +1.0 - 2.0 * (ysqr + z * z);
        const yaw = Math.atan2(t3, t4);

        const radToDeg = 180 / Math.PI;
        return {
            x: -roll * radToDeg,
            y: -yaw * radToDeg,
            z: pitch * radToDeg
        };
    }

    static yawFromQuatDegrees(quaternion) {
        const siny_cosp = 2 * (quaternion.w * quaternion.y + quaternion.x * quaternion.z);
        const cosy_cosp = 1 - 2 * (quaternion.y * quaternion.y + quaternion.z * quaternion.z);
        const yaw = Math.atan2(siny_cosp, cosy_cosp);
        return yaw * 180 / Math.PI; // negative would match Unity's handedness
    }

    static eulerAnglesToQuaternion(x, y, z) {
        const cx = Math.cos(x / 2);
        const sx = Math.sin(x / 2);
        const cy = Math.cos(y / 2);
        const sy = Math.sin(y / 2);
        const cz = Math.cos(z / 2);
        const sz = Math.sin(z / 2);

        const qx = sx * cy * cz - cx * sy * sz;
        const qy = cx * sy * cz + sx * cy * sz;
        const qz = cx * cy * sz - sx * sy * cz;
        const qw = cx * cy * cz + sx * sy * sz;

        const len = Math.hypot(qx, qy, qz, qw);

        return {
            x: qx / len,
            y: qy / len,
            z: qz / len,
            w: qw / len,
        };
    }

    static deviceOrientationToQuaternion(alpha, beta, gamma, alphaShift, screenOrientationType) {
        const DEG = Math.PI / 180;
        const a = (alpha + alphaShift) * DEG;
        const b = beta  * DEG;
        const g = gamma * DEG;

        const sa = Math.sin(a), ca = Math.cos(a);
        const sb = Math.sin(b), cb = Math.cos(b);
        const sg = Math.sin(g), cg = Math.cos(g);

        // R = Rz(a) * Rx(b) * Ry(g), then Rx(-90) world-up fix
        // Rx(-90): row0 unchanged, row1 = old row2, row2 = -old row1
        const [r00, r01, r02] = [ ca*cg - sa*sb*sg,   -sa*cb,   ca*sg + sa*sb*cg];
        const [r10, r11, r12] = [-cb*sg,               sb,      cb*cg           ];
        const [r20, r21, r22] = [-(sa*cg + ca*sb*sg), -ca*cb, -(sa*sg - ca*sb*cg)];

        // Matrix to quaternion (Shepperd's method)
        const trace = r00 + r11 + r22;
        let x, y, z, w;

        if (trace > 0) {
            const s = 0.5 / Math.sqrt(trace + 1.0);
            w = 0.25 / s;
            x = (r21 - r12) * s;
            y = (r02 - r20) * s;
            z = (r10 - r01) * s;
        } else if (r00 > r11 && r00 > r22) {
            const s = 2.0 * Math.sqrt(1.0 + r00 - r11 - r22);
            w = (r21 - r12) / s;
            x = 0.25 * s;
            y = (r01 + r10) / s;
            z = (r02 + r20) / s;
        } else if (r11 > r22) {
            const s = 2.0 * Math.sqrt(1.0 + r11 - r00 - r22);
            w = (r02 - r20) / s;
            x = (r01 + r10) / s;
            y = 0.25 * s;
            z = (r12 + r21) / s;
        } else {
            const s = 2.0 * Math.sqrt(1.0 + r22 - r00 - r11);
            w = (r10 - r01) / s;
            x = (r02 + r20) / s;
            y = (r12 + r21) / s;
            z = 0.25 * s;
        }

        if (screenOrientationType.startsWith('landscape')) {
            const S = Math.sqrt(2) / 2;
            const qz = screenOrientationType === 'landscape-primary' ? -S : S;
            const nx =  x*S + y*qz;
            const ny =  y*S - x*qz;
            const nz =  z*S + w*qz;
            const nw =  w*S - z*qz;
            x = nx; y = ny; z = nz; w = nw;
        }

        return { x, y, z, w };
    }

    static minus(vec1, vec2) {
        return {
            x: vec1.x - vec2.x,
            y: vec1.y - vec2.y,
            z: vec1.z - vec2.z,
        };
    }

    static distance(vec1, vec2) {
        return Math.hypot(vec1.x - vec2.x, vec1.y - vec2.y, vec1.z - vec2.z);
    }

    static angle(v1, v2) {
        const magV1 = Math.sqrt(v1.x ** 2 + v1.y ** 2 + v1.z ** 2);
        const magV2 = Math.sqrt(v2.x ** 2 + v2.y ** 2 + v2.z ** 2);
        const u1 = { x: v1.x / magV1, y: v1.y / magV1, z: v1.z / magV1 };
        const u2 = { x: v2.x / magV2, y: v2.y / magV2, z: v2.z / magV2 };

        const dot_ = BodyParams.dot(u1, u2);
        const clampedDot = Math.max(-1, Math.min(1, dot_));

        const angleRadians = Math.acos(clampedDot);
        return angleRadians * (180 / Math.PI);
    }

    static dot(v1, v2) {
        return v1.x * v2.x + v1.y * v2.y + v1.z * v2.z;
    }

    static cloneTransform(transform) {
        return {
            position:    { x: transform.position.x,    y: transform.position.y,    z: transform.position.z },
            orientation: { x: transform.orientation.x, y: transform.orientation.y, z: transform.orientation.z, w: transform.orientation.w },
        }
    }

    static linearVelocity(pos0, pos1, time0, time1) {
        const dt = time0 - time1;
        if (dt === 0) return 0;
        return (pos0 - pos1) / dt;
    }

    static linearAcceleration(pos0, pos1, pos2, time0, time1, time2) {
        const dt = (time0 - time2) / 2;
        if (dt === 0) return 0;
        const v0 = BodyParams.linearVelocity(pos0, pos1, time0, time1);
        const v1 = BodyParams.linearVelocity(pos1, pos2, time1, time2);
        return (v0 - v1) / dt;
    }

    static normalizeQuaternion(q) {
        const len = Math.hypot(q.x, q.y, q.z, q.w);
        if (len <= 0) return { x: 0, y: 0, z: 0, w: 1 };
        return { x: q.x / len, y: q.y / len, z: q.z / len, w: q.w / len };
    }

    static angularVelocityVector(q0, q1, time0, time1) {
        const dt = time0 - time1;
        if (dt === 0) return { x: 0, y: 0, z: 0 };

        q0 = BodyParams.normalizeQuaternion(q0);
        q1 = BodyParams.normalizeQuaternion(q1);

        let dq = { // q0 * conjugate of q1 (* = quaternion multiplication), in world-frame
            x: -q0.w*q1.x + q0.x*q1.w - q0.y*q1.z + q0.z*q1.y,
            y: -q0.w*q1.y + q0.x*q1.z + q0.y*q1.w - q0.z*q1.x,
            z: -q0.w*q1.z - q0.x*q1.y + q0.y*q1.x + q0.z*q1.w,
            w:  q0.w*q1.w + q0.x*q1.x + q0.y*q1.y + q0.z*q1.z,
        };

        if (dq.w < 0) {
            dq = { x: -dq.x, y: -dq.y, z: -dq.z, w: -dq.w };
        }

        const w = Math.max(-1, Math.min(1, dq.w));
        const angle = 2 * Math.acos(w);
        const s = Math.sqrt(Math.max(0, 1 - w * w));

        if (s < 1e-8 || angle < 1e-8) return { x: 0, y: 0, z: 0 };

        return {
            x: (dq.x / s) * angle / dt,
            y: (dq.y / s) * angle / dt,
            z: (dq.z / s) * angle / dt,
        };
    }

    static angularAccelerationVector(q0, q1, q2, time0, time1, time2) {
        const dt = (time0 - time2) / 2;
        if (dt === 0) return { x: 0, y: 0, z: 0 };

        const v0 = BodyParams.angularVelocityVector(q0, q1, time0, time1);
        const v1 = BodyParams.angularVelocityVector(q1, q2, time1, time2);

        return {
            x: (v0.x - v1.x) / dt,
            y: (v0.y - v1.y) / dt,
            z: (v0.z - v1.z) / dt,
        };
    }
}
