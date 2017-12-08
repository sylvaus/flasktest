class Matrix {
  rows: number;
  cols: number;
  array: number[];

  constructor(rows: number, cols: number, array: number[]) {
      this.rows = rows;
      this.cols = cols;
      this.array = array;
  }

  toString(): string {
      let text = "";
      let row : number;
      for (row = 0; row < this.rows; row++) {
          let col: number;
          for (col = 0; col < this.cols; col++) {
              text += this.array[row * this.cols + col] + " ";
          }
          text += "\n";
      }
      return text;
  }

  get(row: number, col: number): number {
      return this.array[row * this.cols + col]
  }

  set(row: number, col: number, value :number){
      this.array[row * this.cols + col] = value
  }
  
  scale(factor : number) {
      return new Matrix(this.rows, this.cols, this.array.map((x) => {return x * factor;}));
  }

  add(other: Matrix): Matrix {
    if (this.cols != other.cols) {
        return null;
    }
    if (this.rows != other.rows) {
      return null;
    }

    let array = [];
    let row : number;
    for (row = 0; row < this.rows; row++){
        let col : number;
        for (col = 0; col < this.cols; col++){
            array.push(this.get(row, col) + other.get(row, col));
        }
    }
    return new Matrix(this.rows, other.cols, array);
  }

  sub(other: Matrix): Matrix {
    if (this.cols != other.cols) {
        return null;
    }
    if (this.rows != other.rows) {
      return null;
    }

    let array = [];
    let row : number;
    for (row = 0; row < this.rows; row++){
        let col : number;
        for (col = 0; col < this.cols; col++){
            array.push(this.get(row, col) - other.get(row, col));
        }
    }
    return new Matrix(this.rows, other.cols, array);
  }

  mult(other: Matrix): Matrix {
      if (this.cols != other.rows) {
          return null;
      }

      let array = [];
      let row : number;
      for (row = 0; row < this.rows; row++){
          let col : number;
          for (col = 0; col < other.cols; col++){
              let scalar = 0;
              let index: number;
              for (index = 0; index < this.cols; index++) {
                  scalar += this.get(row, index) * other.get(index, col);
              }
              array.push(scalar);
          }
      }
      return new Matrix(this.rows, other.cols, array);
  }
  
  subMatrixWithoutRowCol(remove_row : number, remove_col : number) : Matrix {
      let sub_array = [];
      let new_rows = this.rows;
      let new_cols = this.cols;
      let row : number;
      for (row = 0; row < this.rows; row++){
          if (row == remove_row) {
              new_rows -= 1;
              continue;
          }
          let col : number;
          for (col = 0; col < this.cols; col++){
              if (col == remove_col) {continue;}
              sub_array.push(this.array[row * this.cols + col]);
          }
      }
      if ((remove_col < this.cols) && (remove_col > -1)) {
          new_cols -= 1;
      }
      return new Matrix(new_rows, new_cols, sub_array);
  }

  det(): number {
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
      
      let col : number;
      let result = 0;
      for(col = 0; col < this.cols; col++){
          let sub_det = (this.subMatrixWithoutRowCol(0, col)).det()
          result += this.get(0, col) * sub_det;
      }
      return result;
  }
  
  cofactorMatrix() : Matrix {
      let matrix = new Matrix(this.cols, this.rows, Object.assign([], this.array));
      let row : number;
      for (row = 0; row < this.rows; row++) {
          let col: number;
          for (col = 0; col < this.cols; col++) {
              matrix.set(row, col, ((-1) ** (col + row)) * (this.subMatrixWithoutRowCol(row, col)).det())
          }
      }
      
      return matrix;
  }

  transpose(): Matrix {
      let matrix = new Matrix(this.cols, this.rows, Object.assign([], this.array));
      let row : number;
      for (row = 0; row < this.rows; row++) {
          let col: number;
          for (col = 0; col < this.cols; col++) {
              matrix.set(col, row, this.get(row, col))
          }
      }
      return matrix;
  }

  static identity(cols : number) : Matrix {
    let array = [];
    let row : number;
    for (row = 0; row < cols; row++) {
      let col: number;
      for (col = 0; col < cols; col++) {
          if (col == row){
            array.push(1.0);
          } else {
            array.push(0.0);
          }
      }
  }
  return new Matrix(cols, cols, array); 
  }

  inverse(): Matrix {
      if (this.cols != this.rows) {
          return null;
      }

      let det = this.det();
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

      
  }
}

class KalmanFilter{
  F : Matrix;
  B : Matrix;
  H : Matrix;
  Q : Matrix;
  R : Matrix;
  P : Matrix;
  I : Matrix;
  x : Matrix;
  constructor( F : Matrix, B : Matrix, H : Matrix, Q : Matrix, 
               R : Matrix, P : Matrix, x : Matrix) {
    this.F = F;
    this.B = B;
    this.H = H;
    this.Q = Q;
    this.R = R;
    this.P = P;
    this.I = Matrix.identity(P.cols);
    this.x = x
  }
    
  update(z : Matrix, u : Matrix): Matrix {
    // Predict
    if (this.B == null) {
        this.x = (this.F.mult(this.x));
    } else {
        this.x = (this.F.mult(this.x)).add(this.B.mult(u));
    }
    this.P = ((this.F.mult(this.P)).mult(this.F.transpose())).add(this.Q);
    // Update
    let y = z.sub(this.H.mult(this.x));
    let S = this.R.add((this.H.mult(this.P)).mult(this.H.transpose()));
    let K = (this.P.mult(this.H.transpose())).mult(S.inverse());
    this.x = this.x.add(K.mult(y));
    this.P = (this.I.sub(K.mult(this.H))).mult(this.P);
    return this.x;
  }
}

function draw_background(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, 800, 400);
}

function draw_point(ctx: CanvasRenderingContext2D,
                    x: number, y: number, color: string) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, 5, 5);
}

function make_chart(div_name : string,
                    title : string,
                    array: Array<{x : number, y : number}>, 
                    array_noise : Array<{x : number, y : number}>, 
                    array_filtered : Array<{x : number, y : number}>) : CanvasJS.Chart{
  return new CanvasJS.Chart(div_name, {
    title: {
      text: title
    },
    axisY: {
      includeZero: false
    },
    data: [{
      type: "line",
      markerSize: 2,
      lineThickness: 1,
      dataPoints: array
    },
    {
      type: "line",
      markerSize: 2,
      lineThickness: 1,
      dataPoints: array_noise
    },
    {
      type: "line",
      markerSize: 2,
      lineThickness: 1,
      dataPoints: array_filtered
    }]
  });
}

class KalmanGraph {
  filter : KalmanFilter;
  canvas : CanvasRenderingContext2D;
  run : boolean;
  x : Array<{x : number, y : number}>;
  y : Array<{x : number, y : number}>;
  x_noise : Array<{x : number, y : number}>;
  y_noise : Array<{x : number, y : number}>;
  x_filtered : Array<{x : number, y : number}>;
  y_filtered : Array<{x : number, y : number}>;
  chartX : CanvasJS.Chart;
  chartY : CanvasJS.Chart;
  time_counter : number;
  render_counter : number;

  DELTA_TIME = 0.01;
  ARRAY_SIZE = 500;

  constructor(F : Matrix, B : Matrix, H : Matrix, Q : Matrix, 
              R : Matrix, P : Matrix, x : Matrix, 
              canvas : CanvasRenderingContext2D,
              chartX_div_name : string,
              chartY_div_name : string,){
    this.filter = new KalmanFilter(F, B, H, Q, R, P, x);
    this.canvas = canvas;
    this.time_counter = 0;
    this.render_counter = 0;
    this.x = []; 
    this.x_noise = [];
    this.x_filtered = [];
    this.y = [];
    this.y_noise = [];
    this.y_filtered = [];
    this.chartX = make_chart(chartX_div_name, "X position", this.x, this.x_noise, this.x_filtered);
    this.chartY = make_chart(chartY_div_name, "Y position", this.y, this.y_noise, this.y_filtered);
  }

  cyclic_call() {
    if(!this.run) {
      return;
    }
    this.time_counter += this.DELTA_TIME;
    this.render_counter += 1;

    let x = Math.round(200 * Math.cos(this.time_counter) + 400);
    let y = Math.round(200 * Math.sin(this.time_counter) * Math.cos(this.time_counter) + 200);
    let x_noise = Math.round(Math.random() * 150 - 75 + x);
    let y_noise = Math.round(Math.random() * 150 - 75 + y);
    let state_kalman = this.filter.update(new Matrix(2, 1, [x_noise, y_noise]), null);
    let x_filtered = Math.round(state_kalman.get(0, 0));
    let y_filtered = Math.round(state_kalman.get(1, 0));

    draw_background(this.canvas);
    draw_point(this.canvas, x, y, "red");
    draw_point(this.canvas, x_noise, y_noise, "blue");
    draw_point(this.canvas, x_filtered, y_filtered, "green");

    this.x.push({x: this.time_counter, y: x});
    this.x_noise.push({x: this.time_counter, y: x_noise});
    this.x_filtered.push({x: this.time_counter, y: state_kalman.get(0, 0)});
    this.y.push({x: this.time_counter, y: y});
    this.y_noise.push({x: this.time_counter, y: y_noise});
    this.y_filtered.push({x: this.time_counter, y: state_kalman.get(1, 0)});

    this.shift_arrays();

    if ((this.render_counter % 10) == 0) {
      this.render_counter = 0;
      this.chartX.render();
      this.chartY.render();
    }
  }

  shift_arrays() {
    if (this.x.length > this.ARRAY_SIZE) {this.x.shift();}
    if (this.x_noise.length > this.ARRAY_SIZE) {this.x_noise.shift();}
    if (this.x_filtered.length > this.ARRAY_SIZE) {this.x_filtered.shift();}
    if (this.y.length > this.ARRAY_SIZE) {this.y.shift();}
    if (this.y_noise.length > this.ARRAY_SIZE) {this.y_noise.shift();}
    if (this.y_filtered.length > this.ARRAY_SIZE) {this.y_filtered.shift();}
  }
}

function gameLoop(timestamp) {
  if((Date.now() - last_tick) > period){
    kalman_kinematic_graph.cyclic_call();
    last_tick = Date.now();
  }
  requestAnimationFrame(gameLoop);
}

let last_tick : number;
let period = 10;

let kalman_kinematic_graph : KalmanGraph;
let kalman_dynamic_graph : KalmanGraph;

window.onload = () => {
  let canvas = (<HTMLCanvasElement>document.getElementById('cnvs')).getContext("2d");

  let dt = 0.1;
  let F = new Matrix(4, 4, [1, 0, dt, 0,
                            0, 1, 0, dt,
                            0, 0, 1, 0,
                            0, 0, 0, 1]);
  let B = null;
  let H = new Matrix(2, 4, [1, 0, 0, 0,
                            0, 1, 0, 0]);
  let Q = new Matrix(4, 4, [1, 0, 0, 0,
                            0, 1, 0, 0,
                            0, 0, 1, 0,
                            0, 0, 0, 1]);
                          
  let R = new Matrix(2, 2, [100, 0,
                            0, 100]);
                          
  let P = new Matrix(4, 4, [1, 0, 0, 0,
                            0, 1, 0, 0,
                            0, 0, 1, 0,
                            0, 0, 0, 1]);                        
  let state = new Matrix(4, 1, [0, 0, 0, 0]);
  kalman_kinematic_graph = new KalmanGraph(F, B, H, Q, R, P, state, canvas, "kalman_kinematic_graph_x", "kalman_kinematic_graph_y");
  kalman_kinematic_graph.run = true;
  last_tick = Date.now();
  gameLoop(0);
}
