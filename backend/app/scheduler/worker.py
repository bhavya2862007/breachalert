from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.interval import IntervalTrigger

from app.scheduler.jobs import scan_all_assets

scheduler = AsyncIOScheduler()


def start_scheduler():
    if scheduler.running:
        return

    scheduler.add_job(
        scan_all_assets,
        IntervalTrigger(minutes=1),   # testing
        id="nightly_scan",
        replace_existing=True,
    )

    scheduler.start()

    print("🛡️ Scheduler running (every 1 minute)")