
// Copyright SensoriMotion

class BodyParams {
    static RIGHT = { x: 1, y: 0, z: 0 };
    static UP = { x: 0, y: 1, z: 0 };
    static FORWARD = { x: 0, y: 0, z: -1 };

    constructor(bodyPose) {
        // this.headRightInit = BodyParams.getDirectionFromTransform(BodyParams.RIGHT, bodyPose.head.transform);
        this.headUpInit = BodyParams.getDirectionFromTransform(BodyParams.UP, bodyPose.head.transform);
        this.headForwardInit = BodyParams.getDirectionFromTransform(BodyParams.FORWARD, bodyPose.head.transform);
        this.leftHandInit = {
            x: bodyPose.leftHand.transform.position.x,
            y: bodyPose.leftHand.transform.position.y,
            z: bodyPose.leftHand.transform.position.z,
        };
        this.rightHandInit = {
            x: bodyPose.rightHand.transform.position.x,
            y: bodyPose.rightHand.transform.position.y,
            z: bodyPose.rightHand.transform.position.z,
        };
        this.headInit = {
            x: bodyPose.head.transform.position.x,
            y: bodyPose.head.transform.position.y,
            z: bodyPose.head.transform.position.z,
        };

        this.leftHandRotation = null;
        this.rightHandRotation = null;
        this.headRotation = null;
    }

    evaluateBodyParam(paramName, bodyPose) {
        let leftHandPosition = bodyPose.leftHand.transform.position;
        let rightHandPosition = bodyPose.rightHand.transform.position;
        let headPosition = bodyPose.head.transform.position;

        let corePosition = null;
        let rRelativeL = null;
        let headRight = null;
        let headUp = null;
        let headForward = null;

        let bodyParam = null;

        switch (paramName) {
            case 'leftHandPosition.x': bodyParam = leftHandPosition.x; break;
            case 'leftHandPosition.y': bodyParam = leftHandPosition.y; break;
            case 'leftHandPosition.z': bodyParam = leftHandPosition.z; break;
            case 'rightHandPosition.x': bodyParam = rightHandPosition.x; break;
            case 'rightHandPosition.y': bodyParam = rightHandPosition.y; break;
            case 'rightHandPosition.z': bodyParam = rightHandPosition.z; break;
            case 'headPosition.x': bodyParam = headPosition.x; break;
            case 'headPosition.y': bodyParam = headPosition.y; break;
            case 'headPosition.z': bodyParam = headPosition.z; break;
            
            // this.*Rotation reset in frameReset()
            case 'leftHandRotation.x':
                this.leftHandRotation = this.leftHandRotation || BodyParams.eulerAngles(bodyPose.leftHand.transform.orientation);
                bodyParam = this.leftHandRotation.x; break;
            case 'leftHandRotation.y':
                this.leftHandRotation = this.leftHandRotation || BodyParams.eulerAngles(bodyPose.leftHand.transform.orientation);
                bodyParam = this.leftHandRotation.y; break;
            case 'leftHandRotation.z':
                this.leftHandRotation = this.leftHandRotation || BodyParams.eulerAngles(bodyPose.leftHand.transform.orientation);
                bodyParam = this.leftHandRotation.z; break;
            case 'rightHandRotation.x':
                this.rightHandRotation = this.rightHandRotation || BodyParams.eulerAngles(bodyPose.rightHand.transform.orientation);
                bodyParam = this.rightHandRotation.x; break;
            case 'rightHandRotation.y':
                this.rightHandRotation = this.rightHandRotation || BodyParams.eulerAngles(bodyPose.rightHand.transform.orientation);
                bodyParam = this.rightHandRotation.y; break;
            case 'rightHandRotation.z':
                this.rightHandRotation = this.rightHandRotation || BodyParams.eulerAngles(bodyPose.rightHand.transform.orientation);
                bodyParam = this.rightHandRotation.z; break;
            case 'headRotation.x':
                this.headRotation = this.headRotation || BodyParams.eulerAngles(bodyPose.head.transform.orientation);
                bodyParam = this.headRotation.x; break;
            case 'headRotation.y':
                this.headRotation = this.headRotation || BodyParams.eulerAngles(bodyPose.head.transform.orientation);
                bodyParam = this.headRotation.y; break;
            case 'headRotation.z':
                this.headRotation = this.headRotation || BodyParams.eulerAngles(bodyPose.head.transform.orientation);
                bodyParam = this.headRotation.z; break;
            case 'headYaw':
                bodyParam = BodyParams.yawFromQuatDegrees(bodyPose.head.transform.orientation); break;
                
            case 'leftHandInit.x': bodyParam = this.leftHandInit?.x ?? 0.0; break;
            case 'leftHandInit.y': bodyParam = this.leftHandInit?.y ?? 0.0; break;
            case 'leftHandInit.z': bodyParam = this.leftHandInit?.z ?? 0.0; break;
            case 'rightHandInit.x': bodyParam = this.rightHandInit?.x ?? 0.0; break;
            case 'rightHandInit.y': bodyParam = this.rightHandInit?.y ?? 0.0; break;
            case 'rightHandInit.z': bodyParam = this.rightHandInit?.z ?? 0.0; break;
            case 'headInit.x': bodyParam = this.headInit?.x ?? 0.0; break;
            case 'headInit.y': bodyParam = this.headInit?.y ?? 0.0; break;
            case 'headInit.z': bodyParam = this.headInit?.z ?? 0.0; break;
            
            case 'leftHandDelta.x': bodyParam = this.leftHandInit ? leftHandPosition.x - this.leftHandInit.x : 0.0; break;
            case 'leftHandDelta.y': bodyParam = this.leftHandInit ? leftHandPosition.y - this.leftHandInit.y : 0.0; break;
            case 'leftHandDelta.z': bodyParam = this.leftHandInit ? leftHandPosition.z - this.leftHandInit.z : 0.0; break;
            case 'rightHandDelta.x': bodyParam = this.rightHandInit ? rightHandPosition.x - this.rightHandInit.x : 0.0; break;
            case 'rightHandDelta.y': bodyParam = this.rightHandInit ? rightHandPosition.y - this.rightHandInit.y : 0.0; break;
            case 'rightHandDelta.z': bodyParam = this.rightHandInit ? rightHandPosition.z - this.rightHandInit.z : 0.0; break;
            case 'headDelta.x': bodyParam = this.headInit ? headPosition.x - this.headInit.x : 0.0; break;
            case 'headDelta.y': bodyParam = this.headInit ? headPosition.y - this.headInit.y : 0.0; break;
            case 'headDelta.z': bodyParam = this.headInit ? headPosition.z - this.headInit.z : 0.0; break;

            case 'leftHandRestDistance':
                corePosition = {
                    x: bodyPose.head.transform.position.x,
                    y: bodyPose.head.transform.position.y - 0.55,
                    z: bodyPose.head.transform.position.z
                };
                bodyParam = Math.abs(BodyParams.distance(leftHandPosition, corePosition) - 0.15); break;
            case 'rightHandRestDistance':
                corePosition = {
                    x: bodyPose.head.transform.position.x,
                    y: bodyPose.head.transform.position.y - 0.55,
                    z: bodyPose.head.transform.position.z
                };
                bodyParam = Math.abs(BodyParams.distance(rightHandPosition, corePosition) - 0.15); break;
            case 'rlHandsDisplacement':
                rRelativeL = BodyParams.minus(rightHandPosition, leftHandPosition);
                headRight = BodyParams.getDirectionFromTransform(BodyParams.RIGHT, bodyPose.head.transform);
                bodyParam = BodyParams.dot(rRelativeL, headRight); break;
            case 'udHandsDisplacement':
                rRelativeL = BodyParams.minus(rightHandPosition, leftHandPosition);
                headUp = BodyParams.getDirectionFromTransform(BodyParams.UP, bodyPose.head.transform);
                bodyParam = BodyParams.dot(rRelativeL, headUp); break;
            case 'fbHandsDisplacement':
                rRelativeL = BodyParams.minus(rightHandPosition, leftHandPosition);
                headForward = BodyParams.getDirectionFromTransform(BodyParams.FORWARD, bodyPose.head.transform);
                bodyParam = BodyParams.dot(rRelativeL, headForward); break;
            case 'gazeAltitude':
                headForward = BodyParams.getDirectionFromTransform(BodyParams.FORWARD, bodyPose.head.transform);
                bodyParam = 90.0 - BodyParams.angle(BodyParams.UP, headForward); break;
            case 'relativeGazeAltitude':
                headForward = BodyParams.getDirectionFromTransform(BodyParams.FORWARD, bodyPose.head.transform);
                bodyParam = 90.0 - BodyParams.angle(this.headUpInit, headForward); break;
            case 'relativeGazeDeviation':
                headForward = BodyParams.getDirectionFromTransform(BodyParams.FORWARD, bodyPose.head.transform);
                bodyParam = BodyParams.angle(this.headForwardInit, headForward); break;
            
            case 'leftThumbstick.x': bodyParam = bodyPose.leftThumbstick[2]; break;
            case 'leftThumbstick.y': bodyParam = bodyPose.leftThumbstick[3]; break;
            case 'rightThumbstick.x': bodyParam = bodyPose.rightThumbstick[2]; break;
            case 'rightThumbstick.y': bodyParam = bodyPose.rightThumbstick[3]; break;

            default:
                console.error(`Unrecognized bodyParam: ${paramName}`);
        }
        return bodyParam;
    }

    frameReset() {
        this.leftHandRotation = null;
        this.rightHandRotation = null;
        this.headRotation = null;
    }
    
    static getDirectionFromTransform(direction, transform) {
        const { x, y, z, w } = transform.orientation;

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

    static minus(vec1, vec2) {
        return {
            x: vec1.x - vec2.x,
            y: vec1.y - vec2.y,
            z: vec1.z - vec2.z,
        }
    }

    static distance(vec1, vec2) {
        return Math.sqrt(
            Math.pow(vec1.x - vec2.x, 2) +
            Math.pow(vec1.y - vec2.y, 2) +
            Math.pow(vec1.z - vec2.z, 2)
        );
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
}
