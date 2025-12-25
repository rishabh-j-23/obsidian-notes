---
tags:
  - azure
---
- Used for high volume, high velocity and raw data ingestion 
- Uses [[KQL (Kuzto Query Language)]]. Also supports [[T-SQL]]
- Ingestion of massive amount of data in real time
- Analysis of raw data

> Most used for:  ingesting and querying telemetry, logs, events, traces, and time series data

# Steps:
1. **Create Database**
    1. 10K DB/cluster and 10K Tables/DB
    2. Data stored in shared called "extents"
        1. auto indexed and partitioned based on ingestion time
2. **Ingest Data**
    1. Ingestion Methods
        1. [[One-time Data Ingestion]]
        2. [[Continuous Data Ingestion]]
        3. [[Direct Ingestion with Management Commands]]
3. **Query Database**
    1. use [[KQL (Kuzto Query Language)]]
    2. support programmatic queries via SDK or REST api 
4. Visualize results
    1. use tools like [[Grafana]] or [[Power BI]]


# Working
> [!Docs] 
> https://learn.microsoft.com/en-us/azure/data-explorer/how-it-works

1. **Storage vs Compute**
    1. Persistent Data => [[Azure Blob Storage]] 
    2. Compute resources => Temp data store or cache
2. 
