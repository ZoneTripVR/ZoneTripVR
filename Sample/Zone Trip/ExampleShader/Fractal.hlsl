// Copyright 2024 SensoriMotion

// n-th Power of a Complex Number using De Moivre's Theorem
float2 ComplexPow(float2 z, float n) {
    if (z.x == 0.0 && z.y == 0.0) return float2(0,0);
    if (n == 2) return float2(z.x * z.x - z.y * z.y, 2.0 * z.x * z.y);
    float theta = atan2(z.y, z.x);
    return pow(length(z), n) * float2(cos(n * theta), sin(n * theta));
}

float pos_mod(float n, float m) {
    return fmod(fmod(n, m) + m, m);
}

void fractal_float(
    bool _IsJulia,
    float _c_re,
    float _c_im,
    float _MaxIterations,
    float _Power,
    float _Color1R, float _Color1G, float _Color1B,
    float _Color2R, float _Color2G, float _Color2B,
    float _Color3R, float _Color3G, float _Color3B,
    float _SetColorR, float _SetColorG, float _SetColorB,
    float _ColorSteps,
    float _ColorShift,
    bool _IsColorSmooth,
    float2 uv,
    out float3 outColor)
{
    // fractal iteration
    float2 c = _IsJulia ? float2(_c_re, _c_im) : uv; // For Mandelbrot, c is the current point
    float2 z = _IsJulia ? uv : float2(0., 0.); // For Mandelbrot, start z at 0; for Julia, z is the current point
    float escapeRadius = 4.;
    float iteration = 0;
    while (iteration < _MaxIterations && dot(z, z) < escapeRadius * escapeRadius) {
        z = ComplexPow(z, _Power) + c;
        iteration++;
    }

    // smoothing
    if (iteration < _MaxIterations & _IsColorSmooth) {
        float log_zn = log(dot(z, z)) / 2.0f; // Equivalent to log(|z|^2)/2, or log of magnitude squared of z, divided by 2
        float nu = log(log_zn / log(_Power)) / log(_Power); // This calculates the smooth factor
        iteration += 1 - nu; // Adjust 'iteration' by subtracting the smooth factor
    }

    // color mapping
    float3 color1 = float3(_Color1R, _Color1G, _Color1B);
    float3 color2 = float3(_Color2R, _Color2G, _Color2B);
    float3 color3 = float3(_Color3R, _Color3G, _Color3B);
    float3 set_color = float3(_SetColorR, _SetColorG, _SetColorB);
    float phase = pos_mod(float(iteration + _ColorShift), _ColorSteps * 3) / _ColorSteps; // 3 = number of _Color*s
    if (iteration >= _MaxIterations) {
        outColor = set_color;
    } else if (phase >= 0 && phase < 1) {
        outColor = lerp(color1, color2, phase);
    } else if (phase >= 1 && phase < 2) {
        outColor = lerp(color2, color3, phase-1);
    } else if (phase >= 2 && phase <= 3) {
        outColor = lerp(color3, color1, phase-2);
    }
}
