
const SIZE = 256;

var camera, controls, scene, renderer, terrain;
var prev_pos;

var toggles = {
    radial:true,
    erode:false
};

var one_erosion = true;

const EROSION_RATE = 30;
var erosionStep = 0;

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
    terrain = new Terrain(SIZE);
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
            if(toggles.radial) {
                terrain.setVertexHeights(NoiseManager.getRadialHeightMap(SIZE, terrain_variables));
            } else {
                terrain.setVertexHeights(NoiseManager.getHeightMap(SIZE, terrain_variables));
            }
        }
    };

    var btn2 = {
        erode: function() {
            const ITERATIONS = 1000;
            console.log("Erosion process starting");
            for(var i = 0; i < ITERATIONS; i++) {
                console.log("Erosion process " + ((i/ITERATIONS) * 100).toFixed(2) + "% complete.");
                terrain.erode();
            }
            console.log("Erosion process finished.")
        }
    };

    var btn3 = {
        capture_heights: function() {
            let csvContent = 'data:text/csv;charset=utf-8,';
            let vertices = terrain.getVertices();
            for(var i = 0; i < vertices.length; i++) {
                var vertex = vertices[i].y + ',';
                csvContent += vertex + '\r\n';
            }
            var encodedUri = encodeURI(csvContent);
            var link = document.createElement('a');
            link.setAttribute('href', encodedUri);
            link.setAttribute('download', 'heightmap.csv');
            document.body.appendChild(link);
            link.click();
        }
    };

    gui.add(terrain_variables, 'scale', 0, 10, 0.1);
    gui.add(terrain_variables, 'amplitude', 0, 5, 0.1);
    gui.add(terrain_variables, 'octaves', 0, 8, 1);
    gui.add(terrain_variables, 'persistence', 0, 5, 0.1);
    gui.add(terrain_variables, 'lacunarity', 0, 5, 0.1);
    gui.add(toggles, 'radial');
    gui.add(toggles, 'erode');
    //gui.add(toggles, 'erode');
    gui.add(btn, 'update');
    gui.add(btn2, 'erode');
    gui.add(btn3, 'capture_heights');


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
    if(toggles.erode) {
        const ITERATIONS = 10;
        console.log("Erosion process starting");
        for(var i = 0; i < ITERATIONS; i++) {
            console.log("Erosion process " + ((i/ITERATIONS) * 100).toFixed(2) + "% complete.");
            terrain.erode();
        }
        console.log("Erosion process finished.")
    }
}