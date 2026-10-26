import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ApiWorkoutService } from './apiWorkoutService';

describe('ApiWorkoutService', () => {
  let service: ApiWorkoutService;

  beforeEach(() => {
    service = new ApiWorkoutService('http://localhost:8093');
    vi.restoreAllMocks();
  });

  it('fetches workouts with optional category and search query', async () => {
    const mockWorkouts = [
      {
        id: 1,
        exercise_name: 'Pull-ups',
        category: 'Pull',
        sets: 4,
        reps: 10,
        added_weight: 0,
        date: '2026-10-26',
      },
    ];

    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => mockWorkouts,
    } as Response);

    const result = await service.listWorkouts('Pull', 'pull');
    expect(result).toEqual(mockWorkouts);
    expect(fetchSpy).toHaveBeenCalledWith('http://localhost:8093/api/workouts?category=Pull&exercise=pull');
  });

  it('creates a workout via POST /api/workouts', async () => {
    const newWorkout = {
      id: 5,
      exercise_name: 'Dips',
      category: 'Push' as const,
      sets: 3,
      reps: 15,
      added_weight: 5,
      date: '2026-10-26',
    };

    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => newWorkout,
    } as Response);

    const result = await service.createWorkout({
      exercise_name: 'Dips',
      category: 'Push',
      sets: 3,
      reps: 15,
      added_weight: 5,
      date: '2026-10-26',
    });

    expect(result).toEqual(newWorkout);
    expect(fetchSpy).toHaveBeenCalledWith('http://localhost:8093/api/workouts', expect.objectContaining({
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    }));
  });

  it('deletes a workout via DELETE /api/workouts/:id', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
    } as Response);

    await service.deleteWorkout(2);
    expect(fetchSpy).toHaveBeenCalledWith('http://localhost:8093/api/workouts/2', {
      method: 'DELETE',
    });
  });

  it('retrieves stats summary via GET /api/stats/summary', async () => {
    const mockStats = {
      total_workouts: 4,
      total_volume: 158,
      personal_records: { Pull: 8, Push: 15, Legs: 10, Core: 12 },
    };

    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => mockStats,
    } as Response);

    const result = await service.getStatsSummary();
    expect(result).toEqual(mockStats);
    expect(fetchSpy).toHaveBeenCalledWith('http://localhost:8093/api/stats/summary');
  });
});
