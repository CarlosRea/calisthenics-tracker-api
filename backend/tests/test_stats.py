def test_get_stats_summary_seeded(client):
    response = client.get("/api/stats/summary")
    assert response.status_code == 200
    data = response.json()
    assert data["total_workouts"] == 4
    # Volume: 4*8 (32) + 4*15 (60) + 3*10 (30) + 3*12 (36) = 158
    assert data["total_volume"] == 158
    assert data["personal_records"]["Pull"] == 8
    assert data["personal_records"]["Push"] == 15
    assert data["personal_records"]["Legs"] == 10
    assert data["personal_records"]["Core"] == 12


def test_stats_update_after_new_workout(client):
    # Add workout with new Pull PR of 14 reps
    client.post(
        "/api/workouts",
        json={
            "exercise_name": "Pull-ups",
            "category": "Pull",
            "sets": 3,
            "reps": 14,
            "added_weight": 0.0,
            "date": "2026-10-26",
        },
    )

    response = client.get("/api/stats/summary")
    assert response.status_code == 200
    data = response.json()
    assert data["total_workouts"] == 5
    assert data["total_volume"] == 158 + (3 * 14)  # 158 + 42 = 200
    assert data["personal_records"]["Pull"] == 14


def test_get_stats_summary_empty(client, db_session):
    from app.db_models import WorkoutDB

    # Clear all workouts from test database
    db_session.query(WorkoutDB).delete()
    db_session.commit()

    response = client.get("/api/stats/summary")
    assert response.status_code == 200
    data = response.json()
    assert data["total_workouts"] == 0
    assert data["total_volume"] == 0
    assert data["personal_records"]["Pull"] == 0
    assert data["personal_records"]["Push"] == 0
    assert data["personal_records"]["Legs"] == 0
    assert data["personal_records"]["Core"] == 0
