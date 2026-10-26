import { MockWorkoutService } from './mockWorkoutService';
import { IWorkoutService } from './workoutService';

export const workoutService: IWorkoutService = new MockWorkoutService();
