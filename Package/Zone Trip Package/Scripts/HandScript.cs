// Copyright 2024 SensoriMotion

using UnityEngine;
using UnityEngine.InputSystem; // for InputActionReference
using UnityEngine.XR.Interaction.Toolkit.Interactors; // for XRRayInteractor

public class HandScript : MonoBehaviour {
    public GameObject capsule;
    public XRRayInteractor pointer;
    // Note: primaryButtonAction must be the same as XR Ray Interactor / UI Press Input
    public InputActionReference thumbstickAction, primaryButtonAction, menuButtonAction;

    public Vector2 thumbstickInput;
    public bool primaryPressed, primaryReleased, primaryWasPressed;
    public bool menuPressed, menuReleased, menuWasPressed;

    void OnEnable() {
        thumbstickAction.action.Enable();
        primaryButtonAction.action.Enable();
        menuButtonAction.action.Enable();
    }

    void OnDisable() {
        thumbstickAction.action.Disable();
        primaryButtonAction.action.Disable();
        menuButtonAction.action.Disable();
    }

    void Update() {
        thumbstickInput = thumbstickAction.action.ReadValue<Vector2>();
        primaryPressed = primaryButtonAction.action.IsPressed();
        menuPressed = menuButtonAction.action.IsPressed();

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
