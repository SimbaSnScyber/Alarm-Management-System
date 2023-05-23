-- VMDA Table
select * from (SELECT h.objid, 
(SELECT TOP 1 substring(name,1,11) as name from [PSIM].[dbo].OBJ_CAM_VMDA_DETECTOR WHERE id = h.objid) as siteId, 
h.number_of_triggers FROM 
	(SELECT objid, count(objid) as number_of_triggers
		FROM [PSIM].[dbo].[PROTOCOL]
		WITH (NOLOCK)
		WHERE date >= '2022-06-08 00:00:00' AND objtype = 'CAM_VMDA_DETECTOR' AND action = 'ALARM'
		GROUP by objid
		HAVING count(objid) > 10) h) v

-- Zones Table		
select * from (select c.siteId, c.Zone1, c.Zone2, c.Zone3, c.Zone4, c.Zone5 from (Select objid as siteId, 
count(case param1 WHEN ' (Zone 001)' Then 1 else NULL END) as Zone1,
count(case param1 WHEN ' (Zone 002)' Then 1 else NULL END) as Zone2,
count(case param1 WHEN ' (Zone 003)' Then 1 else NULL END) as Zone3,
count(case param1 WHEN ' (Zone 004)' Then 1 else NULL END) as Zone4,
count(case param1 WHEN ' (Zone 005)' Then 1 else NULL END) as Zone5
FROM [PSIM].[dbo].[PROTOCOL] 
WITH (NOLOCK)
where objtype = 'SIGNALTOWER'
	and date >= '2022-04-14 00:00:00'
	and param1 != ' (Zone 000)' 
	GROUP BY objid) c
	where (Zone1 > 1 or Zone2 > 1 or Zone3 > 1 or Zone4 > 1 or Zone5 > 1)) g