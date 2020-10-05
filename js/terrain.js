class Terrain {
    constructor(size) {
        this.size = size;
        this.geometry = new THREE.Geometry();
        this.heightMap = new Array(size * size);
        this.max = 0;
        this.min = 0;

        // Creating the verticies set
        for(var x = 0; x < size; x++) {
            for(var z = 0; z < size; z++) {
                var y = Math.floor(Math.random() * 15);
                this.geometry.vertices.push(new THREE.Vector3(x, 0, z));
            }
        }

        // Creating the faces set
        const LIMIT = (size * size) - size;
        for(var i = 0; i < LIMIT; i += size) {
            for(var j = 0; j < (size - 1); j++) {
                var face1 = new THREE.Face3(i + j, i + j + 1, i + j + size)
                face1.color.setHex(0.8 * 0xffffff);

                var face2 = new THREE.Face3(i + j + 1, i + j + size + 1, i + j + size)
                face2.color.setHex(0.8 * 0xffffff);
                
                this.geometry.faces.push(face1, face2);
            }
        }

        this.geometry.elementsNeedUpdate = true;
        this.geometry.computeFaceNormals();
        
        this.mesh = new THREE.Mesh(
            this.geometry,
            new THREE.MeshPhongMaterial({
                wireframe: true,
                vertexColors: THREE.FaceColors,
                side: THREE.DoubleSide,
                flatShading: false,  
            })
        );

        const HALF_SIZE = Math.floor(size / 2);
        this.mesh.position.set(-HALF_SIZE, 0, -HALF_SIZE);
    }

    getMesh() {
        return this.mesh;
    }

    getGeometry() {
        return this.geometry;
    }

    getVertices() {
        return this.vertices;
    }

    setVertexHeights(heightMap) {
        for(var i = 0; i < this.geometry.vertices.length; i++) {
            var val = heightMap[i] * 250;
            this.max = this.max < val ? val : this.max;
            this.min = this.min > val ? val : this.min; 
            this.geometry.vertices[i].setComponent(1, val);
        }

        console.log(this.max)

        this.geometry.verticesNeedUpdate = true;
        this.geometry.computeVertexNormals(true);
        this.geometry.computeFaceNormals(true);
        this.mesh.updateMatrix();
    }

    setFaceColors() {

        function setFaceColor(face, val, max, min) {
            var increment = (max - min) / 10;
            if(val < min + increment) {
                face.color.setHex(0x013c4e);
            } else if (val < min + increment * 2) {
                face.color.setHex(0x00475d);
            } else if (val < min + increment * 3) {
                face.color.setHex(0x2aa094);
            } else if (val < min + increment * 4) {
                face.color.setHex(0x276234);
            } else if (val < min + increment * 5) {
                face.color.setHex(0x2e733d);
            } else if (val < min + increment * 6) {
                face.color.setHex(0x809e54);
            } else if (val < min + increment * 7) {
                face.color.setHex(0xb3ae77);
            } else if (val < min + increment * 8) {
                face.color.setHex(0xcfb49f);
            } else if (val < min + increment * 9) {
                face.color.setHex(0xe7c9b2);
            } else {
                face.color.setHex(0xffffff);
            }
        }

        for(var i = 0; i < this.geometry.faces.length; i++) {
            var face = this.geometry.faces[i];
            var avg = (this.geometry.vertices[face.a].y +
                this.geometry.vertices[face.a].y +
                this.geometry.vertices[face.a].y) / 3;
                setFaceColor(face, avg, this.max, this.min);
        }

        this.geometry.elementsNeedUpdate = true;
        this.geometry.computeFaceNormals();
    }
}