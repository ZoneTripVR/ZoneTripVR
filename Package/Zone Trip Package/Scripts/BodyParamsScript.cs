// Copyright 2024 SensoriMotion

using UnityEngine;

public class BodyParamsScript : MonoBehaviour {
    // Input parameters
    public GameObject head, leftHand, rightHand;

    // Output parameters
    public Vector3 leftHandPosition, rightHandPosition, headPosition;
    public Quaternion leftHandRotation, rightHandRotation, headRotation;
    public Vector3 leftHandDelta, rightHandDelta, headDelta;

    public Vector3 r_relative_l; //, l_relative_r, l_relative_h, r_relative_h;
    public Vector3 corePosition;
    public float leftHandRestDistance, rightHandRestDistance;
    public float average_y;
    public float gazeAltitude, relativeGazeAltitude;
    float rlHandsDisplacement, udHandsDisplacement, fbHandsDisplacement;

    private Vector3 headUpInit = Vector3.up;
    private Vector3 leftHandInit = Vector3.zero;
    private Vector3 rightHandInit = Vector3.zero;
    private Vector3 headInit = Vector3.zero;

    private Vector2 leftThumbstick, rightThumbstick;

    void Update() { // this evaluates for all bodyParams, even ones that aren't being used // TODO optimize
        if (headUpInit.y == 1) headUpInit = head.transform.up; // == 1 for a few frames
        if (leftHandInit.x == 0) leftHandInit = leftHand.transform.position; // == 0 for a few frames, etc
        if (rightHandInit.x == 0) rightHandInit = rightHand.transform.position;
        if (headInit.x == 0) headInit = head.transform.position;

        leftHandPosition = leftHand.transform.position;
        rightHandPosition = rightHand.transform.position;
        headPosition = head.transform.position;
        leftHandRotation = leftHand.transform.rotation;
        rightHandRotation = rightHand.transform.rotation;
        headRotation = head.transform.rotation;
        leftHandDelta = leftHandPosition - leftHandInit;
        rightHandDelta = rightHandPosition - rightHandInit;
        headDelta = headPosition - headInit;

        // l_relative_r = (leftHandPosition - rightHandPosition);
        r_relative_l = (rightHandPosition - leftHandPosition);
        // l_relative_h = (leftHandPosition - headPosition);
        // r_relative_h = (rightHandPosition - headPosition);
        corePosition = head.transform.position - new Vector3(0f, .55f, 0f);
        leftHandRestDistance = Mathf.Abs((leftHandPosition - corePosition).magnitude - 0.15f);
        rightHandRestDistance = Mathf.Abs((rightHandPosition - corePosition).magnitude - 0.15f);
        average_y = (leftHandPosition.y + rightHandPosition.y) / 2;
        gazeAltitude = 90.0f - Vector3.Angle(Vector3.up, head.transform.forward); // 90 when looking up, -90 when looking down
        relativeGazeAltitude = 90.0f - Vector3.Angle(headUpInit, head.transform.forward);

        leftThumbstick = leftHand.GetComponent<HandScript>().thumbstickInput;
        rightThumbstick = rightHand.GetComponent<HandScript>().thumbstickInput;

        rlHandsDisplacement = Vector3.Dot(r_relative_l, head.transform.right);
        udHandsDisplacement = Vector3.Dot(r_relative_l, head.transform.up);
        fbHandsDisplacement = Vector3.Dot(r_relative_l, head.transform.forward);
    }

    public double getBodyParamByName(string body_param_name) {
        switch (body_param_name) {
            case "leftHandPosition.x": return leftHandPosition.x;
            case "leftHandPosition.y": return leftHandPosition.y;
            case "leftHandPosition.z": return leftHandPosition.z;
            case "rightHandPosition.x": return rightHandPosition.x;
            case "rightHandPosition.y": return rightHandPosition.y;
            case "rightHandPosition.z": return rightHandPosition.z;
            case "headPosition.x": return headPosition.x;
            case "headPosition.y": return headPosition.y;
            case "headPosition.z": return headPosition.z;

            case "leftHandRotation.x": return leftHandRotation.eulerAngles.x;
            case "leftHandRotation.y": return leftHandRotation.eulerAngles.y;
            case "leftHandRotation.z": return leftHandRotation.eulerAngles.z;
            case "rightHandRotation.x": return rightHandRotation.eulerAngles.x;
            case "rightHandRotation.y": return rightHandRotation.eulerAngles.y;
            case "rightHandRotation.z": return rightHandRotation.eulerAngles.z;
            case "headRotation.x": return headRotation.eulerAngles.x;
            case "headRotation.y": return headRotation.eulerAngles.y;
            case "headRotation.z": return headRotation.eulerAngles.z;

            case "leftHandInit.x": return leftHandInit.x;
            case "leftHandInit.y": return leftHandInit.y;
            case "leftHandInit.z": return leftHandInit.z;
            case "rightHandInit.x": return rightHandInit.x;
            case "rightHandInit.y": return rightHandInit.y;
            case "rightHandInit.z": return rightHandInit.z;
            case "headInit.x": return headInit.x;
            case "headInit.y": return headInit.y;
            case "headInit.z": return headInit.z;
            
            case "leftHandDelta.x": return leftHandDelta.x;
            case "leftHandDelta.y": return leftHandDelta.y;
            case "leftHandDelta.z": return leftHandDelta.z;
            case "rightHandDelta.x": return rightHandDelta.x;
            case "rightHandDelta.y": return rightHandDelta.y;
            case "rightHandDelta.z": return rightHandDelta.z;
            case "headDelta.x": return headDelta.x;
            case "headDelta.y": return headDelta.y;
            case "headDelta.z": return headDelta.z;

            case "leftHandRestDistance": return leftHandRestDistance;
            case "rightHandRestDistance": return rightHandRestDistance;
            case "gazeAltitude": return gazeAltitude;
            case "relativeGazeAltitude": return relativeGazeAltitude;
            case "leftThumbstick.x": return leftThumbstick.x;
            case "leftThumbstick.y": return leftThumbstick.y;
            case "rightThumbstick.x": return rightThumbstick.x;
            case "rightThumbstick.y": return rightThumbstick.y;
            case "rlHandsDisplacement": return rlHandsDisplacement;
            case "udHandsDisplacement": return udHandsDisplacement;
            case "fbHandsDisplacement": return fbHandsDisplacement;
            
            default:
                Debug.LogError("unrecognized body param");
                return 0.0;
        }
    }
}
