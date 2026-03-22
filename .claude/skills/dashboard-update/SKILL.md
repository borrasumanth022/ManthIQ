---
name: dashboard-update
description: Add or modify a metric card, chart, or tab on the ManthIQ dashboard
---

# Dashboard Update Skill

Use this workflow when adding or changing any visual element in the Live or Model Lab tabs.

## Checklist

1. **Identify the target page** — `src/frontend/src/pages/Dashboard.jsx` (Live tab) or `src/frontend/src/pages/ModelLab.jsx` (Model Lab tab)
2. **Check if a reusable component exists** — look in `src/frontend/src/components/` before creating new files
   - `MetricCard.jsx` — stat cards with label, value, change arrow
   - `PriceChart.jsx` — OHLCV + optional predicted line overlay
   - `Navbar.jsx` — do not modify unless adding a new top-level tab
3. **Wire backend data** — if new data is needed, add an endpoint to `src/backend/main.py` first (use the `api-endpoint` skill)
4. **Theme safety** — every className must include both light and dark variants, e.g. `text-gray-900 dark:text-white`
5. **Test in both themes** — toggle with the sun/moon button in the navbar

## Component conventions

```jsx
// MetricCard usage
<MetricCard
  label="Label text"
  value="$123.45"
  sub="descriptor"
  change={1.23}          // positive = green arrow up, negative = red arrow down
/>

// PriceChart with predictions
<PriceChart data={priceData} showPredicted={true} predictions={predData} />
```

## Dark mode pattern

```jsx
// Always pair light + dark classes
<div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
```

## After changes

Run the frontend dev server and verify both Live and Model Lab tabs render without console errors.
