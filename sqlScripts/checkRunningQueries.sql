-- Stored procedure used by MTN SQL DBAs. Returns actively running queries on the DB
EXEC sp_whoisactive 

OR

-- Returns information on queries running on the DB. Does not return the queries themselves
SELECT P.spid,
       RIGHT(CONVERT(VARCHAR, Dateadd(ms, Datediff(ms, P.last_batch, Getdate()), '1900-01-01' ), 121), 12) AS 'batch_duration',
       P.program_name,
       P.hostname,
       P.loginame
FROM   master.dbo.sysprocesses P
WHERE  P.spid > 50
       AND P.status NOT IN ( 'background', 'sleeping' )
       AND P.cmd NOT IN ( 'AWAITING COMMAND', 'MIRROR HANDLER', 'LAZY WRITER', 'CHECKPOINT SLEEP', 'RA MANAGER' )
ORDER  BY batch_duration DESC, spid

-- Get Past Queries that are like N'%%'
SELECT t.[text], s.last_execution_time
FROM sys.dm_exec_cached_plans AS p
INNER JOIN sys.dm_exec_query_stats AS s
   ON p.plan_handle = s.plan_handle
CROSS APPLY sys.dm_exec_sql_text(p.plan_handle) AS t
WHERE t.[text] LIKE N'%INSERT INTO PROTOCOL_INC_SERVER%'
ORDER BY s.last_execution_time DESC
