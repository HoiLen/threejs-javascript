import * as THREE from 'three';
// import { GUI } from '../node_modules/three/examples/jsm/libs/lil-gui.module.min.js';
import { OrbitControls } from '../node_modules/three/examples/jsm/controls/OrbitControls.js';
import { TransformControls } from '../node_modules/three/examples/jsm/controls/TransformControls.js';

/*----------変数などの宣言----------*/
// const curveSegments = 200;


init();

function init() {
    /*----------初期化処理----------*/
    const container = document.getElementById('container');

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);

    const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 10000);
    camera.position.set(0, 500, 1000);
    scene.add(camera);

    scene.add(new THREE.AmbientLight(0xf0f0f0));
    const light = new THREE.SpotLight(0xffffff);
    light.position.set(0, 1500, 200);
    light.angle = Math.PI * 0.2;
    light.castShadow = true;
    light.shadow.camera.near = 200;
    light.shadow.camera.far = 2000;
    light.shadow.bias = - 0.000222;
    light.shadow.mapSize.width = 1024;
    light.shadow.mapSize.height = 1024;
    light.intensty = 200;
    scene.add(light);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    //div id=containerの中にcanvasを作成
    container.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.5;
    //カメラの位置情報が更新されるたびにrender()を呼び出す
    controls.addEventListener('change', render);

    const transformControl = new TransformControls(camera, renderer.domElement);
    transformControl.addEventListener('change', render);
    //マウスのドラッグで変更されたときに呼び出す
    transformControl.addEventListener('dragging-changed', function (event) {
        //オブジェクトのトランスフォーム中は、カメラの視点を切り替えられないようにする
        controls.enabled = !event.value;

    });
    scene.add(transformControl);
    window.addEventListener('resize',onWindowResize);

    /*----------ここから記述する----------*/








    /*---------- ↓ 関数 ----------*/
    render();
    function render() {

        renderer.render(scene, camera);

    }

    function onWindowResize() {

        camera.aspect = window.innerWidth/window.innerHeight;
        camera.updateProjectionMatrix();

        renderer.setSize(window.innerWidth, window.innerHeight);

        controls.update();
        render();
    }

}