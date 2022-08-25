const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

// const geometry = new THREE.BoxGeometry( 1, 1, 1 );
// const material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
// const cube = new THREE.Mesh( geometry, material );
// scene.add( cube );

const bufferGeometry = new THREE.BufferGeometry();
// create a simple square shape. We duplicate the top left and bottom right
// vertices because each vertex needs to appear once per triangle.
const vertices = new Float32Array( [
    -1, -1, 1, 1, -1, 1, -1, 1,  1,
    -1,  1, 1, 1, -1, 1,  1, 1,  1,
] );

// itemSize = 3 because there are 3 values (components) per vertex
bufferGeometry.setAttribute( 'position', new THREE.BufferAttribute( vertices, 3 ) );
const bufferMaterial = new THREE.MeshBasicMaterial( { color: 0x990000,wireframe:true } );
const mesh = new THREE.Mesh( bufferGeometry, bufferMaterial );
scene.add(mesh);



camera.position.z = 4;

function animate() {
	requestAnimationFrame( animate );
    mesh.rotation.x += 0.01;
    mesh.rotation.y += 0.01;
    mesh.rotation.z += 0.005;
	renderer.render( scene, camera );
}
animate();