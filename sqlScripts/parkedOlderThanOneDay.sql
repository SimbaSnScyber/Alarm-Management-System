
-- Get all towers that have been parked for more than one day
SELECT objid AS 'TowerID', state AS 'State', last_state_timestamp AS 'Time Parked', DATEDIFF(DAY, CONVERT(datetime, last_state_timestamp, 5), GETDATE()) AS 'Days Parked', 
	(SELECT TOP(1) param2 
		FROM [PSIM].[dbo].[PROTOCOL] 
			WHERE (objtype = 'MACRO' AND objid = '5000') and param2 LIKE '%SAR_%' AND param2 LIKE '%audit-site-id":"' + SUBSTRING(STATES.objid, 2, 100) + '"%' ORDER BY date DESC) AS 'Last iCrypto Message',
	(SELECT TOP(1) date 
		FROM [PSIM].[dbo].[PROTOCOL] 
			WHERE (objtype = 'MACRO' AND objid = '5000') and param2 LIKE '%SAR_%' AND param2 LIKE '%audit-site-id":"' + SUBSTRING(STATES.objid, 2, 100) + '"%' ORDER BY date DESC) AS 'Last iCrypto Message Time'
FROM [PSIM].[dbo].[STATES] STATES 
INNER JOIN [PSIM].[dbo].[OBJ_SIGNALTOWER] ST 
ON STATES.objtype = 'SIGNALTOWER' AND (STATES.state = 'PARKED' OR STATES.state = 'BPC_PARKED') AND CONVERT(datetime, ST.last_state_timestamp, 5) <= DATEADD(day, -1, GETDATE()) AND STATES.objid = ST.id
ORDER BY ST.last_state_timestamp DESC