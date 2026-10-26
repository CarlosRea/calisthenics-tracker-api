import os
from opentelemetry import trace


def test_telemetry_resource_attributes():
    tracer_provider = trace.get_tracer_provider()
    assert tracer_provider is not None

    # Verify resource attributes
    resource = getattr(tracer_provider, "resource", None)
    if resource:
        attributes = resource.attributes
        assert "service.name" in attributes
        assert attributes["service.name"] == os.environ.get("OTEL_SERVICE_NAME", "calisthenics-tracker-api")
        assert "deployment.environment" in attributes
        assert "service.version" in attributes


def test_tracer_creation_and_span():
    tracer = trace.get_tracer("test-tracer")
    with tracer.start_as_current_span("test-workout-calculation") as span:
        span.set_attribute("workout.exercise", "Muscle-up")
        span.set_attribute("workout.reps", 10)
        assert span.is_recording() or span.get_span_context().is_valid
