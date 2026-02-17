# Fraud Radar — Data Card

## Status
Synthetic (default)

## What’s included
- A small company universe with quarterly “filings” from 2018–2024
- Features: Beneish-like score proxy, sentiment proxy, deception intensity proxy
- Composite risk score in [0,1]
- A similarity graph that clusters companies by average risk/deception
- Synthetic backtest equity curves with an illustrative annualized alpha

## Core assumptions (synthetic)
- Filing features are generated from a smooth latent risk process + noise.
- Known “fraud” tickers have explicit spike events (e.g., NKLA 2020-05-15).
- The backtest is illustrative; no claims about real-world tradability.

## Real-world swap
- SEC EDGAR 10-K/10-Q text + financial statements
- FinBERT or modern embedding-based language features
- Event labels from enforcement actions + robust cross-validation

