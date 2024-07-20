# Setting up a Unity Project for Zone Trip

1. Install Unity Hub https://unity.com/download on your computer
2. Install Unity Editor 2022 LTS (as of writing, version 2022.3.38f) through Unity Hub
3. Download the VR Core project template through Unity Hub (also downloads dependencies e.g.: OpenXR, Shader Graph, Universal Render Pipeline)
    1. If you've already installed to here previously, you may need to Update the VR Core project template
2. Create a VR Core project in Unity Hub and open it in the Unity Editor
    1. Deselect "Connect to Unity Cloud" and "Use Unity Version Control" unless you have reasons not to
3. Set `Edit > Project Settings > XR Plug-in Management > OpenXR > Render Mode` = Multi-pass
4. (some day: "Install Zone Trip SDK from the Unity store". meanwhile...)
    1. Copy `Package/Zone Trip Package[/|.meta]` to `YourUnityProject/Assets/Zone Trip Package[/|.meta]` (yes `Assets`, not `Packages`)
    2. Copy `Sample/Zone Trip[/|.meta]` to `YourUnityProject/Assets/Samples/Zone Trip[/|.meta]`
5. Open `Assets/Samples/Zone Trip/ExampleZone/ExampleZone.unity`, then do `File > Build Settings > Add open scenes`
6. Optional: Delete `Assets/Scenes`, `Assets/VRTemplateAssets`

# Creating Your First Zonetype or Shadertype

1. Create a new zonetype or new shadertype on https://zonetripvr.com (you probably already did this) to correspond with what you are creating on your computer
2. Modify the `ExampleZone` folder or the `ExampleShader` folder to your heart's content
    1. Change the path in `Zone Scene` in the Inspector for the ZoneLauncher scene when you rename `ExampleZone`
3. Do not modify anything else
4. When you modify `ExampleZone.cs/setZoneParams()`, modify `ExampleZone.json/params/` too
    1. You don't have to modify any code when you modify `ExampleZone.json/shaders/#/`
    2. "Download root params json" on the zonetripvr.com page that you created (for zonetypes, paste into `params/`; for shadertypes, paste into `shaders/#/`)
5. Guidelines
    1. Do not interact with the Internet or try to pull or maintain any kind of state between plays of your zone or shader. Each play should be a self-contained event that is essentially identical everytime (except of course for bodyParams input)
    2. You can write code that attaches GameObjects within XRRig (e.g. to have things that move with your hands or head), but do not use code to modify any of the GameObjects themselves
    3. All the assets for one zonetype or for one shadertype must be under 2MB, before compressing. Use generativity! And parameterize it!

# Finalizing Your Zonetype or Shader

1. Make sure the root params you can download from zonetripvr.com work with your final code draft
2. Make sure you can launch your zone or your shader through ZoneLauncher
3. Create a cover image, preferably a good screenshot, but it can be anything that captures the vibe
4. Look at example_shadertype_upload.zip or example_zonetype_upload.zip to see what you should be uploading

# Gotchas

1. Your zonetypes and shadertypes, but your shadertypes in particular, may not work the same on all platforms
