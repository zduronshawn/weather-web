export const SECOND = 1000;
export const MINUTE = 60 * SECOND;
export const HOUR = 60 * MINUTE;
export const MAX_TASK_TIME = 100;                  // amount of time before a task yields control (millis)
export const MIN_SLEEP_TIME = 25;                  // amount of time a task waits before resuming (millis)
export const MIN_MOVE = 4;                         // slack before a drag operation beings (pixels)
export const MOVE_END_WAIT = 150;                 // time to wait for a move operation to be considered done (millis)

export const OVERLAY_ALPHA = Math.floor(0.4 * 255);  // overlay transparency (on scale [0, 255])
export const INTENSITY_SCALE_STEP = 10;            // step size of particle intensity color scale
export const MAX_PARTICLE_AGE = 1000;               // max number of frames a particle is drawn before regeneration
export const PARTICLE_LINE_WIDTH = 0.8;            // line width of a drawn particle
export const PARTICLE_MULTIPLIER = 7;              // particle count scalar (completely arbitrary--this values looks nice)
export const PARTICLE_REDUCTION = 0.75;            // reduce particle count to this much of normal for mobile devices
export const FRAME_RATE = 40;                      // desired milliseconds per frame

export const NULL_WIND_VECTOR = [NaN, NaN, null];  // singleton for undefined location outside the vector field [u, v, mag]
export const HOLE_VECTOR = [NaN, NaN, null];       // singleton that signifies a hole in the vector field
export const TRANSPARENT_BLACK = [0, 0, 0, 0];     // singleton 0 rgba