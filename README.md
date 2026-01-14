This repo provides some infrastructure and workflows for generating a Zone Trip-compatible zonetype. A Zone Trip-compatible zonetype is a wasm file + wasm glue file pair that satisfies the init_zone() and render_zone() of Zone Trip's v1 API (or future APIs). You may generate that pair any way you want; you do not have to use this repo. This repo is for your convenience.

# Setting Up

1. Clone this repository (or a fork of it) to your computer
1. Install Docker (https://docs.docker.com/engine/install/)

# Creating Your New Zonetype

1. Create a new zonetype on https://zonetripvr.com (you probably already did this and that is why you are here) to correspond with what you are creating on your computer
1. After having cloned this repo to your computer, duplicate any folder in wasm_api_v1_webgl2/ (say, fractal_window)
    1. Optional but recommended: rename the duplicate folder to whatever_new_name (this new name is for your convenience and does not need to match what's on zonetripvr.com)
    1. Optional but recommended: replace all instances of the string or substring 'fractal_window' with 'whatever_new_name' in the whatever_new_name/docker-compose.yml (2x) and whatever_new_name/app/dist/index.html (1x) in the new folder
    1. Delete whatever_new_name/app/dist/wasm/\*.wasm and whatever_new_name/app/dist/wasm/\*.js
1. Modify lib.rs and and the .glsl shader files in whatever_new_name/app/src/ and (possibly) whatever_new_name/app/Cargo.toml and (probably not) whatever_new_name/app/.cargo/config.toml to implement your vision
    1. Your `ZoneParams` struct in lib.rs must follow the parameters you have added in your zonetype creation page on zonetripvr.com
        1. Click "Download the root zone's zone-params.js" on the zonetripvr.com page for the zonetype you are creating and save to whatever_new_name/app/dist/zone-params.js
        1. You can also edit zone-params.js manually
    1. Do not modify anything else
    1. Note you must respect the API for init_zone() and render_zone(), as these are called by Zone Trip with their respective arguments in their respective order
    1. Note it will very likely be relevant to add fields to or remove fields from the `Zone` struct in lib.rs as this is what carries data from init_zone to render_zone and between frames of render_zone
    1. You may add additional files, but your build must end up as exactly 1 .wasm file + 1 .js glue file
1. Guidelines
    1. Do not interact with the Internet in any way or try to pull or maintain any kind of state between plays of your zone. Each play should be a self-contained event that is essentially identical everytime (except of course for bodyParams input). Violations will be flagged in the post-submission review.
    1. Do not access powerful javascript objects like `window` or `document` in your wasm. Violations will be flagged in the post-submission review.
    1. If there is something else you want to modify, email the contact email address to make a feature request
    1. As much as possible, do not create brand new Vec's in each render_zone() call and instead re-use Vec's created in init_zone(). Also do not print to console in every render_zone(). These will substantially improve frame rate
    1. The .wasm must be under 500 kb and the .js wasm glue file under 100 kb. Use generativity! And parameterize it!

# Debugging Your New Zonetype (rust)

1. Open your terminal / command line application and cd to whatever_new_name/
1. Run `docker-compose up` (this runs off whatever_new_name/docker-compose.yml so inspect there if you want to know what it's doing), this will kick off rust compilation
    1. Compilation info and errors will appear here
1. Open Docker Desktop > wasm_whatever_new_name > Exec (this will open a bash environment)
    1. You can run `wasm-pack build --target web` here to re-compile (this is more convenient than `docker-compose down; docker-compose up`, which also re-compiles)
        1. Compilation info and errors will also appear here
    1. Note you will need to run `docker-compose down; docker-compose build --no-cache; docker-compose up` if you change whatever_new_name/app/Cargo.toml or whatever_new_name/app/.cargo/config.toml
1. Once compilation succeeds, a .wasm and a .js wasm glue file will appear in whatever_new_name/app/dist/wasm/. Note that once you are satisfied and ready to submit, these exact files will be what you upload on zonetripvr.com

# Debugging Your New Zonetype (glsl and javascript)

1. In your browser, go to http://localhost:8080 (the 8080 port is set up by whatever_new_name/docker-compose.yml)
1. Open the browser's javascript console pane (Ctrl-Shift-I on Google Chrome on Windows)
1. Click the first or second button in the top right of the page (not the console pane)
1. View any errors in the console pane. Errors at this point will typically be shader compilation errors or ZoneParams mismatch errors
    1. Uncomment the line `// std::panic::set_hook(Box::new(console_error_panic_hook::hook));` in lib.rs/init_zone() to get detailed shader compilation errors. Recomment it before finishing to reduce the size of your build.

# QAing Your New Zonetype in VR on Quest or another Android-based Headset with ADB

1. Turn on developer tools on your Quest (https://developers.meta.com/horizon/documentation/native/android/mobile-device-setup/, note this requires Meta developer access)
1. Install Android Platform Tools (includes Android Debug Bridge) (https://www.xda-developers.com/install-adb-windows-macos-linux/, note phone installation is not required)
1. Add the platform tools to your PATH or simply cd to the location of adb.exe
1. Connect your headset into your computer
1. Run `.\adb reverse tcp:8080 tcp:8080` (this links the localhost port 8080 on your computer to Quest)
1. Put your headset on and go to http://localhost:8080 in the Quest browser
1. On your computer again, open chrome://inspect/#devices in Google Chrome on Windows (or equivalent on another browser) and click the link for the tab you just opened in Quest above, which opens a debug window with a javascript console on your computer
1. Back in Quest, click the third or fourth button in the top right
1. See how your zonetype works in VR
1. See any errors in the console pane in the debug window on your computer

# QAing Your New Zonetype in VR on Quest with Meta Quest Link

1. Connect your Quest and turn on Meta Quest Link
1. In your browser on your computer, go to http://localhost:8080
1. Open the browser's javascript console pane (Ctrl-Shift-I on Google Chrome on Windows)
1. Click the third or fourth button in the top right of the page (not the console pane)
1. See how your zonetype works in VR
1. See any errors in the console pane

# Finalizing Your New Zonetype

1. Make sure your finalized root params you download from zonetripvr.com into zone-params.js work with your final code draft
1. Make sure your finalized root params create an interesting experience (i.e. no blank screens or similarly trivial graphical states) that also performs with a good frame rate (you will receive feedback about this and have the opportunity to adjust after submission)
1. Upload your .wasm file and .js file for your zonetype. Look at example_uploads/ for examples of what you should be uploading
1. Your uploads will undergo a technical and security review after submission (you will receive feedback about this and have the opportunity to adjust after submission)

# Gotchas

1. Your zonetypes may not work exactly the same on all platforms
1. Your upload has to be very small. We may slightly increase the maximum size in the future, but never to many dozens and certainly not hundreds of megabytes. Leverage generativity to create interesting content, and leverage the zone parameterization features to squeeze a lot possibility out of your generative code
1. If you capture timestamps directly in your rust code and use these to drive a behavior, the seek functions (fast-forward, pause, rewind, etc) won't work. Instead, make such a behavior a function of a ZoneParam field rather than of time, and pipe in time via your root zone's params (from the epoch_time independent variable), as the seek functions work off epoch_time
1. Similarly, if you code any behavior that evolves as a function of the last frame rather than as a function of a ZoneParam field, the seek functions won't work either. You may be able to re-write your code to make your behavior a function of a ZoneParam field rather than of the last frame. However, that may not be possible: this is known as computational irreducibility. If you can rewrite your behavior as a function of a ZoneParam field, please do so as that will support the seek functions. If, however, your behavior is computationally irreducible, that's fine and will not get in the way of any approvals, just note that seeking may produce unexpected results
1. If you must have behavior as a function of the last frame, be sure to gate it with the frame_number argument in init_zone and render_zone, because render_zone may be called multiple times per frame (e.g. to render to each eye or to the website canvas)
