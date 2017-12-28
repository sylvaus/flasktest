var Matrix = /** @class */ (function () {
    function Matrix(rows, cols, array) {
        this.rows = rows;
        this.cols = cols;
        this.array = array;
    }
    Matrix.prototype.toString = function () {
        var text = "";
        var row;
        for (row = 0; row < this.rows; row++) {
            var col = void 0;
            for (col = 0; col < this.cols; col++) {
                text += this.array[row * this.cols + col] + " ";
            }
            text += "\n";
        }
        return text;
    };
    Matrix.prototype.get = function (row, col) {
        return this.array[row * this.cols + col];
    };
    Matrix.prototype.set = function (row, col, value) {
        this.array[row * this.cols + col] = value;
    };
    Matrix.prototype.scale = function (factor) {
        return new Matrix(this.rows, this.cols, this.array.map(function (x) { return x * factor; }));
    };
    Matrix.prototype.add = function (other) {
        if (this.cols != other.cols) {
            return null;
        }
        if (this.rows != other.rows) {
            return null;
        }
        var array = [];
        var row;
        for (row = 0; row < this.rows; row++) {
            var col = void 0;
            for (col = 0; col < this.cols; col++) {
                array.push(this.get(row, col) + other.get(row, col));
            }
        }
        return new Matrix(this.rows, other.cols, array);
    };
    Matrix.prototype.sub = function (other) {
        if (this.cols != other.cols) {
            return null;
        }
        if (this.rows != other.rows) {
            return null;
        }
        var array = [];
        var row;
        for (row = 0; row < this.rows; row++) {
            var col = void 0;
            for (col = 0; col < this.cols; col++) {
                array.push(this.get(row, col) - other.get(row, col));
            }
        }
        return new Matrix(this.rows, other.cols, array);
    };
    Matrix.prototype.mult = function (other) {
        if (this.cols != other.rows) {
            return null;
        }
        var array = [];
        var row;
        for (row = 0; row < this.rows; row++) {
            var col = void 0;
            for (col = 0; col < other.cols; col++) {
                var scalar = 0;
                var index = void 0;
                for (index = 0; index < this.cols; index++) {
                    scalar += this.get(row, index) * other.get(index, col);
                }
                array.push(scalar);
            }
        }
        return new Matrix(this.rows, other.cols, array);
    };
    Matrix.prototype.subMatrixWithoutRowCol = function (remove_row, remove_col) {
        var sub_array = [];
        var new_rows = this.rows;
        var new_cols = this.cols;
        var row;
        for (row = 0; row < this.rows; row++) {
            if (row == remove_row) {
                new_rows -= 1;
                continue;
            }
            var col = void 0;
            for (col = 0; col < this.cols; col++) {
                if (col == remove_col) {
                    continue;
                }
                sub_array.push(this.array[row * this.cols + col]);
            }
        }
        if ((remove_col < this.cols) && (remove_col > -1)) {
            new_cols -= 1;
        }
        return new Matrix(new_rows, new_cols, sub_array);
    };
    Matrix.prototype.det = function () {
        if (this.cols != this.rows) {
            return 0;
        }
        if (this.cols == 1) {
            return this.array[0];
        }
        if (this.cols == 2) {
            return this.array[0] * this.array[3] - this.array[2] * this.array[1];
        }
        if (this.cols == 3) {
            return this.array[0] * (this.array[4] * this.array[8] - this.array[5] * this.array[7]) -
                this.array[1] * (this.array[3] * this.array[8] - this.array[5] * this.array[6]) +
                this.array[2] * (this.array[7] * this.array[3] - this.array[4] * this.array[6]);
        }
        var col;
        var result = 0;
        for (col = 0; col < this.cols; col++) {
            var sub_det = (this.subMatrixWithoutRowCol(0, col)).det();
            result += this.get(0, col) * sub_det;
        }
        return result;
    };
    Matrix.prototype.cofactorMatrix = function () {
        var matrix = new Matrix(this.cols, this.rows, Object.assign([], this.array));
        var row;
        for (row = 0; row < this.rows; row++) {
            var col = void 0;
            for (col = 0; col < this.cols; col++) {
                matrix.set(row, col, (Math.pow((-1), (col + row))) * (this.subMatrixWithoutRowCol(row, col)).det());
            }
        }
        return matrix;
    };
    Matrix.prototype.transpose = function () {
        var matrix = new Matrix(this.cols, this.rows, Object.assign([], this.array));
        var row;
        for (row = 0; row < this.rows; row++) {
            var col = void 0;
            for (col = 0; col < this.cols; col++) {
                matrix.set(col, row, this.get(row, col));
            }
        }
        return matrix;
    };
    Matrix.identity = function (cols) {
        var array = [];
        var row;
        for (row = 0; row < cols; row++) {
            var col = void 0;
            for (col = 0; col < cols; col++) {
                if (col == row) {
                    array.push(1.0);
                }
                else {
                    array.push(0.0);
                }
            }
        }
        return new Matrix(cols, cols, array);
    };
    Matrix.prototype.inverse = function () {
        if (this.cols != this.rows) {
            return null;
        }
        var det = this.det();
        if (Math.abs(det) > 0.0001) {
            if (this.cols == 2) {
                return new Matrix(2, 2, [this.array[3] / det, -this.array[1] / det,
                    -this.array[2] / det, this.array[0] / det]);
            }
            else {
                return ((this.cofactorMatrix()).transpose()).scale(1.0 / det);
            }
        }
        else {
            return null;
        }
    };
    return Matrix;
}());
var KalmanFilter = /** @class */ (function () {
    function KalmanFilter(F, B, H, Q, R, P, x) {
        this.F = F;
        this.B = B;
        this.H = H;
        this.Q = Q;
        this.R = R;
        this.P = P;
        this.I = Matrix.identity(P.cols);
        this.x = x;
    }
    KalmanFilter.prototype.update = function (z, u) {
        // Predict
        if (this.B == null) {
            this.x = (this.F.mult(this.x));
        }
        else {
            this.x = (this.F.mult(this.x)).add(this.B.mult(u));
        }
        this.P = ((this.F.mult(this.P)).mult(this.F.transpose())).add(this.Q);
        // Update
        var y = z.sub(this.H.mult(this.x));
        var S = this.R.add((this.H.mult(this.P)).mult(this.H.transpose()));
        var K = (this.P.mult(this.H.transpose())).mult(S.inverse());
        this.x = this.x.add(K.mult(y));
        this.P = (this.I.sub(K.mult(this.H))).mult(this.P);
        return this.x;
    };
    return KalmanFilter;
}());
function draw_background(ctx) {
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, 800, 400);
}
function draw_point(ctx, x, y, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, 5, 5);
}
var Graph = /** @class */ (function () {
    function Graph(div_name, data, layout) {
        this.div_name = div_name;
        this.data = data;
        this.layout = layout;
        this.plotted_once = false;
    }
    Graph.prototype.plot = function () {
        if (this.plotted_once) {
            var update_1 = { x: [], y: [] };
            this.data.forEach(function (element) {
                update_1.x.push(element.x);
                update_1.y.push(element.y);
            });
            Plotly.restyle(this.div_name, update_1, [0, 1, 2]);
        }
        else {
            Plotly.newPlot(this.div_name, this.data, this.layout);
            this.plotted_once = true;
        }
    };
    return Graph;
}());
var KalmanGraph = /** @class */ (function () {
    function KalmanGraph(F, B, H, Q, R, P, x, canvas, chartX_div_name, chartY_div_name) {
        this.DELTA_TIME = 0.02;
        this.ARRAY_SIZE = 300;
        this.run = false;
        this.filter = new KalmanFilter(F, B, H, Q, R, P, x);
        this.canvas = canvas;
        this.time_counter = 0;
        this.render_counter = -1;
        this.last_tick = Date.now();
        this.time = [];
        this.x = [];
        this.x_noise = [];
        this.x_filtered = [];
        this.y = [];
        this.y_noise = [];
        this.y_filtered = [];
        this.chartX = new Graph(chartX_div_name, [{ x: this.time, y: this.x, mode: 'markers', type: 'scattergl', marker: { size: 3 }, name: "x real" },
            { x: this.time, y: this.x_noise, mode: 'markers', type: 'scattergl', marker: { size: 3 }, name: "x noise" },
            { x: this.time, y: this.x_filtered, mode: 'markers', type: 'scattergl', marker: { size: 3 }, name: "x filtered" }], { autosize: false, width: 400, height: 370, title: "X position" });
        this.chartY = new Graph(chartY_div_name, [{ x: this.time, y: this.y, mode: 'markers', type: 'scattergl', marker: { size: 3 }, name: "y real" },
            { x: this.time, y: this.y_noise, mode: 'markers', type: 'scattergl', marker: { size: 3 }, name: "y noise" },
            { x: this.time, y: this.y_filtered, mode: 'markers', type: 'scattergl', marker: { size: 3 }, name: "y filtered" }], { autosize: false, width: 400, height: 370, title: "Y position" });
    }
    KalmanGraph.prototype.cyclic_call = function (first_call) {
        if (first_call === void 0) { first_call = false; }
        if (((!this.run) || ((Date.now() - this.last_tick) < period)) && !first_call) {
            return;
        }
        this.time_counter += this.DELTA_TIME;
        this.render_counter += 1;
        var x = Math.round(200 * Math.cos(this.time_counter) + 400);
        var y = Math.round(200 * Math.sin(this.time_counter) * Math.cos(this.time_counter) + 200);
        var x_noise = Math.round(Math.random() * 150 - 75 + x);
        var y_noise = Math.round(Math.random() * 150 - 75 + y);
        var state_kalman = this.filter.update(new Matrix(2, 1, [x_noise, y_noise]), null);
        var x_filtered = Math.round(state_kalman.get(0, 0));
        var y_filtered = Math.round(state_kalman.get(1, 0));
        draw_background(this.canvas);
        draw_point(this.canvas, x, y, "red");
        draw_point(this.canvas, x_noise, y_noise, "blue");
        draw_point(this.canvas, x_filtered, y_filtered, "green");
        this.time.push(this.time_counter);
        this.x.push(x);
        this.x_noise.push(x_noise);
        this.x_filtered.push(state_kalman.get(0, 0));
        this.y.push(y);
        this.y_noise.push(y_noise);
        this.y_filtered.push(state_kalman.get(1, 0));
        this.shift_arrays();
        if ((this.render_counter % 30) == 0) {
            this.render_counter = 0;
            this.chartX.plot();
            this.chartY.plot();
        }
        this.last_tick = Date.now();
    };
    KalmanGraph.prototype.shift_arrays = function () {
        if (this.time.length > this.ARRAY_SIZE) {
            this.time.shift();
        }
        if (this.x.length > this.ARRAY_SIZE) {
            this.x.shift();
        }
        if (this.x_noise.length > this.ARRAY_SIZE) {
            this.x_noise.shift();
        }
        if (this.x_filtered.length > this.ARRAY_SIZE) {
            this.x_filtered.shift();
        }
        if (this.y.length > this.ARRAY_SIZE) {
            this.y.shift();
        }
        if (this.y_noise.length > this.ARRAY_SIZE) {
            this.y_noise.shift();
        }
        if (this.y_filtered.length > this.ARRAY_SIZE) {
            this.y_filtered.shift();
        }
    };
    return KalmanGraph;
}());
function gameLoop(timestamp) {
    kalman_kinematic_graph.cyclic_call();
    //kalman_dynamic_graph.cyclic_call();
    requestAnimationFrame(gameLoop);
}
var period = 20;
var kalman_kinematic_graph;
var kalman_dynamic_graph;
window.onload = function () {
    var canvas = document.getElementById('cnvs').getContext("2d");
    var dt = 0.020;
    var F = new Matrix(4, 4, [1, 0, dt, 0,
        0, 1, 0, dt,
        0, 0, 1, 0,
        0, 0, 0, 1]);
    var B = null;
    var H = new Matrix(2, 4, [1, 0, 0, 0,
        0, 1, 0, 0]);
    var Q = new Matrix(4, 4, [3, 0, 0, 0,
        0, 3, 0, 0,
        0, 0, 3, 0,
        0, 0, 0, 3]);
    var R = new Matrix(2, 2, [100, 0,
        0, 100]);
    var P = new Matrix(4, 4, [1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1]);
    var state = new Matrix(4, 1, [0, 0, 0, 0]);
    kalman_kinematic_graph = new KalmanGraph(F, B, H, Q, R, P, state, canvas, "kalman_kinematic_graph_x", "kalman_kinematic_graph_y");
    kalman_kinematic_graph.cyclic_call(true);
    gameLoop(0);
};
function start_stop_kinematic() {
    kalman_kinematic_graph.run = !kalman_kinematic_graph.run;
}
