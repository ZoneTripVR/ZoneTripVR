# Setting up a Unity Project for Zone Trip

1. Install Unity Hub https://unity.com/download on your computer
1. Install Unity Editor 2022 LTS (as of writing, version 2022.3.38f) through Unity Hub
1. Download the VR Core project template through Unity Hub (also downloads dependencies e.g.: OpenXR, Shader Graph, Universal Render Pipeline)
    1. If you've already installed to here previously, you may need to Update the VR Core project template
1. Create a VR Core project in Unity Hub and open it in the Unity Editor
    1. Deselect "Connect to Unity Cloud" and "Use Unity Version Control" unless you have reasons not to
1. (some day: "Install Zone Trip SDK from the Unity store". meanwhile...)
    1. Copy `Package/Zone Trip Package/` and its `.meta` to `YourUnityProject/Assets/Zone Trip Package/` and its `.meta` (yes `Assets` folder, not `Packages` folder)
    1. Copy `Sample/Zone Trip/` and its `.meta` to `YourUnityProject/Assets/Samples/Zone Trip/` and its `.meta`
1. Open `Assets/Samples/Zone Trip/ExampleZone/ExampleZone.unity`, then do `File > Build Settings > Add open scenes`
1. Open `Assets/Samples/Zone Trip/ZoneLauncher.unity`, then do `File > Build Settings > Add open scenes`
1. Optional: Delete `Scenes/SampleScene` from `File > Build Settings > Scenes in Build` and then also the folders `Assets/Scenes`, `Assets/VRTemplateAssets`
1. Set up your PCVR device as the OpenXR runtime (e.g. https://steamcommunity.com/sharedfiles/filedetails/?id=2791489010)
1. Open `Assets/Samples/Zone Trip/ZoneLauncher.unity` and click play to launch it in your PCVR device

# Creating Your First Zonetype or Shadertype

1. Create a new zonetype or new shadertype on https://zonetripvr.com (you probably already did this and that is why your are here) to correspond with what you are creating on your computer
1. Modify the `Assets/Samples/Zone Trip/ExampleZone` folder or the `Assets/Samples/Zone Trip/ExampleShader` folder to your heart's content
    1. Change the path in `Zone Scene` in the Inspector for the ZoneLauncher scene if/when you rename `ExampleZone`
    1. Follow the instructions in the code comments for modifying boilerplate zone code
1. Do not modify anything else
1. When you modify `ExampleZone.cs/setZoneParams()`, modify `ExampleZone.json/params/` too
    1. You don't have to modify any code when you modify `ExampleZone.json/shaders/*/`
    1. "Download root params json" on the zonetripvr.com page that you created (for zonetypes, paste into `params/`; for shadertypes, paste into `shaders/*/`)
1. Guidelines
    1. Do not interact with the Internet or try to pull or maintain any kind of state between plays of your zone or shader. Each play should be a self-contained event that is essentially identical everytime (except of course for bodyParams input).
    1. Do not modify EventSystem or XRInteractionManager
        1. If you really want to for some reason, email the contact email address
    1. You can write code that attaches GameObjects within XRRig (e.g. to have things that move with your hands or head), but do not use code to modify any of the GameObjects themselves, except for:
        1. The camera Skybox in Head
        1. If there is something else you want to modify, email the contact email address
    1. All the assets for one zonetype or for one shadertype must be under 2MB, before compressing. Use generativity! And parameterize it!

# Finalizing Your Zonetype or Shader

1. Make sure the root params you can download from zonetripvr.com work with your final code draft
1. Make sure the root params create an interesting experience that also performs with a good frame rate (you will receive feedback about this and have the opportunity to adjust after submission)
1. Make sure you can launch your zone or your shader through ZoneLauncher
1. Create a square cover image from 200x200px to 1000x1000px, preferably a good screenshot but it can be anything that captures the vibe and follows the content policy
1. Look at example_shadertype_upload.zip or example_zonetype_upload.zip to see the format of what you should be uploading

# Gotchas

1. Your zonetypes and shadertypes, but your shadertypes in particular, may not work exactly the same on all platforms
1. Your upload has to be very small. We may slightly increase the maximum size in the future, but never to many dozens and certainly not hundreds of megabytes. Leverage generativity to create interesting content, and leverage the zone/shader parameterization features to squeeze a lot possibility out of your generative code.
