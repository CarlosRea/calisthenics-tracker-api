import { ApiWorkoutService } from './apiWorkoutService';
import { MockWorkoutService } from './mockWorkoutService';
import { IWorkoutService } from './workoutService';

// Default to real FastAPI backend client
export const workoutService: IWorkoutService = new ApiWorkoutService();
export { MockWorkoutService, ApiWorkoutService };
