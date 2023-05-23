
SELECT * FROM [PSIM].[dbo].[PROTOCOL_INC_SERVER]
-- Count all entries in the table that are acknowledged or waiting for handling
SELECT count(pk) FROM [PSIM].dbo.PROTOCOL_INC_SERVER 
WHERE status = '0' OR status = '1'

-- Delete all entries in the table that are acknowledged or waiting for handling
DELETE FROM [PSIM].[dbo].[PROTOCOL_INC_SERVER]
WHERE status = '0' OR status = '1'

-- Delete 1000 entries in the table that are waiting for handling
DELETE TOP(1000) FROM [PSIM].[dbo].[PROTOCOL_INC_SERVER]
WHERE status = '0'