//ページの読み込みを待つ
window.addEventListener('DOMContentLoaded', init);

//サイズを指定
const width = window.outerWidth;
const height = window.outerHeight;

function init() {
	//レンダラーを作成
	const renderer = new THREE.WebGLRenderer({
		canvas: document.querySelector('#myCanvas')
	});
	renderer.setSize(width,height);

	//シーンを作成
	const scene = new THREE.Scene();

	//カメラを作成
	const camera = new THREE.PerspectiveCamera(45, width / height, 1, 10000);
	camera.position.set(0,0, +1000);


	//球体を作成
	const geometry = new THREE.SphereGeometry(300,30,30);
	//画像を読み込む
	const loader = new THREE.TextureLoader();
	const texture = loader.load('imgs/earthmap1k.jpg');
	//マテリアルにテクスチャを指定
	const material = new THREE.MeshStandardMaterial({map: texture});
	//メッシュを作成
	const mesh = new THREE.Mesh(geometry,material);
	//シーンにメッシュを追加
	scene.add(mesh);


	//並行光源を作成
	const directionalLight = new THREE.DirectionalLight(0xFFFFFF);
	directionalLight.position.set(1,1,1);
	//シーンに光源を追加
	scene.add(directionalLight);

	//毎フレーム実行する関数（init()の下に宣言してます。）
	tick();

	function tick() {
		mesh.rotation.y += 0.01;
		renderer.render(scene, camera);
		requestAnimationFrame(tick);
	}
}