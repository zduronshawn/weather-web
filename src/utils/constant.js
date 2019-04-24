export let SECOND = 1000;
export let MINUTE = 60 * SECOND;
export let HOUR = 60 * MINUTE;
export let MAX_TASK_TIME = 100;                  // amount of time before a task yields control (millis)
export let MIN_SLEEP_TIME = 25;                  // amount of time a task waits before resuming (millis)
export let MIN_MOVE = 4;                         // slack before a drag operation beings (pixels)
export let MOVE_END_WAIT = 1000;                 // time to wait for a move operation to be considered done (millis)

export let OVERLAY_ALPHA = Math.floor(0.4 * 255);  // overlay transparency (on scale [0, 255])
export let INTENSITY_SCALE_STEP = 10;            // step size of particle intensity color scale
export let MAX_PARTICLE_AGE = 1000;               // max number of frames a particle is drawn before regeneration
export let PARTICLE_LINE_WIDTH = 0.8;            // line width of a drawn particle
export let PARTICLE_MULTIPLIER = 7;              // particle count scalar (completely arbitrary--this values looks nice)
export let PARTICLE_REDUCTION = 0.75;            // reduce particle count to this much of normal for mobile devices
export let FRAME_RATE = 40;                      // desired milliseconds per frame

export let NULL_WIND_VECTOR = [NaN, NaN, null];  // singleton for undefined location outside the vector field [u, v, mag]
export let HOLE_VECTOR = [NaN, NaN, null];       // singleton that signifies a hole in the vector field
export let TRANSPARENT_BLACK = [0, 0, 0, 0];     // singleton 0 rgba