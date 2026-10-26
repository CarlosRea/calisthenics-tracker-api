def test_list_workouts_seeded(client):
    response = client.get("/api/workouts")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 4
    assert data[0]["exercise_name"] == "Hanging Leg Raises"  # latest date 2026-10-26


def test_filter_workouts_by_category(client):
    response = client.get("/api/workouts?category=Pull")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["exercise_name"] == "Weighted Pull-ups"
    assert data[0]["category"] == "Pull"


def test_filter_workouts_by_exercise(client):
    response = client.get("/api/workouts?exercise=dips")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["exercise_name"] == "Parallel Bar Dips"


def test_create_workout(client):
    payload = {
        "exercise_name": "Muscle-ups",
        "category": "Pull",
        "sets": 3,
        "reps": 8,
        "added_weight": 0.0,
        "date": "2026-10-26",
    }
    response = client.post("/api/workouts", json=payload)
    assert response.status_code == 201
    created = response.json()
    assert created["id"] == 5
    assert created["exercise_name"] == "Muscle-ups"
    assert created["category"] == "Pull"
    assert created["sets"] == 3
    assert created["reps"] == 8

    # Verify listing includes it
    list_res = client.get("/api/workouts")
    assert len(list_res.json()) == 5


def test_create_workout_validation_failure(client):
    # sets cannot be 0
    payload = {
        "exercise_name": "Push-ups",
        "category": "Push",
        "sets": 0,
        "reps": 10,
    }
    response = client.post("/api/workouts", json=payload)
    assert response.status_code == 422


def test_delete_workout(client):
    response = client.delete("/api/workouts/1")
    assert response.status_code == 204

    # Verify count is now 3
    list_res = client.get("/api/workouts")
    assert len(list_res.json()) == 3


def test_delete_workout_not_found(client):
    response = client.delete("/api/workouts/999")
    assert response.status_code == 404
