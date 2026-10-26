import os
import logging
from opentelemetry import trace
from opentelemetry.exporter.otlp.proto.http.trace_exporter import OTLPSpanExporter
from opentelemetry.instrumentation.fastapi import FastAPIInstrumentor
from opentelemetry.instrumentation.sqlalchemy import SQLAlchemyInstrumentor
from opentelemetry.sdk.resources import Resource
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor

logger = logging.getLogger(__name__)


def setup_telemetry(app, engine=None):
    """
    Configures OpenTelemetry instrumentation for FastAPI and SQLAlchemy.
    Injects standard resource attributes: service name, environment, and version.
    """
    service_name = os.environ.get("OTEL_SERVICE_NAME", "calisthenics-tracker-api")
    environment = os.environ.get("ENVIRONMENT", os.environ.get("OTEL_DEPLOYMENT_ENVIRONMENT", "development"))
    version = os.environ.get("SERVICE_VERSION", os.environ.get("OTEL_SERVICE_VERSION", "1.0.0"))
    otlp_endpoint = os.environ.get("OTEL_EXPORTER_OTLP_ENDPOINT")
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

    # Set up TracerProvider
    tracer_provider = TracerProvider(resource=resource)

    # Attach OTLP HTTP trace exporter if an endpoint is configured
    if otlp_endpoint:
        try:
            otlp_exporter = OTLPSpanExporter(endpoint=otlp_endpoint)
            span_processor = BatchSpanProcessor(otlp_exporter)
            tracer_provider.add_span_processor(span_processor)
        except Exception as e:
            logger.warning(f"Could not initialize OTLP exporter: {e}")

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

    logger.info(
        f"OpenTelemetry initialized for '{service_name}' ({environment} v{version}) -> {otlp_endpoint}"
    )
