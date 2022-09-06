import * as THREE from 'three';
import { GUI } from '../node_modules/three/examples/jsm/libs/lil-gui.module.min.js';
import { OrbitControls } from '../node_modules/three/examples/jsm/controls/OrbitControls.js';
import { TransformControls } from '../node_modules/three/examples/jsm/controls/TransformControls.js';
//import * as Curves from '../node_modules/three/examples/jsm/curves/CurveExtras.js';

/*----------変数などの宣言----------*/
const curveSegments = 20;

let tubeGeometry, mesh;


const params = {
    scale: 4,
    extrusionSegments: curveSegments,
    radiusSegments: 2,
    closed: false,
    movement: -5,
};

//Create a closed wavey loop
const curve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-10, -5, 0),
    new THREE.Vector3(-5, 0, 0),
    new THREE.Vector3(-2, 0, 0),
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(5, 0, 0),
    new THREE.Vector3(10, 0, 0)
]);

const material = new THREE.MeshLambertMaterial({ color: 0xff00ff });
const wireframeMaterial = new THREE.MeshBasicMaterial({ color: 0x000000, opacity: 0.3, wireframe: true, transparent: true });

function addTube() {

    if (mesh !== undefined) {

        parent.remove(mesh);
        mesh.geometry.dispose();

    }

    const extrudePath = curve;

    tubeGeometry = new THREE.TubeGeometry(extrudePath, params.extrusionSegments, 2, params.radiusSegments, params.closed);

    addGeometry(tubeGeometry);

    setScale();

}

function setScale() {

    mesh.scale.set(params.scale, params.scale, params.scale);

}

function addGeometry(geometry) {

    // 3D shape

    mesh = new THREE.Mesh(geometry, material);
    const wireframe = new THREE.Mesh(geometry, wireframeMaterial);
    mesh.add(wireframe);

    parent.add(mesh);

}

function transformVertex(vertex) {
    vertex.y = params.movement;
}




init();

function init() {
    /*----------初期化処理----------*/
    const container = document.getElementById('container');

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xa0a0a0);

    const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 10000);
    camera.position.set(0, 25, 25);
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

    transformControl.addEventListener('objectChange', function () {

        updateSplineOutline();

    });

    document.addEventListener('pointerdown', onPointerDown);
	document.addEventListener('pointerup', onPointerUp);

    transformControl.attach(mesh);
    scene.add(transformControl);
    window.addEventListener('resize', onWindowResize);

    /*----------ここから記述する----------*/




    // tube

    parent = new THREE.Object3D();
    scene.add(parent);

    addTube();

    const gui = new GUI({ width: 285 });

    gui.add(params, 'scale', 2, 10).step(1).onChange(function () {
        setScale();
        render();
    });

    gui.add(params, 'extrusionSegments', 5, 50).step(5).onChange(function () {
        addTube();
        render();
    });
    gui.add(params, 'radiusSegments', 2, 12).step(1).onChange(function () {
        addTube();
        render();
    });
    gui.add(params, 'closed').onChange(function () {
        addTube();
        render();
    });
    gui.add(params, 'movement',-10,0).step(1).onChange(function () {
        transformVertex(mesh.geometry.vertices[0]);
        addTube();
        render();
    })
    gui.open();

    // //カーブの頂点を取得する
    // const points = curve.getPoints(curveSegments);
    // const geometry = new THREE.BufferGeometry().setFromPoints(points);

    // const material = new THREE.LineBasicMaterial({ color: 0xff0000 });

    // // Create the final object to add to the scene
    // const curveObject = new THREE.Line(geometry, material);

    // scene.add(curveObject);






    /*---------- ↓ 関数 ----------*/
    render();
    function render() {

        renderer.render(scene, camera);

    }

    function onPointerDown(event) {

        onDownPosition.x = event.clientX;
        onDownPosition.y = event.clientY;

    }

    function onPointerUp() {

        onUpPosition.x = event.clientX;
        onUpPosition.y = event.clientY;

        //マウスをクリックした点と離した点が同じ座標なら、3Dオブジェクトをコントロールから削除、UIを非表示にする
        if (onDownPosition.distanceTo(onUpPosition) === 0) transformControl.detach();

    }

    function onWindowResize() {

        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();

        renderer.setSize(window.innerWidth, window.innerHeight);

        controls.update();
        render();
    }

}