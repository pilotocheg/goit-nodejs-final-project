# Seed CSV fixtures

These CSV files are used to seed a local/dev database.

## Run

- `npm run seed` — insert missing rows (does not delete existing data)
- `npm run seed:truncate` — truncate tables and re-import (dev only)

## Notes

- CSV files live in `src/data/seed/`.
- Never run truncate against a shared/prod database.
