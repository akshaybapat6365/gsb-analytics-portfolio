from __future__ import annotations

from typing import Any, Dict, List


OPEN_DATA_CATALOG: Dict[str, Dict[str, Any]] = {
    "ord-lga-price-war": {
        "title": "United vs. Delta: ORD-LGA Price War",
        "dataDir": "airline",
        "sources": [
            {
                "id": "fred_airfare_cpi",
                "label": "FRED Airfare CPI YoY",
                "sourceKey": "fred:CUSR0000SETG01",
                "url": "https://fred.stlouisfed.org/series/CUSR0000SETG01",
                "opennessScore": 95,
                "expectedSignalIds": ["airfare_cpi_yoy"],
                "kind": "macro_price_index",
            },
            {
                "id": "stooq_ual",
                "label": "Stooq UAL daily prices",
                "sourceKey": "stooq:UAL",
                "url": "https://stooq.com/",
                "opennessScore": 82,
                "expectedSignalIds": ["ual_30d_return"],
                "kind": "market_proxy",
            },
            {
                "id": "stooq_dal",
                "label": "Stooq DAL daily prices",
                "sourceKey": "stooq:DAL",
                "url": "https://stooq.com/",
                "opennessScore": 82,
                "expectedSignalIds": ["dal_30d_return"],
                "kind": "market_proxy",
            },
            {
                "id": "bts_odb",
                "label": "BTS O&D/DB route aggregates",
                "sourceKey": "bts:od-data",
                "url": "https://www.bts.gov/topics/airlines-and-airports/origin-and-destination-survey-data",
                "opennessScore": 90,
                "expectedSignalIds": [],
                "kind": "route_ground_truth_reference",
            },
        ],
        "qualityRubric": {
            "coverage": 30,
            "freshness": 20,
            "modelDepth": 30,
            "provenance": 20,
        },
    },
    "fraud-radar": {
        "title": "Shorting Nikola: Pre-Collapse Fraud Detection",
        "dataDir": "fraud",
        "sources": [
            {
                "id": "sec_nkla",
                "label": "SEC EDGAR filings (NKLA)",
                "sourceKey": "sec:0001731289",
                "url": "https://data.sec.gov/",
                "opennessScore": 96,
                "expectedSignalIds": ["nkla_recent_10k_10q"],
                "kind": "filings_primary",
            },
            {
                "id": "stooq_spy",
                "label": "Stooq SPY daily prices",
                "sourceKey": "stooq:SPY",
                "url": "https://stooq.com/",
                "opennessScore": 82,
                "expectedSignalIds": ["spy_30d_return"],
                "kind": "market_context",
            },
            {
                "id": "sec_api_docs",
                "label": "SEC API docs",
                "sourceKey": "sec:api-docs",
                "url": "https://www.sec.gov/search-filings/edgar-application-programming-interfaces",
                "opennessScore": 100,
                "expectedSignalIds": [],
                "kind": "governance_reference",
            },
        ],
        "qualityRubric": {
            "coverage": 35,
            "freshness": 20,
            "modelDepth": 25,
            "provenance": 20,
        },
    },
    "target-shrink": {
        "title": "Target Shrink: Loss Prevention Economics",
        "dataDir": "shrink",
        "sources": [
            {
                "id": "stooq_tgt",
                "label": "Stooq TGT daily prices",
                "sourceKey": "stooq:TGT",
                "url": "https://stooq.com/",
                "opennessScore": 82,
                "expectedSignalIds": ["tgt_30d_return"],
                "kind": "market_context",
            },
            {
                "id": "stooq_wmt",
                "label": "Stooq WMT daily prices",
                "sourceKey": "stooq:WMT",
                "url": "https://stooq.com/",
                "opennessScore": 82,
                "expectedSignalIds": ["wmt_30d_return"],
                "kind": "market_context",
            },
            {
                "id": "lprc_public_notes",
                "label": "Public retail-loss reference corpus",
                "sourceKey": "retail-loss:public-reference",
                "url": "https://lpresearch.org/",
                "opennessScore": 45,
                "expectedSignalIds": [],
                "kind": "domain_reference_limited",
            },
        ],
        "qualityRubric": {
            "coverage": 40,
            "freshness": 20,
            "modelDepth": 25,
            "provenance": 15,
        },
    },
    "starbucks-pivot": {
        "title": "Starbucks Suburban Pivot",
        "dataDir": "starbucks",
        "sources": [
            {
                "id": "census_denver_remote",
                "label": "Census ACS remote commuter share (Denver MSA)",
                "sourceKey": "census:acs1:B08006",
                "url": "https://api.census.gov/data/2023/acs/acs1",
                "opennessScore": 95,
                "expectedSignalIds": ["denver_remote_share"],
                "kind": "commute_primary",
            },
            {
                "id": "stooq_sbux",
                "label": "Stooq SBUX daily prices",
                "sourceKey": "stooq:SBUX",
                "url": "https://stooq.com/",
                "opennessScore": 82,
                "expectedSignalIds": ["sbux_30d_return"],
                "kind": "market_context",
            },
            {
                "id": "lodes_reference",
                "label": "LEHD/LODES download access",
                "sourceKey": "census:lodes",
                "url": "https://lehd.ces.census.gov/php/inc_lodesDownloadTool.php",
                "opennessScore": 90,
                "expectedSignalIds": [],
                "kind": "geo_commute_reference",
            },
        ],
        "qualityRubric": {
            "coverage": 30,
            "freshness": 20,
            "modelDepth": 30,
            "provenance": 20,
        },
    },
    "tesla-nacs": {
        "title": "Tesla NACS Gambit",
        "dataDir": "ev",
        "sources": [
            {
                "id": "nrel_ca_ev",
                "label": "NREL AFDC CA station count",
                "sourceKey": "nrel:afdc",
                "url": "https://developer.nrel.gov/docs/transportation/alt-fuel-stations-v1/",
                "opennessScore": 92,
                "expectedSignalIds": ["ca_ev_station_count"],
                "kind": "station_inventory_primary",
            },
            {
                "id": "nrel_i5_corridor",
                "label": "NREL AFDC I-5 corridor station estimate",
                "sourceKey": "nrel:afdc",
                "url": "https://developer.nrel.gov/docs/transportation/alt-fuel-stations-v1/",
                "opennessScore": 92,
                "expectedSignalIds": ["i5_corridor_stations"],
                "kind": "corridor_density_primary",
            },
            {
                "id": "stooq_tsla",
                "label": "Stooq TSLA daily prices",
                "sourceKey": "stooq:TSLA",
                "url": "https://stooq.com/",
                "opennessScore": 82,
                "expectedSignalIds": ["tsla_30d_return"],
                "kind": "market_context",
            },
        ],
        "qualityRubric": {
            "coverage": 35,
            "freshness": 20,
            "modelDepth": 25,
            "provenance": 20,
        },
    },
    "netflix-roi": {
        "title": "Netflix Content ROI Autopsy",
        "dataDir": "netflix",
        "sources": [
            {
                "id": "sec_nflx",
                "label": "SEC EDGAR filings (NFLX)",
                "sourceKey": "sec:0001065280",
                "url": "https://data.sec.gov/",
                "opennessScore": 96,
                "expectedSignalIds": ["nflx_recent_10k_10q"],
                "kind": "filings_primary",
            },
            {
                "id": "stooq_nflx",
                "label": "Stooq NFLX daily prices",
                "sourceKey": "stooq:NFLX",
                "url": "https://stooq.com/",
                "opennessScore": 82,
                "expectedSignalIds": ["nflx_30d_return"],
                "kind": "market_context",
            },
            {
                "id": "google_trends_daily",
                "label": "Google Trends daily presence",
                "sourceKey": "google-trends:dailytrends",
                "url": "https://developers.google.com/search/apis/trends",
                "opennessScore": 78,
                "expectedSignalIds": ["netflix_daily_trend_presence"],
                "kind": "attention_proxy",
            },
            {
                "id": "imdb_noncommercial",
                "label": "IMDb non-commercial datasets",
                "sourceKey": "imdb:noncommercial",
                "url": "https://developer.imdb.com/non-commercial-datasets/",
                "opennessScore": 86,
                "expectedSignalIds": [],
                "kind": "title_reference",
            },
        ],
        "qualityRubric": {
            "coverage": 30,
            "freshness": 20,
            "modelDepth": 30,
            "provenance": 20,
        },
    },
}


def project_slugs() -> List[str]:
    return sorted(OPEN_DATA_CATALOG.keys())


def project_to_data_dir() -> Dict[str, str]:
    return {slug: cfg["dataDir"] for slug, cfg in OPEN_DATA_CATALOG.items()}
