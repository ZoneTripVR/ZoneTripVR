// Copyright 2024 SensoriMotion

using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class ExampleZoneScript : MonoBehaviour {
    // ----- ZoneParams boilerplate (can delete if the zonetype schema is empty)
    private ZoneParamsScript zoneParams;
    private Dictionary<string,object> zoneParamsDict;
    public TextAsset example_json;
    // ----- end boilerplate

    private Material[] materials;
    private int n_materials = 1;
    private string shader_one;

    private Camera cam;
    private Color sky_color;

    private GameObject screen;
    private GameObject[,] triangles;

    private Vector3 screen_position, screen_scale;
    private float triangle_spacing;
    private float u_center, v_center, u_width, v_height;

    void Start() {
        materials = new Material[n_materials];

        // ----- ZoneParams boilerplate (can delete if the zonetype schema is empty)
        zoneParams = GameObject.Find("Zone").GetComponent<ZoneParamsScript>();
        zoneParams.example_json = example_json;
        zoneParams.startZoneParams();
        setZoneParams();
        // ----- ShadersParams boilerplate (can delete if the zonetype schema has no shaders)
        setShadersParams();
        // ----- end boilerplate

        cam = GameObject.Find("Head").GetComponent<Camera>();
        cam.clearFlags = CameraClearFlags.SolidColor;

        screen = new GameObject("Screen");

        triangles = new GameObject[4, 4];

        for (int i = 0; i < 4; i++) {
            for (int j = 0; j < 4; j++) {
                triangles[i, j] = new GameObject("Triangle" + i + "" + j, typeof(MeshFilter), typeof(MeshRenderer));
                Mesh mesh = new Mesh();
                mesh.vertices = new Vector3[] {new Vector3(0, 0, 0), new Vector3(0, 0, 0), new Vector3(0, 0, 0)};
                mesh.triangles = new int[] {0, 1, 2};
                triangles[i, j].GetComponent<MeshFilter>().mesh = mesh;
                triangles[i, j].GetComponent<MeshRenderer>().material = materials[0];
                triangles[i, j].transform.SetParent(screen.transform);
            }
        }
    }

    // ----- ZoneParams boilerplate (can delete if [see above])
    void setZoneParams() {
        zoneParamsDict = zoneParams.zoneParams;

        triangle_spacing = (float) (double) zoneParamsDict["triangle_spacing"];
        var sky_r = (float) (double) zoneParamsDict["sky_r"];
        var sky_g = (float) (double) zoneParamsDict["sky_g"];
        var sky_b = (float) (double) zoneParamsDict["sky_b"];
        sky_color = new Color(sky_r, sky_g, sky_b);
        var screen_position_x = (float) (double) zoneParamsDict["screen_position_x"];
        var screen_position_y = (float) (double) zoneParamsDict["screen_position_y"];
        var screen_position_z = (float) (double) zoneParamsDict["screen_position_z"];
        screen_position = new Vector3(screen_position_x, screen_position_y, screen_position_z);
        var screen_scale_x = (float) (double) zoneParamsDict["screen_scale_x"];
        var screen_scale_y = (float) (double) zoneParamsDict["screen_scale_y"];
        var screen_scale_z = (float) (double) zoneParamsDict["screen_scale_z"];
        screen_scale = new Vector3(screen_scale_x, screen_scale_y, screen_scale_z);
        u_center = (float) (double) zoneParamsDict["u_center"];
        v_center = (float) (double) zoneParamsDict["v_center"];
        u_width = (float) (double) zoneParamsDict["u_width"];
        v_height = (float) (double) zoneParamsDict["v_height"];
        shader_one = (string) zoneParamsDict["shader_one"];
    }
    // ----- ShadersParams boilerplate (can delete if [see above])
    void setShadersParams() {
        var shader_names = new string[] {shader_one};

        for (int i = 0; i < n_materials; i++) {
            materials[i] = zoneParams.setShaderParams(shader_names[i], materials[i]);
        }
    }
    // ----- end boilerplate
    
    void Update() {
        setZoneParams(); // ----- ZoneParams boilerplate (can delete if [see above])
        setShadersParams(); // ----- ShadersParams boilerplate (can delete if [see above])
        
        cam.backgroundColor = sky_color;
        screen.transform.localPosition = screen_position;
        screen.transform.localScale = screen_scale;

        var spacer0 = triangle_spacing;
        var spacer1 = spacer0 * 2f * 1.414f;
        var s00 = new Vector3(spacer0, spacer0, 0);
        var s01 = new Vector3(spacer0, -spacer0, 0);
        var s02 = new Vector3(-spacer0, -spacer0, 0);
        var s03 = new Vector3(-spacer0, spacer0, 0);
        var s10 = new Vector3(spacer1, spacer1, 0);
        var s11 = new Vector3(spacer1, -spacer1, 0);
        var s12 = new Vector3(-spacer1, -spacer1, 0);
        var s13 = new Vector3(-spacer1, spacer1, 0);

        var uv_center = new Vector2(u_center, v_center);
        var u_min = u_center - u_width/2f;
        var u_max = u_center + u_width/2f;
        var v_min = v_center - v_height/2f;
        var v_max = v_center + v_height/2f;

        // inner triangles
        triangles[0, 0].GetComponent<MeshFilter>().mesh.vertices = new Vector3[] {
            new Vector3(0, 0, 0) + s00, new Vector3(0, 1, 0) + s00, new Vector3(1, 0, 0) + s00};
        triangles[0, 0].GetComponent<MeshFilter>().mesh.uv = new Vector2[] {
            uv_center, new Vector2(u_center, v_max), new Vector2(u_max, v_center)};
        triangles[0, 0].GetComponent<MeshFilter>().mesh.RecalculateBounds();
        
        triangles[0, 1].GetComponent<MeshFilter>().mesh.vertices = new Vector3[] {
            new Vector3(0, 0, 0) + s01, new Vector3(1, 0, 0) + s01, new Vector3(0, -1, 0) + s01};
        triangles[0, 1].GetComponent<MeshFilter>().mesh.uv = new Vector2[] {
            uv_center, new Vector2(u_max, v_center), new Vector2(u_center, v_min)};
        triangles[0, 1].GetComponent<MeshFilter>().mesh.RecalculateBounds();

        triangles[0, 2].GetComponent<MeshFilter>().mesh.vertices = new Vector3[] {
            new Vector3(0, 0, 0) + s02, new Vector3(0, -1, 0) + s02, new Vector3(-1, 0, 0) + s02};
        triangles[0, 2].GetComponent<MeshFilter>().mesh.uv = new Vector2[] {
            uv_center, new Vector2(u_center, v_min), new Vector2(u_min, v_center)};
        triangles[0, 2].GetComponent<MeshFilter>().mesh.RecalculateBounds();
        
        triangles[0, 3].GetComponent<MeshFilter>().mesh.vertices = new Vector3[] {
            new Vector3(0, 0, 0) + s03, new Vector3(-1, 0, 0) + s03, new Vector3(0, 1, 0) + s03};
        triangles[0, 3].GetComponent<MeshFilter>().mesh.uv = new Vector2[] {
            uv_center, new Vector2(u_min, v_center), new Vector2(u_center, v_max)};
        triangles[0, 3].GetComponent<MeshFilter>().mesh.RecalculateBounds();

        // outer triangles
        triangles[1, 0].GetComponent<MeshFilter>().mesh.vertices = new Vector3[] {
            new Vector3(1, 1, 0) + s10, new Vector3(1, 0, 0) + s10, new Vector3(0, 1, 0) + s10};
        triangles[1, 0].GetComponent<MeshFilter>().mesh.uv = new Vector2[] {
            new Vector2(u_max, v_max), new Vector2(u_max, v_center), new Vector2(u_center, v_max)};
        triangles[1, 0].GetComponent<MeshFilter>().mesh.RecalculateBounds();
        
        triangles[1, 1].GetComponent<MeshFilter>().mesh.vertices = new Vector3[] {
            new Vector3(1, -1, 0) + s11, new Vector3(0, -1, 0) + s11, new Vector3(1, 0, 0) + s11};
        triangles[1, 1].GetComponent<MeshFilter>().mesh.uv = new Vector2[] {
            new Vector2(u_max, v_min), new Vector2(u_center, v_min), new Vector2(u_max, v_center)};
        triangles[1, 1].GetComponent<MeshFilter>().mesh.RecalculateBounds();

        triangles[1, 2].GetComponent<MeshFilter>().mesh.vertices = new Vector3[] {
            new Vector3(-1, -1, 0) + s12, new Vector3(-1, 0, 0) + s12, new Vector3(0, -1, 0) + s12};
        triangles[1, 2].GetComponent<MeshFilter>().mesh.uv = new Vector2[] {
            new Vector2(u_min, v_min), new Vector2(u_min, v_center), new Vector2(u_center, v_min)};
        triangles[1, 2].GetComponent<MeshFilter>().mesh.RecalculateBounds();
        
        triangles[1, 3].GetComponent<MeshFilter>().mesh.vertices = new Vector3[] {
            new Vector3(-1, 1, 0) + s13, new Vector3(0, 1, 0) + s13, new Vector3(-1, 0, 0) + s13};
        triangles[1, 3].GetComponent<MeshFilter>().mesh.uv = new Vector2[] {
            new Vector2(u_min, v_max), new Vector2(u_center, v_max), new Vector2(u_min, v_center)};
        triangles[1, 3].GetComponent<MeshFilter>().mesh.RecalculateBounds();
    }
}
