# 3-minute demo script — VeriHub Civic MVP

Goal: show (a) baseline problems, (b) “after” rerun with measurable improvement, (c) FR↔NL drift as a real civic risk.

## 0:00–0:30 — Context
1) Open **Dashboard**:
   - “This tool audits what an LLM answers about civic services (FR/NL).”
2) Open **Question Sets**:
   - Show FR + NL question pairs, topics, and risk tags (deadline/contact/docs/etc.).

## 0:30–1:30 — Baseline audit (mock-baseline)
3) Go to **Audit Runs** → **New Run**:
   - Question set: `demoville_residence_v2`
   - Provider: `mock-baseline`
   - Start
4) Open the run → **Findings**:
   - Filter `type=incorrect`: show 1–2 examples (wrong appointment link, wrong fee, wrong phone).
   - Filter `type=ungrounded`: show answers without sources/citations.
   - Filter `type=drift`: show FR vs NL mismatch (opening hours / walk-in policy / deadlines).

Tip: open one finding card and point to:
- extracted value
- expected fact key
- suggested fix

## 1:30–2:30 — After rerun (mock-after)
5) Create a second run:
   - Provider: `mock-after`
6) Open **Comparison** (or open the second run):
   - Show that `incorrect` and `ungrounded` findings drop.
   - Open the same “problem question” and show it now uses the official link and includes a citation marker.

## 2:30–3:00 — Close (drif
