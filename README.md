# Setting up a Unity Project for Zone Trip

1. Install the most recent Unity 2022 LTS version from https://unity.com/releases/editor/archive on your computer
2. Create a "VR" project (have to download template, which comes with all dependencies) in Unity Hub and open it in the Unity Editor
3. Set `Edit > Project Settings > XR Plug-in Management > OpenXR > Render Mode` = Multi-pass
3. Install Unity Package Dependencies:
    a. OpenXR
    b. Shader Graph
    c. TextMeshPro
    d. Universal Render Pipeline (URP)
4. (some day: "Install Zone Trip SDK from the Unity store". meanwhile...)
    a. Copy `Package/Zone Trip Package[/|.meta]` to `YourUnityProject/Assets/Zone Trip Package[/|.meta]`
    b. Copy `Sample/Zone Trip[/|.meta]` to `YourUnityProject/Assets/Samples/Zone Trip[/|.meta]`
5. Open `Assets/Samples/Zone Trip/ExampleZone/ExampleZone.unity`, then do `File > Build Settings > Add open scenes`
6. Optional: Delete `Assets/Scenes`, `Assets/VRTemplateAssets`

# Creating Your First Zonetype or Shadertype

1. Create a new zonetype or new shadertype on zonetripvr.com (you probably already did this) to correspond with what you are creating on your computer
2. Modify the `ExampleZone` folder or the `ExampleShader` folder to your heart's content
    a. Change the path in `Zone Scene` in the Inspector for the ZoneLauncher scene when you rename `ExampleZone`
3. Do not modify anything else
4. When you modify `ExampleZone.cs/setZoneParams()`, modify `ExampleZone.json/params/` too
    a. You don't have to modify any code when you change `ExampleZone.json/shaders/#/`
    b. "Download root params json" on the zonetripvr.com page that you created (for zonetypes, paste into params/; for shadertypes, paste into shaders/#/)
5. Guidelines
    a. Do not interact with the Internet or try to pull or maintain any kind of state between plays of your zone or shader. Each play should be a self-contained event that is essentially identical everytime (except of course for bodyParams input)
    b. You can write code that attaches GameObjects within XRRig (e.g. to have things that move with your hands or head), but do not use code to modify any of the GameObjects themselves

# Finalizing Your Zonetype or Shader

1. Make sure the root params you can download from zonetripvr.com work with your final code draft
2. Make sure you can launch your zone or your shader through ZoneLauncher
3. Look at example_shadertype_upload.zip or example_zonetype_upload.zip to see what you should be uploading

# Gotchas

1. Your zonetypes and shadertypes, but your shadertypes in particular, may not work the same on all platforms
