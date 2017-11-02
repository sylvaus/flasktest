
sign = lambda x : 1 if x > 0 else -1

class SimulationModel(object):
    def __init__(self, mass, drag, gravity, delta_time):
        self._mass = mass
        self._drag = drag
        self._gravity = gravity
        self._delta_time = delta_time
        self._time = 0
        self._position = 0
        self._velocity = 0

    def step(self, control_force):
        self._time += self._delta_time
        # total_force = control_force + drag_force + gravity_force = mass * acceleration
        acceleration = (control_force + (- sign(self._velocity) * self._drag * (self._velocity ** 2))) / self._mass + self._gravity
        self._velocity += acceleration * self._delta_time 
        self._position += self._velocity * self._delta_time

    def get_state(self):
        return self._time, self._position, self._velocity



class PIDController(object):
    def __init__(self, P, I, D, initial_error):
        self._P = P
        self._I = I
        self._D = D
        self._error = initial_error
        self._integral = 0

    def compute_control(self, error, velocity):
        # Keeping self._error in case we want to implement a discrete controller
        self._error = error
        self._integral += error
        return (self._P * self._error) + (self._I * self._integral) + (self._D * -velocity)
