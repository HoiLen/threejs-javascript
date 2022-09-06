import * as THREE from 'three';

import { GUI } from '../node_modules/three/examples/jsm/libs/lil-gui.module.min.js';

import { OrbitControls } from '../node_modules/three/examples/jsm/controls/OrbitControls.js';
import { TransformControls } from '../node_modules/three/examples/jsm/controls/TransformControls.js';

let container;
let camera, scene, renderer;
let curve;
const splineHelperObjects = [];
let splinePointsLength = 4;
const positions = [];
const point = new THREE.Vector3();
let tubeGeometry, planeMesh;
const firstPosition = [
    new THREE.Vector3(300, 400, 50),
    new THREE.Vector3(100, 400, 50),
    new THREE.Vector3(-200, 400, 50),
    new THREE.Vector3(-400, 100, 50)];

//raycaster => マウスがどのオブジェクトを指しているか調べるもの
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
const onUpPosition = new THREE.Vector2();
const onDownPosition = new THREE.Vector2();

const geometry = new THREE.BoxGeometry(20, 20, 20);
let transformControl;

//カーブの総頂点数
const ARC_SEGMENTS = 200;

const splines = {};

//右上のGUIのパラメータ
const params = {
    uniform: true,
    tension: 0.5,
    centripetal: true,
    chordal: true,
    gridPosition: -199,
    addPoint: addPoint,
    removePoint: removePoint,
    exportSpline: exportSpline
};

const material2 = new THREE.MeshLambertMaterial({ color: 0xff00ff });
const wireframeMaterial = new THREE.MeshBasicMaterial({ color: 0x000000, opacity: 0.3, wireframe: true, transparent: true });

init();

function init() {

    container = document.getElementById('container');

    scene = new THREE.Scene();
    scene.autoUpdate = true;
    scene.background = new THREE.Color(0xf0f0f0);

    camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 10000);
    camera.position.set(0, 500, 1000);
    scene.add(camera);

    //環境光の設定
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

    //地面の設定
    const planeGeometry = new THREE.PlaneGeometry(2000, 2000);
    planeGeometry.rotateX(- Math.PI / 2);
    const planeMaterial = new THREE.ShadowMaterial({ color: 0x000000, opacity: 0.2 });
    const plane = new THREE.Mesh(planeGeometry, planeMaterial);
    plane.position.y = - 200;
    plane.receiveShadow = true;
    scene.add(plane);

    //x-y平面のグリットの設定
    const helper = new THREE.GridHelper(2000, 100);
    helper.position.y = - 199;
    helper.material.opacity = 0.25;
    helper.material.transparent = true;
    scene.add(helper);

    //レンダラーの設定
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    //div id=containerの中にcanvasを作成
    container.appendChild(renderer.domElement);

    //GUIの設定
    const gui = new GUI();
    //paramsで宣言したuniform要素をGUIに追加
    //onChange(event) => 値が変更されるたびにonChange内のeventが呼び出される。
    gui.add(params, 'uniform').onChange(render);
    //gui.add（object , property , min , max ,`step`）
    //第五引数のstepはstep()で設定でき、可読性も高いので、step()で設定しています。
    gui.add(params, 'tension', 0, 1).step(0.01).onChange(function (value) {

        splines.uniform.tension = value;
        updateSplineOutline();
        render();

    });
    gui.add(params, 'centripetal').onChange(render);
    gui.add(params, 'chordal').onChange(render);
    //ここ自作（グリッドのy軸成分を変更する）
    gui.add(params, 'gridPosition', -200, 200).step(10).onChange(function (value) {

        helper.position.y = value;
        render();

    });
    gui.add(params, 'addPoint');
    gui.add(params, 'removePoint');
    gui.add(params, 'exportSpline');
    gui.open();


    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.5;
    //カメラの位置情報が更新されるたびにrender()を呼び出す
    controls.addEventListener('change', render);

    transformControl = new TransformControls(camera, renderer.domElement);
    transformControl.addEventListener('change', render);
    //マウスのドラッグで変更されたときに呼び出す
    transformControl.addEventListener('dragging-changed', function (event) {
        //オブジェクトのトランスフォーム中は、カメラの視点を切り替えられないようにする
        controls.enabled = !event.value;

    });
    scene.add(transformControl);

    transformControl.addEventListener('objectChange', function () {

        updateSplineOutline();

    });

    //まだよくわからないが、
    //おそらくカメラ視点の座標系の制御を行うためのイベント呼び出しだと思う。
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('pointerup', onPointerUp);
    document.addEventListener('pointermove', onPointerMove);

    //windowサイズの変更に対応
    window.addEventListener('resize', onWindowResize);

    /*******
     * Curves
     *********/

    for (let i = 0; i < splinePointsLength; i++) {

        addSplineObject(positions[i]);

    }

    positions.length = 0;

    for (let i = 0; i < splinePointsLength; i++) {

        positions.push(splineHelperObjects[i].position);

    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(ARC_SEGMENTS * 3), 3));

    curve = new THREE.CatmullRomCurve3(positions);
    curve.curveType = 'catmullrom';
    curve.mesh = new THREE.Line(geometry.clone(), new THREE.LineBasicMaterial({
        color: 0xff0000,
        opacity: 0.35
    }));
    curve.mesh.castShadow = true;
    splines.uniform = curve;

    curve = new THREE.CatmullRomCurve3(positions);
    curve.curveType = 'centripetal';
    curve.mesh = new THREE.Line(geometry.clone(), new THREE.LineBasicMaterial({
        color: 0x00ff00,
        opacity: 0.35
    }));
    curve.mesh.castShadow = true;
    splines.centripetal = curve;

    curve = new THREE.CatmullRomCurve3(positions);
    curve.curveType = 'chordal';
    curve.mesh = new THREE.Line(geometry.clone(), new THREE.LineBasicMaterial({
        color: 0x0000ff,
        opacity: 0.35
    }));
    curve.mesh.castShadow = true;
    splines.chordal = curve;

    for (const k in splines) {

        const spline = splines[k];
        scene.add(spline.mesh);

    }





    parent = new THREE.Object3D();
    scene.add(parent);



    //ページ読み込み時に追加される4つの立方体の初期値
    load(firstPosition);

    addTube();

    render();

}

//立方体をランダムな座標に追加する
function addSplineObject(position) {

    const material = new THREE.MeshLambertMaterial({ color: Math.random() * 0xffffff });
    const object = new THREE.Mesh(geometry, material);

    if (position) {

        object.position.copy(position);

    } else {

        object.position.x = Math.random() * 1000 - 500;
        object.position.y = Math.random() * 600;
        object.position.z = Math.random() * 800 - 400;

    }

    object.castShadow = true;
    object.receiveShadow = true;
    scene.add(object);
    splineHelperObjects.push(object);
    return object;

}

//新しいカーブの基準点を追加する関数
function addPoint() {

    //カーブの基準点の数をカウントする
    splinePointsLength++;

    //ランダムな座標をpositionsにpushする
    positions.push(addSplineObject().position);

    //カーブを更新する
    updateSplineOutline();

    render();

}

function removePoint() {

    if (splinePointsLength <= 4) {

        return;

    }

    const point = splineHelperObjects.pop();
    splinePointsLength--;
    positions.pop();

    if (transformControl.object === point) transformControl.detach();
    scene.remove(point);

    updateSplineOutline();

    render();

}


//カーブを描く（更新もする）
function updateSplineOutline() {

    //splinesの要素数だけ繰り返す
    //splinesは、多分curveの要素
    for (const k in splines) {

        const spline = splines[k];

        const splineMesh = spline.mesh;
        const position = splineMesh.geometry.attributes.position;

        //ARC_SEGMENTSの数だけカーブの座標計算をする
        for (let i = 0; i < ARC_SEGMENTS; i++) {

            //t => i番目の点 / (総点数-1)
            //tはcurveのポジション[0,1]を示す
            const t = i / (ARC_SEGMENTS - 1);
            //i番目の点の座標を取得して、pointに代入
            spline.getPoint(t, point);
            //i番目の点の座標をセットする
            position.setXYZ(i, point.x, point.y, point.z);

        }

        position.needsUpdate = true;

    }
    addTube();

}



function exportSpline() {

    const strplace = [];

    for (let i = 0; i < splinePointsLength; i++) {

        const p = splineHelperObjects[i].position;
        strplace.push(`new THREE.Vector3(${p.x}, ${p.y}, ${p.z})`);

    }

    console.log(strplace.join(',\n'));
    const code = '[' + (strplace.join(',\n\t')) + ']';
    prompt('copy and paste code', code);

}

function load(new_positions) {

    while (new_positions.length > positions.length) {

        addPoint();

    }

    while (new_positions.length < positions.length) {

        removePoint();

    }

    for (let i = 0; i < positions.length; i++) {

        positions[i].copy(new_positions[i]);

    }

    updateSplineOutline();

}

function render() {

    splines.uniform.mesh.visible = params.uniform;
    splines.centripetal.mesh.visible = params.centripetal;
    splines.chordal.mesh.visible = params.chordal;
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

function onPointerMove(event) {

    //pointer = (ウィンドウ上のマウスの位置/ウィンドウの幅or高さ) * 2 - 1
    //-1~+1に正規化している
    pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
    pointer.y = - (event.clientY / window.innerHeight) * 2 + 1;

    //第一引数には-1~+1に正規化した2DVectorしか入れられない
    //update the picking ray with the camera and pointer position
    raycaster.setFromCamera(pointer, camera);

    const intersects = raycaster.intersectObjects(splineHelperObjects, false);

    if (intersects.length > 0) {

        const object = intersects[0].object;

        if (object !== transformControl.object) {

            transformControl.attach(object);

        }

    }

}

function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);

    controls.update();
    render();

}

function addTube() {

    if (planeMesh != undefined) {
        parent.remove(planeMesh);
        planeMesh.geometry.dispose();
    }

    const extrudePath = curve;

    tubeGeometry = new THREE.TubeGeometry(extrudePath, 20, 100, 2, false);

    addGeometry(tubeGeometry);
}

function addGeometry(geometry) {
    planeMesh = new THREE.Mesh(geometry, material2);
    const wireframe = new THREE.Mesh(geometry, wireframeMaterial);
    planeMesh.add(wireframe);

    parent.add(planeMesh);
}