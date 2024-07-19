// Copyright 2024 SensoriMotion

using MiniJSON;
using System; // for Math
using System.Collections.Generic;
using UnityEngine;

public class ZoneParamsScript : MonoBehaviour {
    // public AudioParamsScript audioParams;
    public BodyParamsScript bodyParams;

    public TextAsset example_json;

    public Dictionary<string,object> zone;
    public Dictionary<string,object> zoneParamsOriginalCopy, zoneParams;
    public Dictionary<string,object> zoneShadersOriginalCopy, zoneShaders;
    public bool is_playlist_managed; // true in inspector
    public bool is_playlist_active; // false in inspector
    public float jump_ahead_seconds; // 0 in inspector
    public float elapsed_time; // 0 in inspector
    private float zone_start_time;
    private float epoch_start_time_current, epoch_start_time_next, time_between_epochs, elapsed_epoch_time;
    private float elapsed_epoch_fraction;

    void Awake() {
        zone = new Dictionary<string,object> {}; // note: Awake() runs once per session, not once per zone
        zoneParamsOriginalCopy = new Dictionary<string,object> {};
        zoneParams = new Dictionary<string,object> {};
        zoneShadersOriginalCopy = new Dictionary<string,object> {};
        zoneShaders = new Dictionary<string,object> {};
    }

    public void startZoneParams() {
        if (!is_playlist_managed) {
            zone_start_time = Time.time;
            elapsed_time = jump_ahead_seconds;
            zone = (Dictionary<string,object>) Json.DictDeserialize(example_json.text);
        }
        zoneParamsOriginalCopy = (Dictionary<string,object>) zone["params"];
        zoneParams = Json.DeepCopyDict(zoneParamsOriginalCopy);
        zoneShadersOriginalCopy = (Dictionary<string,object>) zone["shaders"];
        zoneShaders = Json.DeepCopyDict(zoneShadersOriginalCopy);

        evaluate_params_and_shaders();
    }

    void evaluate_params_and_shaders() {
        foreach (var param in zoneParamsOriginalCopy) {
            if (param.Value is Dictionary<string,object>) {
                zoneParams[param.Key] = evaluate_param_at_t((Dictionary<string,object>) param.Value, elapsed_time);
            } // else equals a constant and doesn't need to be evaluated further
        }
        
        foreach (var shader in zoneShadersOriginalCopy) { // this evaluates for all shaders, even ones that aren't being used // TODO optimize
            var params_ = ((Dictionary<string,object>) shader.Value)["params"];
            foreach (var param in (Dictionary<string,object>) params_) {
                if (param.Value is Dictionary<string,object>) {
                    ((Dictionary<string,object>) ((Dictionary<string,object>) (zoneShaders[shader.Key]))["params"])[param.Key] = evaluate_param_at_t((Dictionary<string,object>) param.Value, elapsed_time);
                } // else equals a constant and doesn't need to be evaluated further
            }
        }
    }

    public Material setShaderParams(string shader_name, Material mat) {
        var shader_json = (Dictionary<string,object>) zoneShaders[shader_name];
        var shader_unity_name = (string) shader_json["_unity_shader_name"];
        if (mat == null) {
            mat = new Material(Shader.Find(shader_unity_name));
        } else if (mat.shader.name != shader_unity_name) {
            mat.shader = Shader.Find(shader_unity_name);
        }
        foreach (var param in (Dictionary<string,object>) shader_json["params"]) {
            if (param.Value is double) {
                mat.SetFloat((string) param.Key, (float) (double) param.Value);
            } else if (param.Value is long) {
                mat.SetInt((string) param.Key, (int) (long) param.Value);
            } else if (param.Value is bool) {  // use mat.En/Dis/ableKeyword(param.Key) ?
                mat.SetInt((string) param.Key, (bool) param.Value ? 1 : 0);
            }
        }
        return mat;
    }

    void Update() {
        if (!is_playlist_managed) elapsed_time = (Time.time - zone_start_time) + jump_ahead_seconds;
        if (!is_playlist_managed || is_playlist_active) evaluate_params_and_shaders();
    }

    object evaluate_param_at_t(Dictionary<string,object> param_epoch_description, float _elapsed_time) {
        // find the epoch I'm in
        int epoch_idx = 0;
        List<object> epoch_starts_seconds = (List<object>) param_epoch_description["epoch_starts_seconds"];
        foreach (double start in epoch_starts_seconds) {
            if ((float) start > 0.0) { // ignore 0 because fencepost error
                if ((float) start > _elapsed_time) break;
                epoch_idx++;
            }
        }
        List<object> epochs = (List<object>) param_epoch_description["epochs"];
        Dictionary<string,object> current_epoch = (Dictionary<string,object>) epochs[epoch_idx];

        // get the next epoch, if any
        Dictionary<string,object> next_epoch = null;
        if (epoch_idx + 1 < epochs.Count) next_epoch = (Dictionary<string,object>) epochs[epoch_idx+1];

        // find the length of the current epoch and how far along I am in it
        epoch_start_time_current = (float) (double) epoch_starts_seconds[epoch_idx];
        elapsed_epoch_time = _elapsed_time - epoch_start_time_current;

        // evaluate the value
        double value = 0.0;
        if (current_epoch.ContainsKey("value") && next_epoch != null && next_epoch.ContainsKey("value") && 
                next_epoch.ContainsKey("do_interpolate") && (bool) next_epoch["do_interpolate"]) {
            // explicit interpolation case
            epoch_start_time_next = (float) (double) epoch_starts_seconds[epoch_idx+1];
            time_between_epochs = epoch_start_time_next - epoch_start_time_current;
            elapsed_epoch_fraction = elapsed_epoch_time / time_between_epochs; // floats and doubles mess
            if (current_epoch["value"] is double) {
                value = (double) current_epoch["value"] + (
                    (double) next_epoch["value"] - (double) current_epoch["value"]
                ) * elapsed_epoch_fraction;
            } else {
                value = (long) current_epoch["value"] + (
                    (long) next_epoch["value"] - (long) current_epoch["value"]
                ) * elapsed_epoch_fraction;
            }
            if (param_epoch_description.ContainsKey("round_to_int_method")) {
                return (object) round_to_int_method((string) param_epoch_description["round_to_int_method"], (float) value);
            }
            return (object) value;
        } else if (current_epoch.ContainsKey("value")) {
            // explicit case
            return (object) current_epoch["value"];
        } else if (current_epoch.ContainsKey("functions")) {
            // functional case
            if ((string) current_epoch["operation"] == "product") value = 1.0;
            foreach (Dictionary<string,object> math_function in (List<object>) current_epoch["functions"]) {
                float abscissa = 0f;
                if (!math_function.ContainsKey("abscissa") || (string) math_function["abscissa"] == "epoch_time") {
                    abscissa = elapsed_epoch_time;
                } else {
                    abscissa = (float) bodyParams.getBodyParamByName((string) math_function["abscissa"]);
                }
                if ((string) current_epoch["operation"] == "sum") {
                    value += evaluate_function_at_t(math_function, abscissa);
                } else if ((string) current_epoch["operation"] == "product") {
                    value *= evaluate_function_at_t(math_function, abscissa);
                }
            }
            if (param_epoch_description.ContainsKey("round_to_int_method")) {
                return (object) round_to_int_method((string) param_epoch_description["round_to_int_method"], (float) value);
            }
            return (object) value;
        } else {
            Debug.LogError("neither 'value' nor 'functions' found in epoch");
            return (object) value;
        }
    }

    // return, e.g., 3 instead of -1 for (-1 % 4)
    public double pos_mod(double n, double m) {
        return ((n % m) + m) % m; // duplicated elsewhere
    }

    double evaluate_function_at_t(Dictionary<string,object> math_function, float time_t) {
        double offset = (double) math_function["offset"];

        if ((string) math_function["function"] == "monomial") {
            double exponent = (double) math_function["exponent"];
            double coefficient = (double) math_function["coefficient"];
            double t_offset = (double) math_function["t_offset"];
            return coefficient * Math.Pow((time_t - t_offset), exponent) + offset;
        }

        if ((string) math_function["function"] == "exponential") {
            double exponent = (double) math_function["exponent"];
            double coefficient = (double) math_function["coefficient"];
            double t_offset = (double) math_function["t_offset"];
            return coefficient * Math.Exp((time_t - t_offset) * exponent) + offset;
        }

        double wavelength_s = 60.0 / (double) math_function["bpm"];
        double phase_d = (double) math_function["phase"];
        double phase_r = phase_d * Math.PI / 90.0;
        double phase_f = phase_d / 360;
        double amplitude = (double) math_function["amplitude"];

        switch ((string) math_function["function"]) {
            case "sine":
                return amplitude * Math.Sin(2.0 * Math.PI * time_t / wavelength_s - phase_r) + offset;
            case "cosine":
                return amplitude * Math.Cos(2.0 * Math.PI * time_t / wavelength_s - phase_r) + offset;
            case "square":
                return (pos_mod(time_t - phase_f * wavelength_s, wavelength_s) < (wavelength_s / 2.0) ? amplitude : -amplitude) + offset;
            case "triangle":
                double t_ = (time_t - phase_f * wavelength_s) % wavelength_s;
                return 4.0 * amplitude * Math.Abs(t_ / wavelength_s - Math.Round(t_ / wavelength_s)) - amplitude + offset;
            case "sawtooth":
                t_ = pos_mod(time_t - phase_f * wavelength_s, wavelength_s);
                return 2.0 * amplitude * (t_ / wavelength_s) - amplitude + offset;
            case "staircase":
                int stairIndex = (int) ((time_t - phase_f * wavelength_s) / wavelength_s);
                return stairIndex * amplitude + offset;
            default:
                Debug.LogError("unrecognized math function");
                return 0.0;
        }
    }

    long round_to_int_method(string method, float value) {
        switch (method) {
            case "nearest":
                return (long) Math.Round(value);
            case "ceil":
                return (long) Math.Ceiling(value);
            case "floor":
                return (long) Math.Floor(value);
            case "absceil":
                return (long) (value >= 0 ? Math.Ceiling(value) : Math.Floor(value));
            case "absfloor":
                return (long) (value >= 0 ? Math.Floor(value) : Math.Ceiling(value));
            default:
                Debug.Log("unrecognized rounding method");
                return 0;
        }
    }

    public bool ConvertToBoolean(object obj) {
        if (obj is null) return false;
        if (obj is bool boolValue) return boolValue; // already bool
        if (obj is double doubleValue && doubleValue > -1 && doubleValue < 1) return false; // double
        if (obj is float floatValue && floatValue > -1f && floatValue < 1f) return false; // float
        return true;
    }
}
