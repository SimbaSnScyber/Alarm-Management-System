-- Made by Sibusiso Simba Sithole
-- Get a site ID and the IPS of the cameras associated with that site
SELECT
   value as siteId,
   (
      SELECT
         TOP 1 parent_id 
      FROM
         obj_grabber 
      where
         name LIKE g.value + '%'
   )
   as server,
   (
      SELECT
         TOP 1 ip 
      FROM
         obj_grabber 
      where
         name like g.value + ' CC1%'
   )
   as covert_cam,
   (
      SELECT
         TOP 1 ip 
      FROM
         obj_grabber 
      where
         name like g.value + ' CC2'
   )
   as container_cam,
   (
      SELECT
         TOP 1 ip 
      FROM
         obj_grabber 
      where
         name like g.value + ' TC1%'
   )
   as tower_cam1,
   (
      SELECT
         TOP 1 ip 
      FROM
         obj_grabber 
      where
         name like g.value + ' TC2%'
   )
   as tower_cam2,
   (
      SELECT
         TOP 1 ip 
      FROM
         obj_grabber 
      where
         name like g.value + ' TC3%'
   )
   as tower_cam3 
FROM
   (
      SELECT
         [value] 
      FROM
         [dbo].[OBJ_grabber] cross apply string_split(name, ' ') H 
      WHERE
         H.value like '%T0%' 
         OR H.value like '%X1%' 
         OR H.value like '%T1%' 
         OR H.value like '%TD%' 
      GROUP by
         [value]
   )
   G

