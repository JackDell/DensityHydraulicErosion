const SIZE = 16;

var camera, controls, scene, renderer;

init();
render();

function init() {
    camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 1000);
    camera.position.z = 1;

    scene = new THREE.Scene();

    const color = 0xFFFFFF;
    const intensity = 1;
    const light = new THREE.DirectionalLight(color, intensity);
    light.position.set(-1, 2, 4);
    scene.add(light);

    initMesh();

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    controls = new THREE.OrbitControls( camera, renderer.domElement );
    controls.update();
}

/**
 * Creates a mesh of triangles
 */
function initMesh() {
    const geometry = new THREE.Geometry();

    // Creating the verticies set
    for(var x = 0; x < SIZE; x++) {
        for(var y = 0; y < SIZE; y++) {
            var z = Math.floor(Math.random() * 3);
            geometry.vertices.push(new THREE.Vector3(x, y, z));
        }
    }

    // Creating the faces set
    const LIMIT = (SIZE * SIZE) - SIZE;
    for(var i = 0; i < LIMIT; i += SIZE) {
        for(var j = 0; j < (SIZE - 1); j++) {
            var face1 = new THREE.Face3(i + j, i + j + 1, i + j + SIZE)
            face1.color.setHex(Math.random() * 0xffffff);

            var face2 = new THREE.Face3(i + j + 1, i + j + SIZE + 1, i + j + SIZE)
            face2.color.setHex(Math.random() * 0xffffff);
            
            geometry.faces.push(face1, face2);
        }
    }

    geometry.computeFaceNormals();
    var mesh = new THREE.Mesh(geometry, new THREE.MeshNormalMaterial({vertexColors: THREE.FaceColors, side: THREE.DoubleSide}));
    scene.add(mesh);

    console.log(mesh);
}

function render() {
    requestAnimationFrame(render);

    //mesh.rotation.x += 0.01;
    //mesh.rotation.y += 0.02;

    controls.update();

    renderer.render(scene, camera);
}