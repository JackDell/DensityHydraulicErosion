
const SIZE = 1024;

var camera, controls, scene, renderer;
var prev_pos;

init();
render();

function init() {
    camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 5000);
    camera.position.z = -350;

    scene = new THREE.Scene();

    const color = 0xFFFFFF;
    const intensity = 0.5;
    const light = new THREE.DirectionalLight(color, intensity);
    light.position.set(0, 500, 0);
    scene.add(light);

    // TERRAIN
    var terrain = new Terrain(SIZE);
    var axes = new THREE.AxesHelper(50);
    scene.add(terrain.getMesh());
    scene.add(axes);

    // GUI
    const gui = new dat.GUI({name: 'Terrain Generation Controls'});

    // scale, amplitude, octaves persistence, lacunarity
    var terrain_variables = {
        scale: 1,
        amplitude: 3,
        octaves: 8,
        persistence: 1,
        lacunarity: 0.5
    };

    var btn = {
        update: function() {
            terrain.setVertexHeights(NoiseManager.getHeightMap(SIZE, terrain_variables));
        }
    }

    gui.add(terrain_variables, 'scale', 0, 10, 1);
    gui.add(terrain_variables, 'amplitude', 0, 5, 0.1);
    gui.add(terrain_variables, 'octaves', 0, 8, 1);
    gui.add(terrain_variables, 'persistence', 0, 5, 0.1);
    gui.add(terrain_variables, 'lacunarity', 0, 5, 0.1);
    gui.add(btn, 'update');


    terrain.setVertexHeights(NoiseManager.getHeightMap(SIZE, terrain_variables));
    terrain.setFaceColors();

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x326fa8, 1);
    document.body.appendChild(renderer.domElement);

    controls = new THREE.OrbitControls( camera, renderer.domElement );
    controls.update();
}

function render() {
    requestAnimationFrame(render);
    controls.update();
    renderer.render(scene, camera);
}