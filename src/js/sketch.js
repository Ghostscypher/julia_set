const MAX_ITERATIONS = 100;

let UPPER_BOUND = 3;
let LOWER_BOUND = -2;
let pixel_size = 1;
let line_width = 1;
let grid = [];
let julia_set_constants = [
    [0.285, 0.01],
    [0.45, 0.1428],
    [-0.70176, -0.3842],
    [-0.835, -0.2321],
    [0.35, 0.35],
    [0.4, 0.4],
    [0, 0.8],
    [-0.7269, 0.1889],
]

function setup() {
    // Set the cell size based on the window size
    createCanvas(800, 800);
    pixelDensity(1);

    // Fill the grid null values
    for (let x = 0; x < width; x++) {
        grid[x] = [];

        for (let y = 0; y < height; y++) {
            grid[x][y] = null;
        }
    }

    // Set the initial bounds
    frameRate(1);
}

let is_paused = false;

function keyPressed() {
    if (key === 'p' || key === 'P') {
        is_paused = !is_paused;

        if (is_paused) {
            noLoop();
        } else {
            loop();
        }
    }

    if (key === 'r' || key === 'R') {
        // Reset the loop
        loop();
    }

}

function renderPixel(x, y, color) {
    // console.log(color);
    let index = (x + y * width) * 4;

    pixels[index + 0] = red(color);
    pixels[index + 1] = green(color);
    pixels[index + 2] = blue(color);
    pixels[index + 3] = 255;
}

function juliaSet(constant_index = 0) {
    for (let x = 0; x < width; x++) {
        for (let y = 0; y < height; y++) {
            let a = map(x, 0, width, LOWER_BOUND, UPPER_BOUND);
            let b = map(y, 0, height, LOWER_BOUND, UPPER_BOUND);
            let ca = julia_set_constants[constant_index][0];
            let cb = julia_set_constants[constant_index][1];
            let n = 1;

            while (++n < MAX_ITERATIONS) {
                let aa = a * a - b * b;
                let bb = 2 * a * b;

                a = aa + ca;
                b = bb + cb;

                if (abs(a + b) > 4) {
                    break;
                }
            }

            let bright = map(n, 0, MAX_ITERATIONS, 0, 1);

            /**
             * Color scheme: Bernstein polynomials
             * https://en.wikipedia.org/wiki/Bernstein_polynomial
             * 
             * r(t) = 9 * (1 - t) * t3 * 255
             * g(t) = 15 * (1 -  t)^2 * t^2  *255
             * b(t) = 8.5 * (1 * t)^3  * t * 255
             */
            let c_r = 9 * (1 - bright) * bright * bright * 255;
            let c_g = 15 * (1 - bright) * (1 - bright) * bright * bright * 255;
            let c_b = 8.5 * (1 - bright) * (1 - bright) * (1 - bright) * bright * 255;

            if (n === MAX_ITERATIONS) {
                c = color(0, 0, 0);
            } else {
                c = color(c_r, c_g, c_b);
            }

            grid[x][y] = c;
        }
    }
}

let constant_index = 0;
let fps_limiter = 0;

function draw() {
    // Go the next iteration
    juliaSet(constant_index);

    // Render the pixels
    loadPixels();
    for (let x = 0; x < width; x++) {
        for (let y = 0; y <= height; y++) {
            if (!grid[x][y]) continue;

            renderPixel(x, y, grid[x][y]);
        }
    }
    updatePixels();

    // Update the frame rate
    fps_limiter++;

    if (fps_limiter >= 5) {
        fps_limiter = 0;

        // Go to the next frame
        if (constant_index++ >= julia_set_constants.length - 1) {
            constant_index = 0;
        }
    }
}