import * as THREE from 'three';
// import { GUI } from '../node_modules/three/examples/jsm/libs/lil-gui.module.min.js';
import { OrbitControls } from '../node_modules/three/examples/jsm/controls/OrbitControls.js';
import { TransformControls } from '../node_modules/three/examples/jsm/controls/TransformControls.js';

//htmlからcontainer要素を取り出す。
const container = document.getElementById('container');

/*--------------------3Dシーンの設定--------------------*/


//シーン
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000);
//カメラ
const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 10000);
camera.position.set(0, 500, 1000);
scene.add(camera);
//環境光
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
//レンダラー
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
container.appendChild(renderer.domElement);//div id=containerの中にcanvasを作成

//視点変更の設定
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.5;
controls.addEventListener('change', render);//カメラの位置情報が更新されるたびにrender()を呼び出す

//オブジェクトの変形に関する設定
const transformControl = new TransformControls(camera, renderer.domElement);
transformControl.addEventListener('change', render);
//マウスのドラッグで変更されたときに呼び出す
transformControl.addEventListener('dragging-changed', function (event) {
    //オブジェクトのトランスフォーム中は、カメラの視点を切り替えられないようにする
    controls.enabled = !event.value;
});
scene.add(transformControl);
window.addEventListener('resize', onWindowResize);

//x-y平面のグリットの設定
const helper = new THREE.GridHelper(2000, 100);
helper.position.y = - 199;
helper.material.opacity = 0.25;
helper.material.transparent = true;
scene.add(helper);

/*--------------------変数の宣言--------------------*/

let result = [];

//各軸の頂点数
const N = 6803;

//刻み幅
const dt = Math.PI / 8;

//計算式の最大値
const MAX = 400;


//計算した頂点の格納
const vertices = [];
//平面グラフの縮尺調整
const SCALE_XY = 1000;
//縦軸グラフの縮尺調整
const SCALE_Z = 50;


/*--------------------関数--------------------*/

function init() {
    /*----------初期化処理----------*/
    console.log("init");
    //console.log("out result");
    //console.log(result);
}

function getCsv() {
    console.log("getCSV");
    let req = new XMLHttpRequest();
    req.open("get", "../data/poten2d_0V-0V.csv", true);
    req.send(null);

    req.onload = function () {
        console.log("onload");
        convertCsvToArray(req.responseText);
    }

}

function convertCsvToArray(str) {

    console.log("convertCsvToArray");
    // let tmp = str.split("\r\n");

    // for (let i = 0; i < tmp.length; ++i) {
    //     result[i] = tmp[i].split(',');
    // }

    let splitValue = (/,|\r\n/g);
    result = str.split(splitValue);

    console.log(result);

}

function addPoints() {
    console.log("addPoints");
    for (let i = 0; i < result.length; i += 3) {
        const x = parseFloat(result[i])*5;

        const y = parseFloat(result[i + 1])*5;
        const z = parseFloat(result[i + 2])*5;
        vertices.push(x, z, y);
    }
}

//レンダリング時に実行したい処理をここに書く
function render() {

    renderer.render(scene, camera);

}

//ウィンドウのサイズにシーンを合わせる
function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);

    controls.update();
    render();
}


/*--------------------処理を書く--------------------*/

const promise = new Promise((resolve, reject) => {
    init();
    getCsv();


    console.log(vertices);
    setTimeout(() => {
        resolve();
    }, 1500);

})
    .then(() => {
        addPoints();
        console.log(vertices);

        // 形状データを作成
        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
        //geometry.boundingSphere(null);

        // マテリアルを作成
        const material = new THREE.PointsMaterial({
            // 一つ一つのサイズ
            size: 2,
            // 色
            color: 0x11eaff,
        });


        // 物体を作成
        const mesh = new THREE.Points(geometry, material);
        scene.add(mesh); // シーンは任意の THREE.Scene インスタンス


        render();


    })
    .catch(() => {
        console.log("reject");
    });





