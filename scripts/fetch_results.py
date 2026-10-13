"""Pulls quiz result counts from Google Analytics 4 and writes data/results.json.

Run automatically by .github/workflows/update-results.yml (hourly).
Needs two GitHub repository secrets:
  GA_PROPERTY_ID   – the numeric GA4 property ID (Admin → Property details), e.g. 412345678
  GA_SA_KEY        – the full JSON key of a Google Cloud service account that has
                     "Viewer" access on that GA4 property
Optional repository variable:
  GA_START_DATE    – first day to count from, YYYY-MM-DD (default: 2026-10-01)

GA setup: the site sends an event named "quiz_complete" with a parameter "character".
Register "character" as an EVENT-scoped custom dimension in GA (Admin → Custom definitions),
otherwise GA won't let this script break counts down by character.
"""
import json, os, sys, datetime

from google.analytics.data_v1beta import BetaAnalyticsDataClient
from google.analytics.data_v1beta.types import (
    DateRange, Dimension, Metric, RunReportRequest, FilterExpression, Filter,
)
from google.oauth2 import service_account

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "data", "results.json")
IDS = ["sol", "rebel", "captain", "sequoia", "rascal", "ocean", "atlas",
       "compass", "flora", "lorey", "pixie", "flow", "ash"]


def main():
    prop = os.environ.get("GA_PROPERTY_ID", "").strip()
    key = os.environ.get("GA_SA_KEY", "").strip()
    start = os.environ.get("GA_START_DATE", "").strip() or "2026-10-01"
    if not prop or not key:
        print("GA_PROPERTY_ID / GA_SA_KEY not set — leaving results.json unchanged.")
        return 0

    creds = service_account.Credentials.from_service_account_info(
        json.loads(key), scopes=["https://www.googleapis.com/auth/analytics.readonly"])
    client = BetaAnalyticsDataClient(credentials=creds)
    req = RunReportRequest(
        property=f"properties/{prop}",
        dimensions=[Dimension(name="customEvent:character")],
        metrics=[Metric(name="eventCount")],
        date_ranges=[DateRange(start_date=start, end_date="today")],
        dimension_filter=FilterExpression(filter=Filter(
            field_name="eventName",
            string_filter=Filter.StringFilter(value="quiz_complete"))),
    )
    resp = client.run_report(req)

    counts = {i: 0 for i in IDS}
    for row in resp.rows:
        cid = row.dimension_values[0].value
        if cid in counts:
            counts[cid] = int(row.metric_values[0].value)

    data = {
        "source": "google-analytics",
        "updated": datetime.datetime.now(datetime.timezone.utc).replace(microsecond=0).isoformat(),
        "counts": counts,
    }
    with open(OUT, "w") as f:
        json.dump(data, f, indent=2)
        f.write("\n")
    print("Wrote", OUT, counts)
    return 0


if __name__ == "__main__":
    sys.exit(main())
