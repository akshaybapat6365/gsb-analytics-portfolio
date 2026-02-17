from __future__ import annotations

import math
import random
from datetime import date
from typing import Any, Dict, List, Tuple


def _clamp(x: float, lo: float, hi: float) -> float:
    return max(lo, min(hi, x))


def _quarter_dates(start_year: int, end_year: int) -> List[str]:
    out: List[str] = []
    for y in range(start_year, end_year + 1):
        for m, d in [(3, 31), (6, 30), (9, 30), (12, 31)]:
            out.append(date(y, m, d).isoformat())
    return out


def _monthly_dates(start_year: int, end_year: int) -> List[str]:
    out: List[str] = []
    for y in range(start_year, end_year + 1):
        for m in range(1, 13):
            out.append(date(y, m, 1).isoformat())
    return out


def generate_payload(seed: int = 1337) -> Dict[str, Any]:
    rng = random.Random(seed)

    companies = [
        ("AAPL", "Apple"),
        ("MSFT", "Microsoft"),
        ("AMZN", "Amazon"),
        ("TSLA", "Tesla"),
        ("JPM", "JPMorgan Chase"),
        ("KO", "Coca-Cola"),
        ("WMT", "Walmart"),
        ("NKLA", "Nikola"),
        ("LKNCY", "Luckin Coffee (ADR)"),
        ("FTX", "FTX (Synthetic)"),
        ("XYZ", "MidCap Industrials (Synthetic)"),
        ("ABCD", "Growth SaaS (Synthetic)"),
    ]

    quarter_dates = _quarter_dates(2018, 2024)

    filings: List[Dict[str, Any]] = []

    def base_profile(ticker: str) -> Tuple[float, float]:
        # (base risk, base deception)
        if ticker in ("NKLA", "LKNCY", "FTX"):
            return (0.35 + rng.random() * 0.12, 0.35 + rng.random() * 0.2)
        return (0.12 + rng.random() * 0.08, 0.10 + rng.random() * 0.12)

    profiles = {t: base_profile(t) for t, _ in companies}

    # Insert special “flag” filings for narrative parity with the brief.
    special = {
        ("NKLA", "2020-05-15"): {
            "topSignals": [
                "MD&A: 'revenue' mentions up while 'delivery' stays near-zero",
                "Cash conversion deteriorates; receivables inflate",
                "Sentiment-action mismatch (optimism without operating evidence)",
            ],
            "riskBoost": 0.48,
        },
        ("LKNCY", "2020-04-15"): {
            "topSignals": [
                "Unusual revenue growth vs. traffic proxy",
                "Margin expansion out of line with peers",
                "Higher abstraction language + fewer self-references",
            ],
            "riskBoost": 0.44,
        },
        ("FTX", "2022-11-15"): {
            "topSignals": [
                "Opaque related-party exposure language increases",
                "Liquidity wording shifts: 'counterparty'/'risk' spikes",
                "Disclosure density drops as valuation claims rise",
            ],
            "riskBoost": 0.52,
        },
    }

    for ticker, _name in companies:
        base_risk, base_deception = profiles[ticker]

        for dt in quarter_dates:
            # Smooth-ish time series with noise.
            t = int(dt[:4]) - 2018
            cyc = 0.04 * math.sin((t * 4 + int(dt[5:7])) / 3.0)
            beneish = -2.1 + 0.6 * base_risk + cyc + rng.gauss(0, 0.12)
            sentiment = rng.gauss(0.02 - 0.12 * base_risk, 0.10)
            deception = _clamp(base_deception + rng.gauss(0, 0.08) + 0.25 * max(0, beneish + 1.78), 0, 1)

            # Composite risk in [0,1].
            risk = _clamp(
                0.55 * _clamp((beneish + 2.6) / 1.4, 0, 1)
                + 0.30 * _clamp(deception, 0, 1)
                + 0.15 * _clamp(0.5 - sentiment, 0, 1),
                0,
                1,
            )

            top = [
                "Receivables growth outpaces sales",
                "Non-GAAP reconciliation complexity rises",
                "MD&A specificity declines (more abstraction)",
            ]

            filings.append(
                {
                    "ticker": ticker,
                    "filingDate": dt,
                    "beneishM": round(beneish, 2),
                    "sentiment": round(sentiment, 2),
                    "deception": round(deception, 2),
                    "riskScore": round(risk, 2),
                    "topSignals": top,
                }
            )

        # Add special filings (not necessarily aligned with quarter ends).
        for (tkr, dt), spec in special.items():
            if tkr != ticker:
                continue
            base_risk, base_deception = profiles[ticker]
            beneish = -1.4 + rng.gauss(0, 0.10)
            sentiment = -0.22 + rng.gauss(0, 0.06)
            deception = _clamp(0.70 + rng.gauss(0, 0.06), 0, 1)
            risk = _clamp(0.55 * 0.92 + 0.30 * deception + 0.15 * 0.85 + spec["riskBoost"], 0, 1)

            filings.append(
                {
                    "ticker": ticker,
                    "filingDate": dt,
                    "beneishM": round(beneish, 2),
                    "sentiment": round(sentiment, 2),
                    "deception": round(deception, 2),
                    "riskScore": round(risk, 2),
                    "topSignals": spec["topSignals"],
                }
            )

    # Build a small similarity graph based on average risk/deception.
    def avg_metrics(ticker: str) -> Tuple[float, float]:
        fs = [f for f in filings if f["ticker"] == ticker]
        r = sum(f["riskScore"] for f in fs) / len(fs)
        d = sum(f["deception"] for f in fs) / len(fs)
        return (r, d)

    avgs = {t: avg_metrics(t) for t, _ in companies}

    nodes: List[Dict[str, Any]] = []
    for t, _name in companies:
        r, d = avgs[t]
        group = 3 if r > 0.55 else 2 if r > 0.32 else 1
        nodes.append({"id": t, "group": group})

    links: List[Dict[str, Any]] = []
    tickers = [t for t, _ in companies]
    for i in range(len(tickers)):
        for j in range(i + 1, len(tickers)):
            a = tickers[i]
            b = tickers[j]
            ra, da = avgs[a]
            rb, db = avgs[b]
            dist = math.sqrt((ra - rb) ** 2 + (da - db) ** 2)
            w = _clamp(1.0 - dist * 1.6, 0, 1)
            if w > 0.55:
                links.append({"source": a, "target": b, "weight": round(w, 2)})

    # Backtest series (synthetic)
    dates = _monthly_dates(2019, 2024)
    s = 1.0
    b = 1.0
    strat: List[float] = []
    bench: List[float] = []
    for _dt in dates:
        s *= 1.009 + rng.gauss(0, 0.012)
        b *= 1.0055 + rng.gauss(0, 0.010)
        strat.append(round(s, 4))
        bench.append(round(b, 4))

    payload: Dict[str, Any] = {
        "companies": [{"ticker": t, "name": n} for t, n in companies],
        "filings": filings,
        "graph": {"nodes": nodes, "links": links},
        "backtest": {
            "dates": dates,
            "strategy": strat,
            "benchmark": bench,
            "annualizedAlpha": 0.34,
        },
    }

    return payload

