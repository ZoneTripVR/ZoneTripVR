
// Copyright 2025 SensoriMotion

class ZoneParams {
    constructor(params, bodyParams) {
        this.params = params;
        this.paramsOriginalCopy = structuredClone(params);
        this.bodyParams = bodyParams;
    }

    evaluateZoneParams(elapsedTime, bodyPose) {
        for (const [key, value] of Object.entries(this.paramsOriginalCopy)) {
            if (value instanceof Object) {
                this.params[key] = this.evaluateParamAtT(value, elapsedTime, bodyPose);
            } // else it's constant and doesn't need evaluation
            // if (this.zonetype.params_schema[indexOf(key)].type === 'checkbox') {
            //     this.params[key] = ZoneParams.convertToBoolean(this.params[key]);
            // }
        }
        return this.params;
    }

    evaluateParamAtT(paramEpochDescription, elapsedTime, bodyPose) {
        // Find the epoch
        let epochIdx = 0;
        const epochStartsSeconds = paramEpochDescription.epoch_starts_seconds;

        for (const start of epochStartsSeconds) {
            if (start > 0.0) { // Ignore 0 due to fencepost error
                if (start > elapsedTime) break;
                epochIdx++;
            }
        }

        const epochs = paramEpochDescription.epochs;
        const currentEpoch = epochs[epochIdx];
        let nextEpoch = null;

        if (epochIdx + 1 < epochs.length) nextEpoch = epochs[epochIdx + 1];

        // Determine epoch duration and progress
        const epochStartTimeCurrent = epochStartsSeconds[epochIdx];
        const elapsedEpochTime = elapsedTime - epochStartTimeCurrent;

        // Evaluate the value
        let value = 0.0;

        if (
            currentEpoch.value !== undefined &&
            nextEpoch !== null &&
            nextEpoch.value !== undefined &&
            nextEpoch.do_interpolate
        ) {
            // Interpolation case
            const epochStartTimeNext = epochStartsSeconds[epochIdx + 1];
            const timeBetweenEpochs = epochStartTimeNext - epochStartTimeCurrent;
            const elapsedEpochFraction = elapsedEpochTime / timeBetweenEpochs;

            if (typeof currentEpoch.value === "number") {
                value = currentEpoch.value +
                    (nextEpoch.value - currentEpoch.value) * elapsedEpochFraction;
            } else {
                value = currentEpoch.value +
                    (nextEpoch.value - currentEpoch.value) * elapsedEpochFraction;
            }

            if (paramEpochDescription.round_to_int_method) {
                return ZoneParams.roundToIntMethod(paramEpochDescription.round_to_int_method, value);
            }

            return value;
        } else if (currentEpoch.value !== undefined) {
            return currentEpoch.value;
        } else if (currentEpoch.functions !== undefined) {
            // Functional case
            value = currentEpoch.operation === "product" ? 1.0 : 0.0;

            for (const mathFunction of currentEpoch.functions) {
                let abscissa = 0;

                if (!mathFunction.abscissa || mathFunction.abscissa === "epoch_time") {
                    abscissa = elapsedEpochTime;
                } else {
                    abscissa = this.bodyParams.evaluateBodyParam(mathFunction.abscissa, bodyPose);
                }

                if (currentEpoch.operation === "sum") {
                    value += ZoneParams.evaluateFunctionAtT(mathFunction, abscissa);
                } else if (currentEpoch.operation === "product") {
                    value *= ZoneParams.evaluateFunctionAtT(mathFunction, abscissa);
                }
            }

            if (paramEpochDescription.round_to_int_method) {
                return ZoneParams.roundToIntMethod(paramEpochDescription.round_to_int_method, value);
            }

            return value;
        } else {
            console.error("Neither 'value' nor 'functions' found in epoch");
            return value;
        }
    }
    
    static roundToIntMethod(method, value) {
        switch (method) {
            case "nearest":
                return Math.round(value);
            // case "nearest_even":
            //     return Math.round(value/2.0)*2;
            case "ceil":
                return Math.ceil(value);
            case "floor":
                return Math.floor(value);
            case "absceil":
                return value >= 0 ? Math.ceil(value) : Math.floor(value);
            case "absfloor":
                return value >= 0 ? Math.floor(value) : Math.ceil(value);
            default:
                console.log("Unrecognized rounding method");
                return 0;
        }
    }

    static evaluateFunctionAtT(mathFunction, timeT) {
        const offset = mathFunction.offset;

        if (mathFunction.function === "monomial") {
            const { exponent, coefficient, t_offset } = mathFunction;
            return coefficient * Math.pow(timeT - t_offset, exponent) + offset;
        }

        if (mathFunction.function === "exponential") {
            const { exponent, coefficient, t_offset } = mathFunction;
            return coefficient * Math.exp((timeT - t_offset) * exponent) + offset;
        }

        const wavelengthS = 60.0 / mathFunction.bpm;
        const phaseD = mathFunction.phase;
        const phaseR = (phaseD * Math.PI) / 180.0;
        const amplitude = mathFunction.amplitude;

        switch (mathFunction.function) {
            case "sine":
                return amplitude * Math.sin(2.0 * (Math.PI * timeT / wavelengthS - phaseR)) + offset;
            case "cosine":
                return amplitude * Math.cos(2.0 * (Math.PI * timeT / wavelengthS - phaseR)) + offset;
            case "square":
                return (ZoneParams.posMod(timeT - (phaseD / 360) * wavelengthS, wavelengthS) < wavelengthS / 2 ?
                    amplitude : -amplitude
                ) + offset;
            case "triangle":
                const t_ = ZoneParams.posMod(timeT - (phaseD / 360) * wavelengthS, wavelengthS);
                return 4.0 * amplitude * Math.abs(t_ / wavelengthS - Math.round(t_ / wavelengthS)) - amplitude + offset;
            case "sawtooth":
                const tSaw = ZoneParams.posMod(timeT - (phaseD / 360) * wavelengthS, wavelengthS);
                return 2.0 * amplitude * (tSaw / wavelengthS) - amplitude + offset;
            case "staircase":
                const stairIndex = Math.floor((timeT - (phaseD / 360) * wavelengthS) / wavelengthS);
                return stairIndex * amplitude + offset;
            default:
                console.error("Unrecognized math function");
                return 0.0;
        }
    }
    
    static posMod(n, m) {
        return ((n % m) + m) % m; // Ensure positive modulo
    }

    static convertToBoolean(obj) {
        if (obj === null || obj === undefined) return false;
        if (typeof obj === "boolean") return obj;
        if (typeof obj === "number" && obj > -1 && obj < 1) return false;
        return true;
    }
}
