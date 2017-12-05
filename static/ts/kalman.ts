import { Matrix } from "./matrix";

class KalmanFilter{
  F : Matrix
  B : Matrix
  H : Matrix
  Q : Matrix
  R : Matrix
  P : Matrix
  I : Matrix
  x : Matrix
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
    this.x = (this.F.mult(this.x)).add(this.B.mult(u));
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