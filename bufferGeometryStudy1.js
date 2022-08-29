window.addEventListener('DOMContentLoaded', init);


function init() {
	const scene = new THREE.Scene();
	const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
	camera.position.set(0,0,+10);

	const renderer = new THREE.WebGLRenderer({
		canvas: document.querySelector('#myCanvas')
	});
	renderer.setSize(window.innerWidth, window.innerHeight-40);

	//並行光源を作成
	const directionalLight = new THREE.DirectionalLight(0xFFFFFF);
	directionalLight.position.set(1,1,1);
	//シーンに光源を追加
	scene.add(directionalLight);


	

	//バッファーオブジェクトの生成
	const geometry = new THREE.BufferGeometry();

	//型付配列で頂点座標を設定
	const vertices = new Float32Array([
		-1.0, -1.0, 1.0,
		1.0, -1.0, 1.0,
		1.0, 1.0, 1.0,
	]);

	//バッファーオブジェクトのattributeに頂点座標を設定
	geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));

	const material = new THREE.MeshBasicMaterial({ color: 0xFFFFFF });
	const mesh = new THREE.Mesh(geometry, material);
	scene.add(mesh);


	//daeファイルローダー
	const loader = new THREE.ColladaLoader();
	loader.load('./models/test.dae', (collada) => {
		const model = collada.scene;
		scene.add(model)
	});



	//レンダリング処理
	function rendering() {
		requestAnimationFrame(rendering);
		renderer.render(scene, camera);
	}
	rendering();
}