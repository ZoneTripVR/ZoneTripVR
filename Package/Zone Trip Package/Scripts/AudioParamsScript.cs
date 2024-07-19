// Copyright 2024 SensoriMotion
// This is DEPRECATED. Do not use. Keeping it here in case of revival or as a reference.
// Internet audio streaming is on the roadmap. In the meantime, do not touch or try to implement anything with audio.
// Sorry for the inconvenience.
// Audio sometimes just stops working (gives very tiny numbers) and you have to restart the display.
// Made with help from https://www.youtube.com/watch?v=GHc9RF258VA

using UnityEngine;
using UnityEngine.Audio;


[RequireComponent(typeof(AudioSource))]
public class AudioParamsScript : MonoBehaviour { // TODO test with mp3
    // set in Inspector
    public AudioSource audioSource; // this's own
    public bool should_loop; // overrides AudioSource.loop, generally true
    public bool useMicrophone; // generally true
    public int micIndex; // generally 0
    public AudioClip clip; // overrides AudioSource.clip, does nothing if useMicrophone == true
    public AudioMixerGroup mixerGroupMicrophone, mixerGroupMaster;
    public FFTWindow fftwindow; // generally Rectangular
    // public int n_samples; // 8192; must be power of 2, do not change: see octave_cutoffs comment
    // public int n_octaves; // 10; do not change: see octave_cutoff TODO
    public int microphone_clip_length_seconds; // 600 seconds; will freeze for 2 seconds at this interval

    // observable in Inspector (but would be ignored and overriden if set there)
    public string micName; // public so you can see it in the Inspector, depends on micIndex
    public bool useAudio; // set in Zone generator script
    public int audioSampleRate;
    public bool clipError = false;

    public float latestVolume;
    private int sample_window_length;
    private int reasonable_frame_rate = 60;
    private float running_sum;
    // public float[] samples;
    // public float[] octaves;
    // private int[] octave_cutoffs = new int[11] {0, 1, 2, 4, 6, 8, 12, 16, 32, 48, 64}; // for n_samples = 128 or 256
    // private int[] octave_cutoffs = new int[11] {0, 2, 4, 6, 12, 23, 45, 90, 179, 358, 715}; // for n_samples = 2048
    // private int[] octave_cutoffs = new int[11] {0, 6, 12, 23, 45, 90, 179, 358, 715, 1429, 2858}; // for n_samples = 8192
    // TODO derive octave_cutoffs mathematically from AudioSettings.outputSampleRate and a note <-> frequency table
    // TODO make `float[] notes` with energy from each note from any octave

    void Start() {
        // samples = new float[n_samples];
        // octaves = new float[n_octaves];
        audioSampleRate = AudioSettings.outputSampleRate; // 44100 or 48000 usually
        sample_window_length = (int) audioSampleRate / reasonable_frame_rate;
    }

    void Update() {
        if (useAudio && !clipError) {
            if (audioSource.clip == null) { // create and use a dedicated flag for audio having been initialized?
                initializeAudioClip(); // will generally only run once at the beginning
            }
            updateAudio();
        } else {
            // Array.Fill(samples, 0f); // goes to zero even without this
            // Array.Fill(octaves, 0f); // goes to zero even without this
            // maybe TODO implement processor savings when useAudio goes from true to false
        }
    }

    void initializeAudioClip() {
        if (useMicrophone) {
            // Debug.Log("Microphone devices: " + string.Join(", ", Microphone.devices));
            if (Microphone.devices.Length > micIndex) {
                micName = Microphone.devices[micIndex].ToString();
                audioSource.outputAudioMixerGroup = mixerGroupMicrophone;
                audioSource.clip = Microphone.Start(micName, false, microphone_clip_length_seconds, audioSampleRate);
                audioSource.Play();
            } else {
                Debug.Log("Microphone device with index " + micIndex + " does not exist.");
                clipError = true; // e.g. permissions weren't granted
            }
        } else {
            if (clip != null) {
                audioSource.outputAudioMixerGroup = mixerGroupMaster;
                audioSource.clip = clip;
                audioSource.Play();
            } else {
                Debug.Log("There is no clip to play.");
                clipError = true;
            }
        }
    }

    void updateAudio() {
        // Restart clip if it's reached the end
        if (!audioSource.isPlaying && should_loop) {
            audioSource.clip = useMicrophone ? Microphone.Start(micName, false, microphone_clip_length_seconds, audioSampleRate) : clip;
            audioSource.Play();
        }

        // Volume method, outputs to float latestVolume
        int currentPosition = Microphone.GetPosition(micName);
        float[] audioData = new float[audioSource.clip.samples * audioSource.clip.channels];
        audioSource.clip.GetData(audioData, 0);
        int backcast = (int) Mathf.Max(0, currentPosition - sample_window_length);
        running_sum = 0.0f;
        for (int i = backcast; i < currentPosition; i++) {
            running_sum += Mathf.Abs(audioData[i]);
        }
        latestVolume = running_sum / (currentPosition - backcast);
        
        // FFT method, outputs to float[] octaves[]
        // audioSource.GetSpectrumData(samples, 0, fftwindow);
        // for (int i = 0; i < 10; i++) {
        //     running_sum = 0.0f;
        //     for (int j = octave_cutoffs[i]; j < octave_cutoffs[i+1]; j++) {
        //         running_sum += samples[j];
        //     }
        //     octaves[i] = running_sum / (octave_cutoffs[i+1] - octave_cutoffs[i]);
        // }
    }
}
