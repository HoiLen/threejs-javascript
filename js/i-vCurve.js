var chartCanvas;

chartCanvas = document.createElement("canvas");
chartCanvas.id = 'chartcanvas';

var cbox = document.getElementById('container');
cbox.appendChild(chartCanvas);

var ctx = document.querySelector("#chartcanvas");
ctx.width = 16;
ctx.height = 9;

var data = [
    { x: '0', red: 20 },
    { x: 'Th', red: 35 },
    { x: 'Over', red: 40 },
    { x: 'Over2', red: 44 },
    { x: '', red: 47 },
    { x: 'Over4', red: 49 },
    { x: 'Over5', red: 50 },
];
var myChart = new Chart(ctx, {
    type: 'line',
    data: {
        labels: ['0', 'Th', 'Over'],
        datasets: [{
            label: 'Red',
            borderColor: '#f00',
            data: data,
            parsing: { yAxisKey: 'red' },
        }
    ],
    },
});

// var graphChart = new Chart(ctx, {
//     type: 'line',
//     data: {
//         labels: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
//         datasets: [{
//             label: 'Red',
//             data: [20, 35, 40, 30, 45, 35, 40],
//             // データライン
//             borderColor: '#f88',
//         }, {
//             label: 'Green',
//             data: [20, 15, 30, 25, 30, 40, 35],
//             borderColor: '#484',
//         }, {
//             label: 'Blue',
//             data: [30, 25, 10, 5, 25, 30, -20],
//             borderColor: '#48f',
//         }],
//     },
//     options: {
//         // layout: {
//         //     padding: {

//         //     },
//         // },
//         plugins: {
//             // グラフタイトル
//             title: {
//                 display: true,
//                 text: 'I-V Curve',
//                 color: 'white',
//                 padding: { top: 5, bottom: 5 },
//                 font: {
//                     family: '"Arial", "Times New Roman"',
//                     size: 12,
//                 },
//             },
//             // 凡例
//             legend: {
//                 position: 'left',
//                 align: 'start',
//                 // 凡例ラベル
//                 labels: {
//                     boxWidth: 20,
//                     boxHeight: 8,
//                 },
//                 // 凡例タイトル
//                 title: {
//                     display: true,
//                     text: 'Legend',
//                     padding: { top: 20 },
//                 },
//             },
//             // ツールチップ
//             tooltip: {
//                 backgroundColor: '#933',
//             },
//         },
//         scales: {
//             y: {
//                 // 最小値・最大値
//                 min: 0,
//                 max: 60,
//                 // 軸タイトル
//                 title: {
//                     display: true,
//                     text: 'Scale Title',
//                     color: 'blue',
//                 },
//                 // 目盛ラベル
//                 ticks: {
//                     color: 'blue',
//                     stepSize: 20,
//                     showLabelBackdrop: true,
//                     backdropColor: '#ddf',
//                     backdropPadding: { x: 4, y: 2 },
//                     major: {
//                         enabled: true,
//                     },
//                     align: 'end',
//                     crossAlign: 'center',
//                     sampleSize: 4,
//                 },
//                 grid: {
//                     // 軸線
//                     borderColor: 'orange',
//                     borderWidth: 2,
//                     drawBorder: true,
//                     // 目盛線＆グリッド線
//                     color: '#080',
//                     display: true,
//                     // グリッド線
//                     borderDash: [3, 3],
//                     borderDashOffset: 0,
//                     // 目盛線
//                     drawTicks: true,
//                     tickColor: 'blue',
//                     tickLength: 10,
//                     tickWidth: 2,
//                     tickBorderDash: [2, 2],
//                     tickBorderDashOffset: 0,
//                 },
//             },
//             x: {
//                 grid: {
//                     borderColor: 'orange',
//                     borderWidth: 2,
//                 },
//             },
//         },
//     },
// });


ctx.parentNode.style.width = '500px';