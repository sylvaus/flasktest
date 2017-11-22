
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

  /*


  */
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
    let cos_roll = +1.0 - 2.0 * ((this.array[0] ** 2) + y2)
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