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

//各軸の頂点数
const N = 100;

//刻み幅
const dt = Math.PI/8;

//計算式の最大値
const MAX = 400;


//計算した頂点の格納
const vertices = [];
//平面グラフの縮尺調整
const SCALE_XY = 1000;
//縦軸グラフの縮尺調整
const SCALE_Z = 50;





/*--------------------処理を書く--------------------*/

init();

//座標
let pos = [];

for (let i = 0; i < N; i++) {
    pos[i] = [];

    for (let j = 0; j < N; j++) {
        //z = sin(x) + cos(y)
        pos[i][j] = (j*Math.sin(Math.cos(i)))/MAX;
        //console.log(i,j,pos[i][j]);

        const x = (i/N-0.5) * SCALE_XY;
        const z = (j/N-0.5) * SCALE_XY;
        const y = pos[i][j] * SCALE_Z;

        vertices.push(x, y, z);
    }
}

// 形状データを作成
const geometry = new THREE.BufferGeometry();
geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));

// マテリアルを作成
const material = new THREE.PointsMaterial({
    // 一つ一つのサイズ
    size: 10,
    // 色
    color: 0xffffff,
});

// 物体を作成
const mesh = new THREE.Points(geometry, material);
scene.add(mesh); // シーンは任意の THREE.Scene インスタンス






render();

/*--------------------関数--------------------*/

function init() {
    /*----------初期化処理----------*/
    console.log("init");
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