// Copyright 2024 SensoriMotion

using UnityEngine;
using UnityEngine.SceneManagement;

public class ZoneLauncher : MonoBehaviour {    

    public string zoneScene;

    void Start() {
        GameObject.Find("Left Hand").GetComponent<HandScript>().set_active(false);
        GameObject.Find("Right Hand").GetComponent<HandScript>().set_active(false);
        GameObject.Find("Zone").GetComponent<ZoneParamsScript>().is_playlist_managed = false;

        Debug.Log("Loading zone " + zoneScene);
        SceneManager.LoadScene(zoneScene);
    }
}
