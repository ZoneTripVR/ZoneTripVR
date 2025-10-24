window.zoneParams = {
    "n_side_cubes": 75,
    "viscosity": 5.0,
    "cube_spacing": 2.0,
    "cube_color_b": {
        "epochs": [
            {
                "functions": [
                    {
                        "bpm": 1.0,
                        "phase": 225.0,
                        "offset": 0.5,
                        "abscissa": "headRotation.z",
                        "function": "sawtooth",
                        "amplitude": 0.5
                    }
                ],
                "operation": "sum"
            }
        ],
        "epoch_starts_seconds": [
            0.0
        ]
    },
    "cube_color_g": {
        "epochs": [
            {
                "functions": [
                    {
                        "bpm": 1.0,
                        "phase": 135.0,
                        "offset": 0.5,
                        "abscissa": "headRotation.y",
                        "function": "sawtooth",
                        "amplitude": 0.5
                    }
                ],
                "operation": "sum"
            }
        ],
        "epoch_starts_seconds": [
            0.0
        ]
    },
    "cube_color_r": {
        "epochs": [
            {
                "functions": [
                    {
                        "bpm": 1.0,
                        "phase": 45.0,
                        "offset": 0.5,
                        "abscissa": "headRotation.x",
                        "function": "sawtooth",
                        "amplitude": 0.5
                    }
                ],
                "operation": "sum"
            }
        ],
        "epoch_starts_seconds": [
            0.0
        ]
    },
    "odd_cube_size": {
        "epochs": [
            {
                "functions": [
                    {
                        "offset": 0.0,
                        "abscissa": "leftHandRestDistance",
                        "exponent": 1.0,
                        "function": "monomial",
                        "t_offset": 0.0,
                        "coefficient": 1.0
                    }
                ],
                "operation": "sum"
            }
        ],
        "epoch_starts_seconds": [
            0.0
        ]
    },
    "even_cube_size": {
        "epochs": [
            {
                "functions": [
                    {
                        "offset": 0.0,
                        "abscissa": "rightHandRestDistance",
                        "exponent": 1.0,
                        "function": "monomial",
                        "t_offset": 0.0,
                        "coefficient": 1.0
                    }
                ],
                "operation": "sum"
            }
        ],
        "epoch_starts_seconds": [
            0.0
        ]
    },
    "odd_cube_rotation_x": {
        "epochs": [
            {
                "functions": [
                    {
                        "offset": 0.0,
                        "abscissa": "leftHandRotation.x",
                        "exponent": 1.0,
                        "function": "monomial",
                        "t_offset": 0.0,
                        "coefficient": 1.0
                    }
                ],
                "operation": "sum"
            }
        ],
        "epoch_starts_seconds": [
            0.0
        ]
    },
    "odd_cube_rotation_y": {
        "epochs": [
            {
                "functions": [
                    {
                        "offset": 0.0,
                        "abscissa": "leftHandRotation.y",
                        "exponent": 1.0,
                        "function": "monomial",
                        "t_offset": 0.0,
                        "coefficient": 1.0
                    }
                ],
                "operation": "sum"
            }
        ],
        "epoch_starts_seconds": [
            0.0
        ]
    },
    "odd_cube_rotation_z": {
        "epochs": [
            {
                "functions": [
                    {
                        "offset": 0.0,
                        "abscissa": "leftHandRotation.z",
                        "exponent": 1.0,
                        "function": "monomial",
                        "t_offset": 0.0,
                        "coefficient": 1.0
                    }
                ],
                "operation": "sum"
            }
        ],
        "epoch_starts_seconds": [
            0.0
        ]
    },
    "even_cube_rotation_x": {
        "epochs": [
            {
                "functions": [
                    {
                        "offset": 0.0,
                        "abscissa": "rightHandRotation.x",
                        "exponent": 1.0,
                        "function": "monomial",
                        "t_offset": 0.0,
                        "coefficient": 1.0
                    }
                ],
                "operation": "sum"
            }
        ],
        "epoch_starts_seconds": [
            0.0
        ]
    },
    "even_cube_rotation_y": {
        "epochs": [
            {
                "functions": [
                    {
                        "offset": 0.0,
                        "abscissa": "rightHandRotation.y",
                        "exponent": 1.0,
                        "function": "monomial",
                        "t_offset": 0.0,
                        "coefficient": 1.0
                    }
                ],
                "operation": "sum"
            }
        ],
        "epoch_starts_seconds": [
            0.0
        ]
    },
    "even_cube_rotation_z": {
        "epochs": [
            {
                "functions": [
                    {
                        "offset": 0.0,
                        "abscissa": "rightHandRotation.z",
                        "exponent": 1.0,
                        "function": "monomial",
                        "t_offset": 0.0,
                        "coefficient": 1.0
                    }
                ],
                "operation": "sum"
            }
        ],
        "epoch_starts_seconds": [
            0.0
        ]
    }
}
