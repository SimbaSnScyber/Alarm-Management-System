SELECT (SELECT TOP 1 parent_id
        FROM   [PSIM].[dbo].[obj_grabber]
        WHERE  id = g.grabber_id) AS server_name,
       cam_id,
       camera_name,
       (SELECT TOP 1 [name]
        FROM   [PSIM].[dbo].[obj_region]
        WHERE  id = g.region_id)  AS region_name,
       archive_days,
       archive_filling_percentage,
       archive_begin_date,
       archive_end_date,
       archive_ring
FROM   (SELECT (SELECT TOP 1 parent_id
                FROM   [PSIM].[dbo].[obj_cam]
                WHERE  id = h.camid) AS grabber_id,
               (SELECT TOP 1 [region_id]
                FROM   [PSIM].[dbo].[obj_cam]
                WHERE  id = h.camid) AS region_id,
               camid                 AS cam_id,
               camname               AS camera_name,
               archive_days,
               archive_filling_percentage,
               archive_begin_date,
               archive_end_date,
               archive_ring
        FROM   (SELECT camid,
                       camname,
                       archcurrent AS archive_days,
                       archfilling AS archive_filling_percentage,
                       archbegin   AS archive_begin_date,
                       archend     AS archive_end_date,
                       archring    AS archive_ring
                FROM   [Monitoring].[dbo].[cam_info]) h) g
ORDER  BY cam_id ASC 
