-- Check Motion detectors that trigger a certain amount of times during a certain day(s)
SELECT h.objid, (SELECT TOP 1 name from [PSIM].dbo.OBJ_CAM_VMDA_DETECTOR WHERE id = h.objid) as vmda, h.number_of_triggers FROM 
	(SELECT objid, count(objid) as number_of_triggers
		FROM [PSIM].[dbo].[PROTOCOL]
		WITH (NOLOCK)
		WHERE date >= '2022-04-07 00:00:00' AND objtype = 'CAM_VMDA_DETECTOR' AND action = 'ALARM'
		GROUP by objid
		HAVING count(objid) > 10) h -- Change this numerical value to find detectors that have triggered >N amount of times
		ORDER by h.number_of_triggers DESC