-- Get BPC Users
SELECT id
FROM [PSIM].[dbo].[OBJ_PERSON] 
WHERE parent_id = '11' AND name NOT LIKE '%Operator%' AND name != 'Surname' AND name != 'VWALL1' 
ORDER BY id

SELECT *
FROM [PSIM].[dbo].[OBJ_PERSON] 
ORDER BY guid

SELECT distinct guid 
FROM [PSIM].[dbo].[OBJ_PERSON] 
ORDER BY guid

SELECT guid
FROM [PSIM].[dbo].[OBJ_PERSON]
GROUP BY guid
HAVING COUNT(id) > 1 ORDER BY guid
