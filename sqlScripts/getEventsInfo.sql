-- Get count of VMDA Events
SELECT
    COALESCE(count([objid]), '0') AS cnt
FROM
    [PSIM].[dbo].[PROTOCOL] WITH(NOLOCK)
WHERE
    [PSIM].[dbo].[PROTOCOL].[objtype] = 'CAM_VMDA_DETECTOR'
    AND [action] = 'ALARM'
    AND [objid] = 'id of detector'
    AND [date] >= DATEADD(HOUR, -12, GETDATE());

-- Get time of last VMDA Event
SELECT
    TOP(1) CONVERT(varchar, [date], 120) AS [date]
FROM
    [PSIM].[dbo].[PROTOCOL] WITH(NOLOCK)
WHERE
    [PSIM].[dbo].[PROTOCOL].[objtype] = 'CAM_VMDA_DETECTOR'
    AND [action] = 'ALARM'
    AND [objid] = 'id of detector'
    AND [date] >= DATEADD(HOUR, -12, GETDATE())
ORDER BY
    date DESC;

-- Get count of SignalTower Events
SELECT
    CONCAT(COALESCE(count(pk), '0'), ';')
FROM
    [PSIM].[dbo].[PROTOCOL] WITH (NOLOCK)
WHERE
    [objtype] = 'SIGNALTOWER'
    AND [objid] = 'Tower ID'
    AND param1 = ' (Zone 0XX)'
    AND [date] >= DATEADD(HOUR, -12, GETDATE());

-- Get time and description of last SignalTower Event
SELECT
    TOP(1) CONVERT(varchar, [date], 120) + ';' AS [date],
    (
        SELECT
            TOP 1 description
        FROM
            [PSIM].[dbo].[EVENT]
        WHERE
            EVENT.action = PROTOCOL.action
    ) + ';' AS [type]
FROM
    [PSIM].[dbo].[PROTOCOL] WITH (NOLOCK)
WHERE
    [objtype] = 'SIGNALTOWER'
    AND [objid] = 'Tower ID'
    AND param1 = ' (Zone 0XX)'
    AND [date] >= DATEADD(HOUR, -12, GETDATE())
ORDER BY
    [date] DESC;