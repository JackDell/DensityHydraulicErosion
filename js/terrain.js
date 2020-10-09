class Terrain {
    constructor(size) {
        this.max = 0;
        this.min = 0;

        this.size = size;
        this.geometry = new THREE.Geometry();
        this.initGeometry(size);
        
        this.mesh = new THREE.Mesh(
            this.geometry,
            new THREE.MeshPhongMaterial({
                vertexColors: THREE.FaceColors,
                side: THREE.DoubleSide,
                flatShading: false,  
            })
        );

        const HALF_SIZE = Math.floor(size / 2);
        this.mesh.position.set(-HALF_SIZE, 50, -HALF_SIZE);
    }

    initGeometry(size) {
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
    }

    getMesh() {
        return this.mesh;
    }

    getGeometry() {
        return this.geometry;
    }

    getVertices() {
        return this.geometry.vertices;
    }

    setVertexHeights(heightMap) {
        this.max = 0;
        this.min = 0;

        for(var i = 0; i < this.geometry.vertices.length; i++) {
            var val = heightMap[i] * 250;
            this.max = this.max < val ? val : this.max;
            this.min = this.min > val ? val : this.min; 
            this.geometry.vertices[i].setComponent(1, val);
        }

        this.geometry.verticesNeedUpdate = true;
        this.geometry.computeVertexNormals(true);
        this.setFaceColors();
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

        function setOneColor(face, val, max, min) {
            face.color.setHex(0xe7c9b2);
        }

        for(var i = 0; i < this.geometry.faces.length; i++) {
            var face = this.geometry.faces[i];
            var avg = (this.geometry.vertices[face.a].y +
                this.geometry.vertices[face.a].y +
                this.geometry.vertices[face.a].y) / 3;
                setOneColor(face, avg, this.max, this.min);
        }

        this.geometry.elementsNeedUpdate = true;
        this.geometry.computeFaceNormals();
    }

    calcHeightGradient2(droplet) {
        var coordX = Math.floor(droplet.pos.x);
        var coordY = Math.floor(droplet.pos.y);
        
        var deltaX = droplet.pos.x - coordX;
        var deltaY = droplet.pos.y - coordY;


        //     NW            NE
        //      .------------.
        //      |            |
        //      |            |
        //      |            |
        //      |            |
        //      .------------.
        //     SW            SE

        // coordX & coordY now give us the position for SW corner of cell

        var vertexIndex = coordY * this.size - 1 + coordX;

        if(vertexIndex + this.size + 1 > this.geometry.vertices.length - 1) {
            console.log(coordX, coordY, vertexIndex, vertexIndex + this.size + 1, this.geometry.vertices.length - 1);
        }

        // (x, y)
        var heightSW = this.geometry.vertices[vertexIndex].y;
        // (x+1, y)
        var heightSE = this.geometry.vertices[vertexIndex + 1].y;
        // (x, y+1)
        var heightNW = this.geometry.vertices[vertexIndex + this.size].y;
        // (x+1, y+1)
        var heightNE = this.geometry.vertices[vertexIndex + this.size + 1].y;

        var gradientX = (heightSE - heightSW) * (1 - deltaY) + (heightNE - heightNW) * deltaY;
        var gradientY = (heightNW - heightSW) * (1 - deltaX) + (heightNE - heightSE) * deltaX;

        var height = heightSW * (1 - deltaX) * (1 - deltaY) +
            heightSE * deltaX * (1 - deltaY) +
            heightNW * (1 - deltaX) * deltaY + 
            heightNE * deltaX * deltaY;

        var data = {
            height: height,
            gradX: gradientX,
            gradY: gradientY
        };

        return data;
    }

    getErosionData(coordX, coordY, radius) {
        var centerX = coordX + 0.5;
        var centerY = coordY + 0.5;
        var weightSum = 0;
        var weights = new Array();
        var locs = new Array();
        var output = new Array();

        for(var x = -radius; x < radius; x++) {
            for(var y = -radius; y < radius; y++) {
                var newX = coordX + x;
                var newY = coordY + y;

                if(newX < 0 || newX >= this.size || newY < 0 || newY >= this.size) {
                    continue;
                }

                var deltaX = Math.abs(newX - centerX);
                var deltaY = Math.abs(newY - centerY);

                var dist = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
                if(dist <= radius) {
                    var val = Math.max(0, radius - dist);
                    weightSum += val;
                    weights.push(val);
                    locs.push({x: newX, y: newY});
                }
            }
        }

        for(var i = 0; i < weights.length; i++) {
            var data = {
                x: locs[i].x,
                y: locs[i].y,
                w: weights[i] / weightSum
            }

            output.push(data);
        }

        return output;
    }


    erode() {
        const iterations = 8;
        const maxDropletLifespan = 60;
        const INERTIA = 0.06;

        const sedimentCapacityFactor = 4;
        const minSedimentCapacity = 0.01;

        const EROSION_SPEED = 0.3;
        const EROSION_RADIUS = 4;

        const DEPOSIT_SPEED = 0.3;
        const EVAPORATION_SPEED = 0.1;

        const INITAL_VELOCITY = 1.0;
        const INITAL_WATER_VOLUME = 1.0;

        const MIN_SLOPE = 0.01;

        const MAX_CAPACITY = 8;

        const GRAVITY = -4;

        const LIMIT = this.size - 1;
        var droplet = {
            pos: new THREE.Vector2(Math.random() * LIMIT, Math.random() * LIMIT),
            dir: new THREE.Vector2(),
            vel: INITAL_VELOCITY,
            water: INITAL_WATER_VOLUME,
            sediment: 0.0
        };

        for(var k = 0; k < maxDropletLifespan; k++) {
            var coordX = Math.floor(droplet.pos.x);
            var coordY = Math.floor(droplet.pos.y);
            var offsetX = droplet.pos.x - coordX;
            var offsetY = droplet.pos.y - coordY;
            var dropletIndex = coordY * this.size + coordX;

            if((droplet.dir.x == 0 && droplet.dir.y == 0 && k > 0) ||
                droplet.pos.x >= this.size - 1 ||
                droplet.pos.x < 0 ||
                droplet.pos.y >= this.size - 1 ||
                droplet.pos.y < 0) {
                break;
            }
            var hg = this.calcHeightGradient2(droplet);

            droplet.dir.x = (droplet.dir.x * INERTIA) - (hg.gradX * (1 - INERTIA));
            droplet.dir.y = (droplet.dir.y * INERTIA) - (hg.gradY * (1 - INERTIA));

            // normalizing direction vector
            var hyp = Math.sqrt(droplet.dir.x * droplet.dir.x + droplet.dir.y * droplet.dir.y);
            if(hyp != 0) {
                droplet.dir.x /= hyp;
                droplet.dir.y /= hyp;
            }

            // Adding the velocity to the position
            droplet.pos.x += droplet.dir.x;
            droplet.pos.y += droplet.dir.y;

            // If position increment pushing droplet off x or y edge, break
            if((droplet.dir.x == 0 && droplet.dir.y == 0) ||
                droplet.pos.x >= this.size - 1 ||
                droplet.pos.x < 0 ||
                droplet.pos.y >= this.size - 1 ||
                droplet.pos.y < 0) {
                break;
            }

            // Getting the height and gradient of the new position
            var newHg = this.calcHeightGradient2(droplet);
            var deltaHeight = newHg.height - hg.height;

            var sedCapacity = Math.max(-deltaHeight, MIN_SLOPE) * droplet.vel * droplet.water * MAX_CAPACITY;

            if(deltaHeight > 0 || droplet.sediment > sedCapacity) {
                var depositAmount = deltaHeight > 0 ? Math.min(deltaHeight, droplet.sediment) : (droplet.sediment - sedCapacity) * DEPOSIT_SPEED;

                // SW
                this.geometry.vertices[dropletIndex].y += depositAmount * (1 - offsetX) * (1 - offsetY);
                // SE
                this.geometry.vertices[dropletIndex + 1].y += depositAmount * offsetX * (1 - offsetY);
                // NW
                this.geometry.vertices[dropletIndex + this.size].y += depositAmount * (1 - offsetX) * offsetY;
                // NE
                this.geometry.vertices[dropletIndex + this.size + 1].y += depositAmount * offsetX * offsetY;

                droplet.sediment -= depositAmount;
            }
            // Droplet is moving downhill and has less sediment then its capacity allows
            else {
                var erodeAmount = Math.min((sedCapacity - droplet.sediment) * EROSION_SPEED, -deltaHeight);

                // SW
                //this.geometry.vertices[dropletIndex].y -= erodeAmount * (1 - offsetX) * (1 - offsetY);
                // SE
                //this.geometry.vertices[dropletIndex + 1].y -= erodeAmount * offsetX * (1 - offsetY);
                // NW
                //this.geometry.vertices[dropletIndex + this.size].y -= erodeAmount * (1 - offsetX) * offsetY;
                // NE
                //this.geometry.vertices[dropletIndex + this.size + 1].y -= erodeAmount * offsetX * offsetY;
                
                var erosionPoints = this.getErosionData(coordX, coordY, EROSION_RADIUS);
                for(var j = 0; j < erosionPoints.length; j++) {
                    var point = erosionPoints[j];
                    var index = point.y * this.size + point.x;
                    //console.log(point.x, point.y, index, this.geometry.vertices.length);
                    var weighedErodeAmount = point.w * erodeAmount;
                    this.geometry.vertices[index].y -= weighedErodeAmount;
                    droplet.sediment += weighedErodeAmount;
                }
            }

            droplet.vel = Math.sqrt(droplet.vel * droplet.vel + Math.abs(deltaHeight * GRAVITY));
            droplet.water *= (1 - EVAPORATION_SPEED);

            this.geometry.verticesNeedUpdate = true;
            this.geometry.computeVertexNormals(true);

            //console.log(droplet.pos.x, droplet.pos.y, droplet.dir.x, droplet.dir.y, droplet.vel, droplet.water, droplet.sediment);
        }
    }
}