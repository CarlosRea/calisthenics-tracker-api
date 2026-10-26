import os
import logging
from typing import Optional
from opentelemetry import metrics, trace
from opentelemetry.exporter.otlp.proto.http.metric_exporter import OTLPMetricExporter
from opentelemetry.exporter.otlp.proto.http.trace_exporter import OTLPSpanExporter
from opentelemetry.instrumentation.fastapi import FastAPIInstrumentor
from opentelemetry.instrumentation.sqlalchemy import SQLAlchemyInstrumentor
from opentelemetry.sdk.metrics import MeterProvider
from opentelemetry.sdk.metrics.export import PeriodicExportingMetricReader
from opentelemetry.sdk.resources import Resource
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor

logger = logging.getLogger(__name__)

# Global meter provider & instruments
_meter_provider: Optional[MeterProvider] = None
_meter = None
_workouts_created_counter = None
_reps_logged_counter = None
_sets_logged_counter = None
_workouts_deleted_counter = None
_workout_errors_counter = None
_user_logins_counter = None


def setup_telemetry(app, engine=None):
    """
    Configures OpenTelemetry instrumentation for FastAPI and SQLAlchemy.
    Injects standard resource attributes: service name, environment, and version.
    Initializes both distributed tracing and application metrics via OTLP HTTP.
    """
    global _meter_provider, _meter
    global _workouts_created_counter, _reps_logged_counter, _sets_logged_counter
    global _workouts_deleted_counter, _workout_errors_counter, _user_logins_counter

    service_name = os.environ.get("OTEL_SERVICE_NAME", "calisthenics-tracker-api")
    environment = os.environ.get("ENVIRONMENT", os.environ.get("OTEL_DEPLOYMENT_ENVIRONMENT", "development"))
    version = os.environ.get("SERVICE_VERSION", os.environ.get("OTEL_SERVICE_VERSION", "1.0.0"))
    otlp_endpoint = os.environ.get("OTEL_EXPORTER_OTLP_ENDPOINT")
    otlp_metrics_endpoint = os.environ.get("OTEL_EXPORTER_OTLP_METRICS_ENDPOINT")
    enabled = os.environ.get("OTEL_ENABLED", "true").lower() in ("true", "1", "yes")

    if not enabled:
        logger.info("OpenTelemetry is disabled via OTEL_ENABLED=false")
        return

    # Define resource metadata
    resource = Resource.create({
        "service.name": service_name,
        "deployment.environment": environment,
        "service.version": version,
    })

    # --- Tracing Setup ---
    tracer_provider = TracerProvider(resource=resource)

    if otlp_endpoint:
        try:
            otlp_exporter = OTLPSpanExporter(endpoint=otlp_endpoint)
            span_processor = BatchSpanProcessor(otlp_exporter)
            tracer_provider.add_span_processor(span_processor)
        except Exception as e:
            logger.warning(f"Could not initialize OTLP trace exporter: {e}")

    trace.set_tracer_provider(tracer_provider)

    # Instrument FastAPI application
    FastAPIInstrumentor.instrument_app(
        app,
        tracer_provider=tracer_provider,
        excluded_urls="/api/health,/docs,/openapi.json",
    )

    # Instrument SQLAlchemy queries if engine provided
    if engine:
        SQLAlchemyInstrumentor().instrument(
            engine=engine,
            tracer_provider=tracer_provider,
        )

    # --- Metrics Setup ---
    metrics_url = otlp_metrics_endpoint
    if not metrics_url and otlp_endpoint:
        if "/v1/traces" in otlp_endpoint:
            metrics_url = otlp_endpoint.replace("/v1/traces", "/v1/metrics")
        elif not otlp_endpoint.endswith("/metrics"):
            metrics_url = f"{otlp_endpoint.rstrip('/')}/v1/metrics"
        else:
            metrics_url = otlp_endpoint

    metric_readers = []
    if metrics_url:
        try:
            metric_exporter = OTLPMetricExporter(endpoint=metrics_url)
            # Periodic flush every 2 seconds for near real-time Grafana dashboard updates
            reader = PeriodicExportingMetricReader(metric_exporter, export_interval_millis=2000)
            metric_readers.append(reader)
        except Exception as e:
            logger.warning(f"Could not initialize OTLP metric exporter: {e}")

    _meter_provider = MeterProvider(resource=resource, metric_readers=metric_readers)
    metrics.set_meter_provider(_meter_provider)

    _meter = metrics.get_meter("calisthenics.tracker", version=version)

    # Custom domain metrics
    _workouts_created_counter = _meter.create_counter(
        name="calisthenics_workouts_created_total",
        description="Total number of workouts logged",
        unit="1",
    )
    _reps_logged_counter = _meter.create_counter(
        name="calisthenics_reps_logged_total",
        description="Total number of repetitions logged",
        unit="1",
    )
    _sets_logged_counter = _meter.create_counter(
        name="calisthenics_sets_logged_total",
        description="Total number of sets logged",
        unit="1",
    )
    _workouts_deleted_counter = _meter.create_counter(
        name="calisthenics_workouts_deleted_total",
        description="Total number of workouts deleted",
        unit="1",
    )
    _workout_errors_counter = _meter.create_counter(
        name="calisthenics_workout_errors_total",
        description="Failures and errors in workout operations",
        unit="1",
    )
    _user_logins_counter = _meter.create_counter(
        name="calisthenics_user_logins_total",
        description="Total user authentication logins",
        unit="1",
    )

    logger.info(
        f"OpenTelemetry initialized for '{service_name}' ({environment} v{version}) -> traces: {otlp_endpoint}, metrics: {metrics_url}"
    )


def _get_common_attributes() -> dict:
    return {
        "environment": os.environ.get("ENVIRONMENT", os.environ.get("OTEL_DEPLOYMENT_ENVIRONMENT", "development")),
        "version": os.environ.get("SERVICE_VERSION", os.environ.get("OTEL_SERVICE_VERSION", "1.0.0")),
    }


def record_workout_created(category: str, exercise: str, sets: int, reps: int):
    """Records a new workout creation along with sets and calculated total reps."""
    attrs = {
        **_get_common_attributes(),
        "category": category,
        "exercise": exercise,
    }
    if _workouts_created_counter:
        _workouts_created_counter.add(1, attrs)
    if _sets_logged_counter and sets:
        _sets_logged_counter.add(sets, attrs)
    if _reps_logged_counter and sets and reps:
        _reps_logged_counter.add(sets * reps, attrs)
    flush_metrics()


def record_workout_deleted(category: str):
    """Records workout deletion event."""
    attrs = {
        **_get_common_attributes(),
        "category": category,
    }
    if _workouts_deleted_counter:
        _workouts_deleted_counter.add(1, attrs)
    flush_metrics()


def record_workout_error(operation: str, reason: str):
    """Records failures in workout operations."""
    attrs = {
        **_get_common_attributes(),
        "operation": operation,
        "reason": reason,
    }
    if _workout_errors_counter:
        _workout_errors_counter.add(1, attrs)
    flush_metrics()


def record_user_login(username: str, success: bool):
    """Records authentication login attempt."""
    attrs = {
        **_get_common_attributes(),
        "status": "success" if success else "failed",
    }
    if _user_logins_counter:
        _user_logins_counter.add(1, attrs)
    flush_metrics()


def flush_metrics():
    """Forces flushing in-memory metrics to the OTLP exporter immediately."""
    if _meter_provider:
        try:
            _meter_provider.force_flush(timeout_millis=1500)
        except Exception:
            pass
