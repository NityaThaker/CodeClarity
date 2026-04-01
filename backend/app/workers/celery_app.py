from celery import Celery
import os

REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379")

celery_app = Celery(
    "codeclarity",
    broker=REDIS_URL,
    backend=REDIS_URL,
    include=["app.workers.tasks"]  # this line registers the tasks
)

celery_app.conf.update(
    task_serializer="json",
    result_serializer="json",
    accept_content=["json"],
    timezone="UTC",
)