-- Make sure you turn of the Web-server before running these queries

-- Count events
select count(pk) from [PSIM].dbo.PROTOCOL_INC_SERVER 
WHERE status = '0' or status = '1'
-- Delete events
DELETE FROM [PSIM].[dbo].[PROTOCOL_INC_SERVER]
WHERE status = '0' or status = '1'

DELETE top(1000) FROM [PSIM].[dbo].[PROTOCOL_INC_SERVER]
WHERE status = '0'

-- Get Parked Towers
SELECT * FROM [PSIM].[dbo].[STATES] 
WHERE objtype = 'SIGNALTOWER' AND (state = 'PARKED' OR state = 'BPC_PARKED')
-- Change state of towers from Parked to Normal
UPDATE [PSIM].[dbo].[STATES]
SET state = 'NORMAL'
WHERE objtype = 'SIGNALTOWER' AND (state = 'PARKED' OR state = 'BPC_PARKED')

-- Get Towers with iCrypto refs
SELECT * from [PSIM].[dbo].[OBJ_SIGNALTOWER] WHERE icrypto != ''
-- Clear iCrypto refs from Towers
UPDATE [PSIM].[dbo].[OBJ_SIGNALTOWER] SET icrypto = '' WHERE icrypto != ''

