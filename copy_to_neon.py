import os
import pandas as pd
from sqlalchemy import create_engine, inspect, text

local = create_engine(os.environ["LOCAL_DB_URL"])
neon = create_engine(os.environ["NEON_DB_URL"])

insp = inspect(local)
skip = {"information_schema", "pg_catalog", "pg_toast"}

for schema in insp.get_schema_names():
    if schema in skip:
        continue

    names = insp.get_table_names(schema=schema) + insp.get_view_names(schema=schema)
    if not names:
        continue

    with neon.begin() as conn:
        conn.execute(text(f'CREATE SCHEMA IF NOT EXISTS "{schema}"'))

    for name in names:
        df = pd.read_sql_table(name, local, schema=schema) if name in insp.get_table_names(schema=schema) \
            else pd.read_sql(f'SELECT * FROM "{schema}"."{name}"', local)
        df.to_sql(name, neon, schema=schema, if_exists="replace", index=False)
        print(f"Copied {schema}.{name}: {len(df)} rows")

print("Done")