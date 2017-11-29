
let ZERO_THRESHOLD = 0.0000001


class Quaternion {
  array : number[]
  constructor(w : number, x : number, y : number, z : number) {
    this.array = [w, x, y, z] 
  }

  normalize() : void {
    let norm = this.get_norm()
    if(norm < ZERO_THRESHOLD) {
      this.array = [1, 0, 0, 0]
    }
    else{
      this.array = this.array.map(val => {return val / norm})
    }
  }

  inverse() : void {
    this.array = [this.array[0], -this.array[1], -this.array[2], -this.array[3]] 
  }

  get_array() : number[] {
    return this.array
  }

  get_norm() : number {
    return Math.sqrt(this.array[0] * this.array[0] + this.array[1] * this.array[1]
                     + this.array[2] * this.array[2] + this.array[3] * this.array[3])
  }

  get_inverse() : Quaternion {
    return new Quaternion(this.array[0], -this.array[1], -this.array[2], -this.array[3]) 
  }

  get_axis() : number[] {
    let sub_array = this.array.slice(1, 4)
    let norm = Math.sqrt(sub_array[0] * sub_array[0] 
                         + sub_array[1] * sub_array[1]
                         + sub_array[2] * sub_array[2])
    if(norm < ZERO_THRESHOLD) {
      return [1, 0, 0]
    }
    else {
      return sub_array.map(val => {return val / norm})
    }
  }

  get_theta() : number {
    return 2.0 * Math.acos(this.array[0])
  }

  get_normalized() : Quaternion {
    let norm = this.get_norm()
    if (norm < ZERO_THRESHOLD){
      return new Quaternion(1, 0, 0, 0)
    } 
    else {
      return new Quaternion(this.array[0] / norm, this.array[1] / norm,
                            this.array[2] / norm, this.array[4] / norm)
    }
  }

  scale(factor : number) : void {
    this.array = this.array.map(val => {return val * factor})
  }

  get_scaled(factor : number) : Quaternion {
    return new Quaternion(this.array[0] * factor, this.array[1] * factor,
                          this.array[2] * factor, this.array[3] * factor)
  }

  add(other : Quaternion) : Quaternion {
    return new Quaternion(this.array[0] + other.array[0], this.array[1] + other.array[1],
                          this.array[2] + other.array[2], this.array[3] + other.array[3])
  }

  mult(other : Quaternion) : Quaternion {
    return new Quaternion(this.array[0] * other.array[0] - this.array[1] * other.array[1] - this.array[2] * other.array[2]- this.array[3] * other.array[3],
                          this.array[0] * other.array[1] + this.array[1] * other.array[0] + this.array[2] * other.array[3]- this.array[3] * other.array[2],
                          this.array[0] * other.array[2] - this.array[1] * other.array[3] + this.array[2] * other.array[0]+ this.array[3] * other.array[1],
                          this.array[0] * other.array[3] + this.array[1] * other.array[2] - this.array[2] * other.array[1]+ this.array[3] * other.array[0],
    )
  }

  dot(other : Quaternion) : number {
    return (this.array[0] * other.array[0] + this.array[1] * other.array[1]
            + this.array[2] * other.array[2] + this.array[3] * other.array[3])
  }

  /** Quaternion to rotation matrix based on 
   * https://en.wikipedia.org/wiki/Conversion_between_quaternions_and_Euler_angles#Rotation_matrices */
  to_rot_matrix() : number[][]{
    let sub_array = this.array.slice(1, 4)
    let norm = Math.sqrt(sub_array[0] * sub_array[0] 
                         + sub_array[1] * sub_array[1]
                         + sub_array[2] * sub_array[2])
    if(norm < ZERO_THRESHOLD) {
      return [[1, 0, 0],
              [0, 1, 0],
              [0, 0, 1]]
    }
    else {
      let q1q0 = this.array[1] * this.array[0]
      let q2q0 = this.array[2] * this.array[0]
      let q3q0 = this.array[3] * this.array[0]
      let q1q1 = this.array[1] * this.array[1]
      let q2q1 = this.array[2] * this.array[1]
      let q3q1 = this.array[3] * this.array[1]
      let q2q2 = this.array[2] * this.array[2]
      let q3q2 = this.array[3] * this.array[2]
      let q3q3 = this.array[3] * this.array[3]
      return [[1 - 2 * (q2q2 + q3q3), 2 * (q2q1 - q3q0), 2 * (q3q1 + q2q0)],
              [2 * (q2q1 + q3q0), 1 - 2 * (q1q1 + q3q3), 2 * (q3q2 - q1q0)],
              [2 * (q3q1 - q2q0), 2 * (q3q2 + q1q0), 1 - 2 * (q1q1 + q2q2)]]
    }
  }
    /** Quaternion to Euler Angles [roll, pitch, yaw] based on 
     * https://en.wikipedia.org/wiki/Conversion_between_quaternions_and_Euler_angles#Quaternion_to_Euler_Angles_Conversion
     */
  to_euler_angles() : number[]{
    let y2 = this.array[2] ** 2
    
    let sin_roll = +2.0 * (this.array[0] * this.array[1] + this.array[2] * this.array[3])
    let cos_roll = +1.0 - 2.0 * ((this.array[1] ** 2) + y2)
    let roll = Math.atan2(sin_roll, cos_roll)
    
    let sin_pitch = +2.0 * (this.array[0] * this.array[2] - this.array[3] * this.array[1])
    if (Math.abs(sin_pitch) > 1) {
      sin_pitch = Math.sign(sin_pitch) * 1
    }
    let pitch = Math.asin(sin_pitch)
    
    let sin_yaw = +2.0 * (this.array[0] * this.array[3] + this.array[1] * this.array[2])
    let cos_yaw = +1.0 - 2.0 * (y2 + this.array[3] * this.array[3])
    let yaw = Math.atan2(sin_yaw, cos_yaw)
    
    return [roll, pitch, yaw]
  }

  /** Euler angles to quaternion based on 
   * https://en.wikipedia.org/wiki/Conversion_between_quaternions_and_Euler_angles#Euler_Angles_to_Quaternion_Conversion
   */
  static from_euler_angles(roll : number, pitch : number, yaw : number) : Quaternion {
    let cy = Math.cos(yaw * 0.5);
    let sy = Math.sin(yaw * 0.5);
    let cr = Math.cos(roll * 0.5);
    let sr = Math.sin(roll * 0.5);
    let cp = Math.cos(pitch * 0.5);
    let sp = Math.sin(pitch * 0.5);
  
    return new Quaternion(cy * cr * cp + sy * sr * sp,
                          cy * sr * cp - sy * cr * sp,
                          cy * cr * sp + sy * sr * cp,
                          sy * cr * cp - cy * sr * sp)
  }
}

function lerp(quat_from : Quaternion, quat_to : Quaternion, coeff : number) : Quaternion {
  let scaled_quat_from = quat_from.get_scaled(1 - coeff);
  let scaled_quat_to = quat_from.get_scaled(coeff);
  return scaled_quat_from.add(scaled_quat_to);
}

function nlerp(quat_from : Quaternion, quat_to : Quaternion, coeff : number) : Quaternion {
  let scaled_quat_from = quat_from.get_scaled(1 - coeff);
  let scaled_quat_to = quat_from.get_scaled(coeff);
  let result = scaled_quat_from.add(scaled_quat_to);
  result.normalize();
  return result;
}

function slerp(quat_from : Quaternion, quat_to : Quaternion, 
               coeff : number, shortest_path : boolean = false) : Quaternion {
  let normalized_quat_from = quat_from.get_normalized();
  let normalized_quat_to = quat_from.get_normalized();
  let dot = normalized_quat_from.dot(normalized_quat_to);
  if (Math.abs(dot) > 0.9995) {
    return nlerp(normalized_quat_from, normalized_quat_to, coeff)
  }

  if (shortest_path && (dot < 0.0)){
    dot = -dot
    normalized_quat_to.scale(-1)
  }

  if (Math.abs(dot) > 0){
    dot = Math.sign(dot)
  }

  let delta_angle = Math.acos(dot) * coeff;
  let quat_to_normal = normalized_quat_to.add(normalized_quat_from.get_scaled(-dot))
  quat_to_normal.normalize();

  return quat_to_normal.get_scaled(Math.sin(delta_angle))
          .add(quat_from.get_scaled(Math.cos(delta_angle)));

}


function to_rot_matrix(){
  var quat_w = parseFloat((<HTMLInputElement>document.getElementById("quat_w")).value);
  var quat_x = parseFloat((<HTMLInputElement>document.getElementById("quat_x")).value);
  var quat_y = parseFloat((<HTMLInputElement>document.getElementById("quat_y")).value);
  var quat_z = parseFloat((<HTMLInputElement>document.getElementById("quat_z")).value);
  if(isNaN(quat_w)){alert("w value is not a number"); return;}
  if(isNaN(quat_x)){alert("x value is not a number"); return;}
  if(isNaN(quat_y)){alert("y value is not a number"); return;}
  if(isNaN(quat_z)){alert("z value is not a number"); return;}
  var quaternion =  new Quaternion(quat_w, quat_x, quat_y, quat_z);
  quaternion.normalize();
  var matrix = quaternion.to_rot_matrix();
  (<HTMLDivElement>document.getElementById("rotation_matrix")).innerText =  "$$\\begin{bmatrix} " + matrix[0][0].toPrecision(5) + "\\quad" + matrix[0][1].toPrecision(5)  + "\\quad" + matrix[0][2].toPrecision(5) + "\\\\" + 
                                                                                                     matrix[1][0].toPrecision(5) + "\\quad" + matrix[1][1].toPrecision(5)  + "\\quad" + matrix[1][2].toPrecision(5) + "\\\\" + 
                                                                                                     matrix[2][0].toPrecision(5) + "\\quad" + matrix[2][1].toPrecision(5)  + "\\quad" + matrix[2][2].toPrecision(5) + "\\end{bmatrix}$$";
  MathJax.Hub.Queue(["Typeset",MathJax.Hub,"rotation_matrix"]);
}

function to_euler_angles(){
  var quat_w = parseFloat((<HTMLInputElement>document.getElementById("quat_euler_w")).value);
  var quat_x = parseFloat((<HTMLInputElement>document.getElementById("quat_euler_x")).value);
  var quat_y = parseFloat((<HTMLInputElement>document.getElementById("quat_euler_y")).value);
  var quat_z = parseFloat((<HTMLInputElement>document.getElementById("quat_euler_z")).value);
  if(isNaN(quat_w)){alert("w value is not a number"); return;}
  if(isNaN(quat_x)){alert("x value is not a number"); return;}
  if(isNaN(quat_y)){alert("y value is not a number"); return;}
  if(isNaN(quat_z)){alert("z value is not a number"); return;}
  var quaternion =  new Quaternion(quat_w, quat_x, quat_y, quat_z);
  quaternion.normalize();
  var angles = quaternion.to_euler_angles();
  (<HTMLDivElement>document.getElementById("euler_angles")).innerText =  "$$\\text{roll}=" + angles[0].toPrecision(5) + 
                                                                         "\\text{, pitch}=" + angles[1].toPrecision(5) + 
                                                                         "\\text{, yaw}=" + angles[2].toPrecision(5) + "$$";
  MathJax.Hub.Queue(["Typeset",MathJax.Hub,"euler_angles"]);
}

function to_quaternion(){
  var roll = parseFloat((<HTMLInputElement>document.getElementById("roll")).value);
  var pitch = parseFloat((<HTMLInputElement>document.getElementById("pitch")).value);
  var yaw = parseFloat((<HTMLInputElement>document.getElementById("yaw")).value);
  if(isNaN(roll)){alert("roll value is not a number"); return;}
  if(isNaN(pitch)){alert("pitch value is not a number"); return;}
  if(isNaN(yaw)){alert("y value is not a number"); return;}
  var quaternion =  Quaternion.from_euler_angles(roll, pitch, yaw);
  var array = quaternion.get_array();
  (<HTMLDivElement>document.getElementById("quaternion_from_euler")).innerText =  "$$\\mathbf{q}=\\; [" + array[0].toPrecision(5) + " \\; " +
                                                                                                                array[1].toPrecision(5) + " \\; " + 
                                                                                                                array[2].toPrecision(5) + " \\; " + 
                                                                                                                array[3].toPrecision(5) + "]$$";
  MathJax.Hub.Queue(["Typeset",MathJax.Hub,"quaternion_from_euler"]);
}




