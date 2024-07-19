// Copyright 2024 SensoriMotion

using UnityEngine;
using UnityEngine.XR; // for CommonUsages
using UnityEngine.XR.Interaction.Toolkit;

public class HandScript : MonoBehaviour {
    public XRController handController;
    public GameObject capsule;
    public XRRayInteractor pointer;

    public Vector2 thumbstickInput;
    public bool primaryPressed, primaryReleased, primaryWasPressed;
    public bool menuPressed, menuReleased, menuWasPressed;

    void Update() {
        handController.inputDevice.TryGetFeatureValue(CommonUsages.primary2DAxis, out thumbstickInput);
        handController.inputDevice.TryGetFeatureValue(CommonUsages.primaryButton, out primaryPressed);
        handController.inputDevice.TryGetFeatureValue(CommonUsages.menuButton, out menuPressed);

        primaryReleased = primaryWasPressed && !primaryPressed;
        primaryWasPressed = primaryPressed;

        menuReleased = menuWasPressed && !menuPressed;
        menuWasPressed = menuPressed;
    }

    public void set_active(bool isActive) {
        capsule.SetActive(isActive);
        pointer.enabled = isActive;
    }
}
