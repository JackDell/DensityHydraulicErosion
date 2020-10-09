class NoiseManager {
    static getHeightMap(size, options) {
        var noise = new Noise();
        noise.seed(Math.random());
        
        function noise_at_coord(x, y) {
            var total = 0;
            var scale = options.scale ? options.scale * 0.005 : 0.01;
            var amplitude = options.amplitude || 3;
            var total_amplitude = 0;
            var octaves = options.octaves || 8;
            var persistence = options.persistence || 1;
            var lacunarity = options.lacunarity || 0.5;

            for(var i = 0; i < octaves; i++) {
                total += noise.simplex2(x * scale, y * scale) * amplitude;

                total_amplitude += amplitude;
                amplitude *= persistence;
                scale *= lacunarity;
            }

            return total/total_amplitude;
        }

        var output = new Array(size * size);
        for(var x = 0; x < size; x++) {
            for(var y = 0; y < size; y++) {
                output[y * size + x] = noise_at_coord(x, y);
            }
        }

        return output;
    }

    static getRadialMap(size) {
        var output = new Array(size * size);
        var center = size / 2.0;
        var max;
        for(var x = 0; x < size; x++) {
            for(var y = 0; y < size; y++) {
                var d1 = center - x;
                var d2 = center - y;

                if(x == 0 && y == 0) {
                    max = Math.sqrt((d1 * d1) + (d2 * d2));
                }

                output[y * size + x] = 1 - (Math.sqrt((d1 * d1) + (d2 * d2)) / max);
            }
        }

        return output;
    }

    static getRadialHeightMap(size, options) {
        var heightMap = this.getHeightMap(size, options);
        var radialMap = this.getRadialMap(size);

        for(var i = 0; i < heightMap.length; i++) {
            heightMap[i] = heightMap[i] * radialMap[i];
        }

        return heightMap;
    }
}