import { describe, it, expect, beforeEach } from 'vitest';
import { MockWorkoutService } from './mockWorkoutService';

describe('MockWorkoutService', () => {
  let service: MockWorkoutService;

  beforeEach(() => {
    service = new MockWorkoutService();
    service.resetSeed();
  });

  it('initializes with 4 seeded demo workouts', async () => {
    const workouts = await service.listWorkouts();
    expect(workouts).toHaveLength(4);
  });

  it('calculates total workouts, total volume (sum of sets * reps), and PRs accurately', async () => {
    const stats = await service.getStatsSummary();
    expect(stats.total_workouts).toBe(4);
    // Seed volume:
    // Pull-ups: 4 * 8 = 32
    // Dips: 4 * 15 = 60
    // Pistol Squats: 3 * 10 = 30
    // Hanging Leg Raises: 3 * 12 = 36
    // Total = 32 + 60 + 30 + 36 = 158
    expect(stats.total_volume).toBe(158);
    expect(stats.personal_records.Pull).toBe(8);
    expect(stats.personal_records.Push).toBe(15);
    expect(stats.personal_records.Legs).toBe(10);
    expect(stats.personal_records.Core).toBe(12);
  });

  it('filters workouts by category', async () => {
    const pullWorkouts = await service.listWorkouts('Pull');
    expect(pullWorkouts).toHaveLength(1);
    expect(pullWorkouts[0].exercise_name).toBe('Weighted Pull-ups');

    const pushWorkouts = await service.listWorkouts('Push');
    expect(pushWorkouts).toHaveLength(1);
    expect(pushWorkouts[0].exercise_name).toBe('Parallel Bar Dips');
  });

  it('filters workouts by exercise search query', async () => {
    const results = await service.listWorkouts(undefined, 'squats');
    expect(results).toHaveLength(1);
    expect(results[0].exercise_name).toBe('Pistol Squats');
  });

  it('logs a new workout and updates total volume and personal records', async () => {
    const created = await service.createWorkout({
      exercise_name: 'Max Muscle-ups',
      category: 'Pull',
      sets: 3,
      reps: 12, // New Pull PR (12 > 8)
      added_weight: 0,
      date: '2026-10-26',
    });

    expect(created.id).toBeDefined();
    expect(created.exercise_name).toBe('Max Muscle-ups');

    const stats = await service.getStatsSummary();
    expect(stats.total_workouts).toBe(5);
    expect(stats.total_volume).toBe(158 + 3 * 12); // 158 + 36 = 194
    expect(stats.personal_records.Pull).toBe(12); // Updated PR
  });

  it('deletes a workout by ID', async () => {
    await service.deleteWorkout(1); // delete first seeded item
    const workouts = await service.listWorkouts();
    expect(workouts).toHaveLength(3);
    expect(workouts.find((w) => w.id === 1)).toBeUndefined();
  });
});
