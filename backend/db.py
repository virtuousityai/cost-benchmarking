import duckdb
import os
import shutil


def _get_db_path():
    src = os.path.join(os.path.dirname(__file__), "data", "benchmarking.duckdb")
    # Vercel's filesystem is read-only; copy to /tmp for DuckDB
    if os.environ.get("VERCEL"):
        tmp_path = "/tmp/benchmarking.duckdb"
        if not os.path.exists(tmp_path):
            shutil.copy2(src, tmp_path)
        return tmp_path
    return src


DB_PATH = _get_db_path()


def get_con():
    return duckdb.connect(DB_PATH, read_only=True)
