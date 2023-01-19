import * as THREE from 'three';
import { GUI } from '../node_modules/three/examples/jsm/libs/lil-gui.module.min.js';
import { OrbitControls } from '../node_modules/three/examples/jsm/controls/OrbitControls.js';
//import { TransformControls } from '../node_modules/three/examples/jsm/controls/TransformControls.js';


/*--------------------変数の宣言--------------------*/



// const loadBookNum = "02";

let ver00 = [];
let ver02 = [];
let ver20 = [];


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


//スレッショルド電圧
const V_th = 0.6;


/*------------------------------------ここからthree.js------------------------------------*/

//htmlからcontainer要素を取り出す。
const container = document.getElementById('container');

/*--------------------3Dシーンの設定--------------------*/


//シーン
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x555555);
//カメラ
const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 10000);
camera.position.set(0, 500, 1000);
scene.add(camera);
//環境光
scene.add(new THREE.AmbientLight(0xf0f0f0));
// const light = new THREE.SpotLight(0xffffff);
const light = new THREE.DirectionalLight(0xffffff);
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

// //オブジェクトの変形に関する設定
// const transformControl = new TransformControls(camera, renderer.domElement);
// transformControl.addEventListener('change', render);
// //マウスのドラッグで変更されたときに呼び出す
// transformControl.addEventListener('dragging-changed', function (event) {
//     //オブジェクトのトランスフォーム中は、カメラの視点を切り替えられないようにする
//     controls.enabled = !event.value;
// });
// scene.add(transformControl);
window.addEventListener('resize', onWindowResize);

//x-y平面のグリットの設定
const helper = new THREE.GridHelper(2000, 100);
helper.position.y = - 199;
helper.material.opacity = 0.10;
helper.material.transparent = true;
scene.add(helper);


// 形状データを作成
const geometry = new THREE.BufferGeometry();
//geometry.attributes.position.needsUpdate = true; // 最初のレンダリング後に必要
// マテリアルを作成
// const material = new THREE.MeshBasicMaterial({
//     // 一つ一つのサイズ
//     //fog: true,
//     // 色
//     color:0x11eaff,
//     //wireframe:false,
// });
const material = new THREE.PointsMaterial({
    // 一つ一つのサイズ
    size: 2,
    // 色
    //color: 0x11eaff,

    vertexColors: true,
});
// 物体を作成
const mesh = new THREE.Points(geometry, material);
scene.add(mesh); // シーンは任意の THREE.Scene インスタンス



//GUIのパラメータ
let Gslider = 0.0;
let Dslider = 0.0;
const params = {
    gateValue: 0.0,
    drainValue: 0.0,
};
//GUIの設定
const gui = new GUI();
//onChange(event) => 値が変更されるたびにonChange内のeventが呼び出される。
//gui.add（object , property , min , max ,`step`）
//第五引数のstepはstep()で設定でき、可読性も高いので、step()で設定しています。
gui.add(params, 'gateValue', 0, 1).step(0.05).onChange(function (value) {

    Gslider = value;

    // data[1].red = 28 + Gslider * 15;
    // data[2].red = 33 + Gslider * 15;
    // data[3].red = 34 + Gslider * 15;
    // data[4].red = 34 + Gslider * 15;
    // data[5].red = 34 + Gslider * 15;
    // data[6].red = 34 + Gslider * 15;

    for (let i = 0; i < data.length; i++) {
        if (Gslider*2 < V_th) {
            data[i].red = 0;
        }
        else if (data[i].x < (Gslider * 2 - V_th)) {
            data[i].red = (Gslider * 2 - V_th) * data[i].x - ((data[i].x) ** 2)/2;
        }
        else if(data[i].x >= (Gslider * 2 - V_th)){
            data[i].red = ((Gslider * 2 - V_th) ** 2)/2;
        }
    };
    console.log("data");
    console.log(data);

    dataBVG[0].x = Gslider * 2;
    dataBVG[1].x = Gslider * 2;
    let vgnum = parseFloat(Gslider*20);
    let vdnum = parseFloat(Dslider*20);
    dataBVG[1].red = datavg[vgnum].red;
    dataBVD[1].red = data[vdnum].red;

    idvdChart.update();
    idvgChart.update();

    vertices.length = 0; //点群を初期化
    addPoints();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    render();

});
gui.add(params, 'drainValue', 0, 1).step(0.05).onChange(function (value) {

    Dslider = value;

    // datavg[3].red = 18 + Dslider * 8;
    // datavg[4].red = 32 + Dslider * 20;
    // datavg[5].red = 56 + Dslider * 30;
    // datavg[6].red = 80 + Dslider * 70;

    for (let i = 0; i < datavg.length; i++) {
        if (datavg[i].x < V_th) {
            datavg[i].red = 0;
        }
        else if (Dslider * 2 < (datavg[i].x - V_th)) {
            datavg[i].red = (datavg[i].x - V_th) * Dslider * 2 - ((Dslider * 2) ** 2)/2;
        }
        else if (Dslider * 2 >= (datavg[i].x - V_th)){
            datavg[i].red = ((datavg[i].x - V_th) ** 2)/2;
        }
    };

    dataBVD[0].x = Dslider * 2;
    dataBVD[1].x = Dslider * 2;
    let vgnum = parseFloat(Gslider*20);
    let vdnum = parseFloat(Dslider*20);
    // console.log(idid);
    // console.log(data[idid].red);
    dataBVG[1].red = datavg[vgnum].red;
    dataBVD[1].red = data[vdnum].red;
    

    idvgChart.update();
    idvdChart.update();

    vertices.length = 0; //点群を初期化
    addPoints();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    render();

});
gui.open();





/*--------------------関数--------------------*/

function init() {
    /*----------初期化処理----------*/
    console.log("init");
    //console.log("out ver02");
    //console.log(ver02);
}

function getCsv() {
    console.log("getCSV");
    let req00 = new XMLHttpRequest();
    let req02 = new XMLHttpRequest();
    let req20 = new XMLHttpRequest();

    req00.open("get", "../data/poten2d_0V-0V.csv", true);
    req00.send(null);
    req00.onload = function () {
        console.log("onload00");
        ver00 = convertCsvToArray(req00.responseText);
    }

    req02.open("get", "../data/poten2d_0V-2V.csv", true);
    req02.send(null);
    req02.onload = function () {
        console.log("onload02");
        ver02 = convertCsvToArray(req02.responseText);
    }

    req20.open("get", "../data/poten2d_2V-0V.csv", true);
    req20.send(null);
    req20.onload = function () {
        console.log("onload20");
        ver20 = convertCsvToArray(req20.responseText);
    }


}

function convertCsvToArray(str) {

    console.log("convertCsvToArray");

    let splitValue = (/,|\r\n/g);

    return str.split(splitValue);

}

function addPoints() {
    console.log("addPoints");

    //線形補間
    for (let i = 0; i < ver02.length; i = i + 3) {
        const x = parseFloat(ver00[i]) * 20;
        const y = parseFloat(ver00[i + 1]) * 5;
        const z = parseFloat(ver00[i + 2] * 20 - ((ver00[i + 2] - ver02[i + 2]) * Dslider * 20 + (ver00[i + 2] - ver20[i + 2]) * Gslider * 45));
        //const z = parseFloat(ver00[i + 2]*20 - ((ver00[i + 2] - ver02[i + 2]) * Dslider * 20 + (ver00[i + 2] - ver20[i + 2]) * Gslider * 40));
        //const z = parseFloat(ver00[i + 2] - (ver00[i + 2] - ver20[i + 2]) * Gslider) * 20;
        //const z = parseFloat(ver20[i + 2]) * 20;


        vertices.push(x, z, y);
    }
    console.log(vertices);
}

// function calcId() {

// }

//レンダリング時に実行したい処理をここに書く
function render() {
    //idvdChart.update();

    mesh.geometry.attributes.position.needsUpdate = true;
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
    }, 500);

})
    .then(() => {
        //Dslider = 0.0; //sliderの初期値（これがないとページ更新時に点群が表示されない）
        //Gslider = 0.0;
        addPoints();
        console.log(vertices);

        // // 形状データを作成
        // const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));

        // // マテリアルを作成
        // const material = new THREE.PointsMaterial({
        //     // 一つ一つのサイズ
        //     size: 2,
        //     // 色
        //     color: 0x11eaff,
        // });


        // // 物体を作成
        // const mesh = new THREE.Points(geometry, material);
        //scene.add(mesh); // シーンは任意の THREE.Scene インスタンス


        render();

        // line.geometry.computeBoundingBox();
        // line.geometry.computeBoundingSphere();
    })
    .catch(() => {
        console.log("reject");
    });





/*------------------------------------ここからchart.js------------------------------------*/

var chartCanvas;
var idvgCanvas;

chartCanvas = document.createElement("canvas");
chartCanvas.id = 'chartcanvas';

idvgCanvas = document.createElement("canvas");
idvgCanvas.id = 'idvgcanvas';

var cbox = document.getElementById('container');
cbox.appendChild(chartCanvas);
//var idvgbox = document.getElementById('container');
cbox.appendChild(idvgCanvas);

var ctx = document.querySelector("#chartcanvas");
var vgx = document.querySelector("#idvgcanvas");
ctx.width = 1;
ctx.height = 1;
vgx.width = 1;
vgx.height = 1


// var data = [
//     { x: '0', red: 20 },
//     { x: 'Th', red: 28 },
//     { x: 'Over', red: 33 },
//     { x: ' ', red: 34 },
//     { x: '  ', red: 34 },
//     { x: '   ', red: 34 },
//     { x: 'Dorain Vol', red: 34 },
// ];
var data = [
    { x: 0.0, red: 0 },
    { x: 0.1, red: 0 },
    { x: 0.2, red: 0 },
    { x: 0.3, red: 0 },
    { x: 0.4, red: 0 },
    { x: 0.5, red: 0 },
    { x: 0.6, red: 0 },
    { x: 0.7, red: 0 },
    { x: 0.8, red: 0 },
    { x: 0.9, red: 0 },
    { x: 1.0, red: 0 },
    { x: 1.1, red: 0 },
    { x: 1.2, red: 0 },
    { x: 1.3, red: 0 },
    { x: 1.4, red: 0 },
    { x: 1.5, red: 0 },
    { x: 1.6, red: 0 },
    { x: 1.7, red: 0 },
    { x: 1.8, red: 0 },
    { x: 1.9, red: 0 },
    { x: 2.0, red: 0 },
];
var datavg = [
    // { x: 0, red: 0 },
    // { x: 1, red: 4 },
    // { x: 2, red: 10 },
    // { x: 3, red: 18 },
    // { x: 4, red: 32 },
    // { x: 5, red: 56 },
    // { x: 6, red: 80 },
    { x: 0.0, red: 0 },
    { x: 0.1, red: 0 },
    { x: 0.2, red: 0 },
    { x: 0.3, red: 0 },
    { x: 0.4, red: 0 },
    { x: 0.5, red: 0 },
    { x: 0.6, red: 0 },
    { x: 0.7, red: 0 },
    { x: 0.8, red: 0 },
    { x: 0.9, red: 0 },
    { x: 1.0, red: 0 },
    { x: 1.1, red: 0 },
    { x: 1.2, red: 0 },
    { x: 1.3, red: 0 },
    { x: 1.4, red: 0 },
    { x: 1.5, red: 0 },
    { x: 1.6, red: 0 },
    { x: 1.7, red: 0 },
    { x: 1.8, red: 0 },
    { x: 1.9, red: 0 },
    { x: 2.0, red: 0 },
];
var dataBVD = [
    { x: 0, red: 0 },
    { x: 0, red: 0 },
];
var dataBVG = [
    { x: 0, red: 0 },
    { x: 0, red: 0 },
];


var idvdChart = new Chart(ctx, {
    // type: 'line',
    type: 'scatter',
    data: {
        //labels: [0, 1, 2, 3, 4, 5, 6],
        datasets: [
            {
                label: 'Red',
                borderColor: '#aaa',

                data: data,
                parsing: { yAxisKey: 'red' },
                showLine: true,
                tension: 0.3,
                pointRadius: 2,
            },
            {
                label: 'blue',
                borderColor: '#0f0',
                data: dataBVD,
                parsing: { yAxisKey: 'red' },
                showLine: true,
                tension: 0.3,
                pointRadius: 8,
            }
        ],
    },
    options: {

        animation: false,
        maintainAspectRatio: true,
        scales: {
            x: {
                min: 0,
                max: 2,
                ticks: {
                    stepSize: 0.05 * 6,
                    // maxTicksLimit: 100,
                },
            },
            y: {
                min: 0,
                max: 2,
                ticks: {
                    stepSize: 5,
                    //display: false,
                },
            },
        },
        plugins: {
            legend: {
                display: false,
            }
        },
    },
});
ctx.parentNode.style.width = '20%';

var idvgChart = new Chart(vgx, {
    type: 'scatter',
    data: {
        //labels: [0, 1, 2, 3, 4, 5, 6],
        datasets: [
            {
                label: 'Red',
                borderColor: '#aaa',
                data: datavg,
                parsing: { yAxisKey: 'red' },
                showLine: true,
                tension: 0.4,
                pointRadius: 2,
            },
            {
                label: 'blue',
                borderColor: '#0f0',
                data: dataBVG,
                parsing: { yAxisKey: 'red' },
                showLine: true,
                tension: 0.3,
                pointRadius: 8,
            }
        ],
    },
    options: {
        animation: false,
        maintainAspectRatio: true,
        scales: {
            x: {
                min: 0,
                max: 2,
                ticks: {
                    stepSize: 0.05 * 6,
                    // maxTicksLimit: 100,
                },
            },
            y: {
                min: 0,
                max: 2,
                ticks: {
                    stepSize: 5,
                    //display: false,
                },
            },
        },
        plugins: {
            legend: {
                display: false,
            }
        },
    },
});
//ctx.parentNode.style.width = '20%';
//ctx.parentNode.style.height = '40vh';
//vgx.parentNode.style.width = '20%';
vgx.parentNode.style.width = '20%';
//vgx.parentNode.style.height = '40vh';
//vgx.parentNode.style.height = '40vh';