import pandas as pd
import numpy as np
import os
import json

def load_dataframe(file_id: str) -> pd.DataFrame:
    for ext in ["csv", "xlsx", "json"]:
        path = f"uploads/{file_id}.{ext}"
        if os.path.exists(path):
            if ext == "csv":   return pd.read_csv(path)
            if ext == "xlsx":  return pd.read_excel(path)
            if ext == "json":  return pd.read_json(path)
    raise FileNotFoundError(f"No file found for ID: {file_id}")

def clean_for_json(obj):
    """Convert numpy/pandas types to native Python types for JSON serialization"""
    if isinstance(obj, (np.integer, np.floating)):
        if np.isnan(obj) or np.isinf(obj):
            return None
        return obj.item()
    elif isinstance(obj, np.ndarray):
        return [clean_for_json(item) for item in obj]
    elif isinstance(obj, dict):
        return {key: clean_for_json(value) for key, value in obj.items()}
    elif isinstance(obj, list):
        return [clean_for_json(item) for item in obj]
    elif isinstance(obj, tuple):
        return tuple(clean_for_json(item) for item in obj)
    elif pd.isna(obj):
        return None
    return obj

def get_summary(df: pd.DataFrame) -> dict:
    # Replace invalid float values (NaN, inf, -inf) with None for JSON compatibility
    describe_df = df.describe(include="all").replace([np.inf, -np.inf], np.nan)
    sample_df = df.head(5).replace([np.inf, -np.inf], np.nan)
    
    summary = {
        "shape": df.shape,
        "columns": list(df.columns),
        "dtypes": df.dtypes.astype(str).to_dict(),
        "describe": describe_df.to_dict(),
        "null_counts": df.isnull().sum().to_dict(),
        "sample": sample_df.to_dict(orient="records"),
    }
    
    # Clean all numpy types for JSON serialization
    return clean_for_json(summary)

def get_correlation_matrix(df: pd.DataFrame) -> dict:
    """Calculate correlation matrix for numeric columns"""
    numeric_df = df.select_dtypes(include=['number'])
    
    if numeric_df.empty:
        raise ValueError("No numeric columns found for correlation analysis")
    
    if numeric_df.shape[1] < 2:
        raise ValueError("Need at least 2 numeric columns for correlation analysis")
    
    corr_matrix = numeric_df.corr()
    
    # Find strong correlations (absolute value > 0.7, excluding diagonal)
    strong_correlations = []
    for i in range(len(corr_matrix.columns)):
        for j in range(i+1, len(corr_matrix.columns)):
            corr_value = corr_matrix.iloc[i, j]
            if abs(corr_value) > 0.7:
                strong_correlations.append({
                    "column1": corr_matrix.columns[i],
                    "column2": corr_matrix.columns[j],
                    "correlation": float(corr_value)
                })
    
    result = {
        "correlation_matrix": corr_matrix.to_dict(),
        "numeric_columns": list(numeric_df.columns),
        "strong_correlations": strong_correlations,
        "summary": {
            "total_numeric_columns": len(numeric_df.columns),
            "strong_correlations_count": len(strong_correlations)
        }
    }
    
    return clean_for_json(result)