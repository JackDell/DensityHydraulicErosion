class NoiseManager {
    static getHeightMap(size, options) {
        var noise = new Noise();
        noise.seed(Math.random());

        var toggle = true;

        function noise_at_coord(x, y) {
            var total = 0;
            var scale = options.scale ? options.scale * 0.005 : 0.01;
            var amplitude = options.amplitude || 2;
            var total_amplitude = 0;
            var octaves = options.octaves || 6;
            var persistence = options.persistence || 0.1 * 2;
            var lacunarity = options.lacunarity || 2;

            if(toggle) {
                console.log(scale, amplitude, octaves, persistence, lacunarity);
                toggle = false;
            }

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
}