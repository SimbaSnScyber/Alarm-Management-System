-- Change date value

SELECT (SELECT TOP 1 name FROM OBJ_REGION WHERE id = c.region_id) as site, c.CC1, c.CC2, c.TC1, c.TC2, c.TC3, c.Door_contact, c.Motion_sensor, c.Vibration1, c.Vibration2, c.Vibration3 from (Select region_id, 
count(case WHEN param0 LIKE '%CC1%' Then 1 else NULL END) as CC1,
count(case WHEN param0 LIKE '%CC2%' Then 1 else NULL END) as CC2,
count(case WHEN param0 LIKE '%TC1%' Then 1 else NULL END) as TC1,
count(case WHEN param0 LIKE '%TC2%' Then 1 else NULL END) as TC2,
count(case WHEN param0 LIKE '%TC3%' Then 1 else NULL END) as TC3,
count(case param1 WHEN ' (Zone 001)' Then 1 else NULL END) as Door_contact,
count(case param1 WHEN ' (Zone 002)' Then 1 else NULL END) as Motion_Sensor,
count(case param1 WHEN ' (Zone 003)' Then 1 else NULL END) as Vibration1,
count(case param1 WHEN ' (Zone 004)' Then 1 else NULL END) as Vibration2,
count(case param1 WHEN ' (Zone 005)' Then 1 else NULL END) as Vibration3
FROM [PSIM].[dbo].[PROTOCOL]
WITH (NOLOCK,NOWAIT)
where ((objtype = 'CAM_VMDA_DETECTOR' and action = 'ALARM') OR (objtype = 'SIGNALTOWER'))
	and date >= '2022-06-08 00:00:00'
	AND region_id != ''
	GROUP BY region_id) c
	where (CC1 > 1 or CC2 > 1 or TC1 > 1 or TC2 > 1 or TC3 > 1 OR Door_contact > 1 OR Motion_Sensor > 1 OR Vibration1 > 1 OR Vibration2 > 1 OR Vibration3 > 1)