import * as THREE from 'three';
import { FontLoader } from '../node_modules/three/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from '../node_modules/three/examples/jsm/geometries/TextGeometry.js';
import { GUI } from '../node_modules/three/examples/jsm/libs/lil-gui.module.min.js';
import { OrbitControls } from '../node_modules/three/examples/jsm/controls/OrbitControls.js';
//import { TransformControls } from '../node_modules/three/examples/jsm/controls/TransformControls.js';


/*--------------------変数の宣言--------------------*/

// 文字
let textMetal = "Metal";
let textOxide = "Oxide";
let textSilicon = "Semicond.";
let textGate = "G a t e";
let textSource = "S o u r c e";
let textDrain = "D r a i n";
const font = "gothic";
const size = 25;
const height = 5;
const curveSegments = 2;
const bevelThickness = 2;
const bevelSize = 1.5;
const bevelEnabled = true;

// 頂点バッファ(頂点座標の格納)
let ver00 = [];
let ver02 = [];
let ver20 = [];

//各軸の頂点数
const N = 6803;

//刻み幅(使ってない)
const dt = Math.PI / 8;

//計算式の最大値(使ってない)
const MAX = 400;


//計算した頂点の格納
const vertices = [];
//頂点カラーの格納
const Cvert = [];
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
scene.background = new THREE.Color(0xeeeeee);
// scene.background = new THREE.Color(0x000000);
//カメラ
const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 10000);
camera.position.set(0, 250, 375);
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
//scene.add(helper);


//ここから3Dテキストの作成
const loader = new FontLoader();

loader.load('../node_modules/three/examples/fonts/helvetiker_regular.typeface.json', (font) => {
    const geoMetalText = new TextGeometry(textMetal, {
        font: font,
        size: size,
        height: height,
        curveSegments: curveSegments,

        bevelThickness: bevelThickness,
        bevelSize: bevelSize,
        bevelEnabled: bevelEnabled

    });
    const geoOxideText = new TextGeometry(textOxide, {
        font: font,
        size: size,
        height: height,
        curveSegments: curveSegments,

        bevelThickness: bevelThickness,
        bevelSize: bevelSize,
        bevelEnabled: bevelEnabled

    });
    const geoSiliconText = new TextGeometry(textSilicon, {
        font: font,
        size: size,
        height: height,
        curveSegments: curveSegments,

        bevelThickness: bevelThickness,
        bevelSize: bevelSize,
        bevelEnabled: bevelEnabled

    });
    const geoGateText = new TextGeometry(textGate, {
        font: font,
        size: size,
        height: height-3,
        curveSegments: curveSegments,

        bevelThickness: bevelThickness,
        bevelSize: bevelSize,
        bevelEnabled: bevelEnabled

    });
    const geoSourceText = new TextGeometry(textSource, {
        font: font,
        size: size,
        height: height-3,
        curveSegments: curveSegments,

        bevelThickness: bevelThickness,
        bevelSize: bevelSize,
        bevelEnabled: bevelEnabled

    });
    const geoDrainText = new TextGeometry(textDrain, {
        font: font,
        size: size,
        height: height-3,
        curveSegments: curveSegments,

        bevelThickness: bevelThickness,
        bevelSize: bevelSize,
        bevelEnabled: bevelEnabled

    });
    const matMetalText = new THREE.MeshMatcapMaterial({ color: 0xd0d0d0 });
    const matOxideText = new THREE.MeshMatcapMaterial({ color: 0xffffff });
    const matSiliconText = new THREE.MeshMatcapMaterial({ color: 0x60f0ff });
    // const matGSDText = new THREE.MeshBasicMaterial({ color: 0xfaffff });
    const matGSDText = new THREE.MeshMatcapMaterial({ color: 0x888888 });
    const meshMetalText = new THREE.Mesh(geoMetalText, matMetalText);
    const meshOxideText = new THREE.Mesh(geoOxideText, matOxideText);
    const meshSiliconText = new THREE.Mesh(geoSiliconText, matSiliconText);
    const meshGateText = new THREE.Mesh(geoGateText, matGSDText);
    const meshSourceText = new THREE.Mesh(geoSourceText, matGSDText);
    const meshDrainText = new THREE.Mesh(geoDrainText, matGSDText);

    meshMetalText.position.set(-200, 200, 0);
    meshOxideText.position.set(-85, 200, 0);
    meshSiliconText.position.set(100, 200, 0);
    meshGateText.position.set(-150, 0, 50);
    meshSourceText.position.set(50, 0, -110);
    meshDrainText.position.set(50, 0, 250);
    meshGateText.rotation.set(-3.14/2, 0, 3.14/2);
    meshSourceText.rotation.set(-3.14/2, 0, 3.14/2);
    meshDrainText.rotation.set(-3.14/2, 0, 3.14/2);
    scene.add(meshMetalText);
    scene.add(meshOxideText);
    scene.add(meshSiliconText);
    scene.add(meshGateText);
    scene.add(meshSourceText);
    scene.add(meshDrainText);
});









// ここから3Dバンド図の作成
// 形状データを作成
const geometry = new THREE.BufferGeometry();
// 材質データを作成
const material = new THREE.PointsMaterial({
    // 一つ一つのサイズ
    size: 3,
    // 頂点カラーの使用宣言
    vertexColors: true,
});
// 物体を作成
const mesh = new THREE.Points(geometry, material);
mesh.position.z = -250;
scene.add(mesh); // シーンは任意の THREE.Scene インスタンス



//GUIのパラメータ
let Gslider = 0.0;
let Dslider = 0.0;
const params = {
    GateVoltage: 0.0,
    DrainVoltage: 0.0,
};
//GUIの設定
const gui = new GUI({
    width: 400,
});
// gui.width = "800px";
//onChange(event) => 値が変更されるたびにonChange内のeventが呼び出される。
//gui.add（object , property , min , max ,`step`）
//第五引数のstepはstep()で設定でき、可読性も高いので、step()で設定しています。
gui.add(params, 'GateVoltage', 0, 2).step(0.1).onChange(function (value) {

    Gslider = value;

    for (let i = 0; i < data.length; i++) {
        if (Gslider < V_th) {
            data[i].red = 0;
        }
        else if (data[i].x < (Gslider - V_th)) {
            data[i].red = (Gslider - V_th) * data[i].x - ((data[i].x) ** 2) / 2;
        }
        else if (data[i].x >= (Gslider - V_th)) {
            data[i].red = ((Gslider - V_th) ** 2) / 2;
        }
    };

    dataBVG[0].x = Gslider;
    dataBVG[1].x = Gslider;
    let vgnum = parseFloat(Gslider * 10);
    let vdnum = parseFloat(Dslider * 10);
    dataBVG[1].red = datavg[vgnum].red;
    dataBVD[1].red = data[vdnum].red;

    idvdChart.update();
    idvgChart.update();

    vertices.length = 0; //点群を初期化
    Cvert.length = 0; //頂点カラーを初期化

    addPoints();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(Cvert, 3));
    render();

});
gui.add(params, 'DrainVoltage', 0, 2).step(0.1).onChange(function (value) {

    Dslider = value;

    for (let i = 0; i < datavg.length; i++) {
        if (datavg[i].x < V_th) {
            datavg[i].red = 0;
        }
        else if (Dslider < (datavg[i].x - V_th)) {
            datavg[i].red = (datavg[i].x - V_th) * Dslider - ((Dslider) ** 2) / 2;
        }
        else if (Dslider >= (datavg[i].x - V_th)) {
            datavg[i].red = ((datavg[i].x - V_th) ** 2) / 2;
        }
    };

    dataBVD[0].x = Dslider;
    dataBVD[1].x = Dslider;
    let vgnum = parseFloat(Gslider * 10);
    let vdnum = parseFloat(Dslider * 10);

    dataBVG[1].red = datavg[vgnum].red;
    dataBVD[1].red = data[vdnum].red;

    idvgChart.update();
    idvdChart.update();

    vertices.length = 0; //点群を初期化
    Cvert.length = 0; //頂点カラーを初期化
    addPoints();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(Cvert, 3));

    render();

});
gui.open();





/*--------------------関数--------------------*/

function init() {
    /*----------初期化処理----------*/
    console.log("init");

}

function getCsv() {
    console.log("getCSV");
    let req00 = new XMLHttpRequest();
    let req02 = new XMLHttpRequest();
    let req20 = new XMLHttpRequest();

    // req00.open("get", "../data/poten2d_0V-0V.csv", true);
    req00.open("get", "../data/poten2d_0v0v.csv", true);
    req00.send(null);
    req00.onload = function () {
        console.log("onload00");
        ver00 = convertCsvToArray(req00.responseText);
    }

    // req02.open("get", "../data/poten2d_0V-2V.csv", true);
    req02.open("get", "../data/poten2d_0v2v.csv", true);
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
    //console.log("addPoints");

    //線形補間
    for (let i = 0; i < ver02.length; i = i + 3) {
        const x = i >= 107 * 3 * 56 ? parseFloat(ver00[i]) * 4 + 250 : parseFloat(ver00[i]) * 20;
        const y = parseFloat(ver00[i + 1]) * 5;
        // const z = parseFloat(ver00[i + 2] * 20 - ((ver00[i + 2] - ver02[i + 2]) * Dslider * 10 + (ver00[i + 2] - ver20[i + 2]) * Gslider * 22));
        const z = parseFloat(ver00[i + 2] * 24 * 5 - ((ver00[i + 2] - ver02[i + 2]) * 5 * Dslider * 10 + (ver00[i + 2] * 5 - ver20[i + 2]) * Gslider * 20));

        vertices.push(x, z, y);

        if (i < 107 * 3 * 11) {
            Cvert.push(80 / 255, 80 / 255, 80 / 255);
            // Cvert.push(155 / 255, 168 / 255, 170 / 255);
        }
        else if (i >= 107 * 3 * 11 && i < 107 * 3 * 31) {
            Cvert.push(255/255, 80/255, 80/255);
            // Cvert.push(1, 1, 1);
        } else {
            Cvert.push(0, 1.5 - z / 10, (z - 2) / 10);
        }
    }
}

//レンダリング時に実行したい処理をここに書く
function render() {

    mesh.geometry.attributes.position.needsUpdate = true;
    mesh.geometry.attributes.color.needsUpdate = true;

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

    setTimeout(() => {
        resolve();
    }, 1000);

})
    .then(() => {

        addPoints();
        //console.log(ver02.length);

        // // 形状データを作成
        // const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
        geometry.setAttribute('color', new THREE.Float32BufferAttribute(Cvert, 3));


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

idvgCanvas = document.createElement("canvas");
idvgCanvas.id = 'idvgcanvas';

chartCanvas = document.createElement("canvas");
chartCanvas.id = 'chartcanvas';



var cbox = document.getElementById('container');
cbox.appendChild(idvgCanvas);

cbox.appendChild(chartCanvas);
//var idvgbox = document.getElementById('container');


var ctx = document.querySelector("#chartcanvas");
var vgx = document.querySelector("#idvgcanvas");
ctx.width = 1;
ctx.height = 1;
vgx.width = 1;
vgx.height = 1


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


var idvgChart = new Chart(vgx, {
    type: 'scatter',
    data: {
        //labels: [0, 1, 2, 3, 4, 5, 6],
        datasets: [
            {
                label: 'Red',
                borderColor: '#000',
                data: datavg,
                parsing: { yAxisKey: 'red' },
                showLine: true,
                tension: 0.4,
                pointRadius: 2,
            },
            {
                label: 'blue',
                borderColor: '#f00',
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
                title: {
                    display: true,
                    fontColor: "white",
                    text: 'Gate Voltage[V]'
                },
            },
            y: {
                min: 0,
                max: 1.5,
                ticks: {
                    stepSize: 0.5,
                    //display: false,
                },
                title: {
                    display: true,
                    text: 'Drain Current[A]'
                },
            },
        },
        plugins: {
            title: {
                display: true,
                position: "top",
                fontColor: "white",
                fontStyle: "bold",
                text: "Id-Vg Graph",
            },
            legend: {
                display: false,
            },
        },
    },
});

var idvdChart = new Chart(ctx, {
    // type: 'line',
    type: 'scatter',
    data: {
        //labels: [0, 1, 2, 3, 4, 5, 6],
        datasets: [
            {
                label: 'Red',
                borderColor: '#000',

                data: data,
                parsing: { yAxisKey: 'red' },
                showLine: true,
                tension: 0.3,
                pointRadius: 2,
            },
            {
                label: 'blue',
                borderColor: '#f00',
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
                title: {
                    display: true,
                    text: 'Drain Voltage[V]'
                },
            },
            y: {
                min: 0,
                max: 1.5,
                ticks: {
                    stepSize: 0.5,
                    //display: false,
                },
                title: {
                    display: true,
                    text: 'Drain Current[A]'
                },
            },
        },
        plugins: {
            title: {
                display: true,
                position: "top",
                fontColor: "white",
                fontStyle: "bold",
                text: "Id-Vd Graph",
            },
            legend: {
                display: false,
            },
        },
    },
});
//ctx.parentNode.style.width = '20%';


//ctx.parentNode.style.width = '20%';
//ctx.parentNode.style.height = '40vh';
//vgx.parentNode.style.width = '20%';
//ctx.parentNode.style.width = '19vw';
vgx.parentNode.style.width = '19vw';
