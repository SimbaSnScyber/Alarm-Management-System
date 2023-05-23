BACKUP DATABASE [PSIM] 
TO  DISK = N'F:\backups\shrinkLog_1-27-22\shrinkLog.bak' WITH NOFORMAT, NOINIT,  
NAME = N'intellect-Full Database Backup', SKIP, NOREWIND, NOUNLOAD,  STATS = 10
GO

BACKUP LOG [PSIM] 
TO DISK = N'F:\backups\shrinkLog_1-27-22\shrinkLog.TRN' WITH NOFORMAT, NOINIT,  
NAME = N'shrinkLog-TRN Database Backup', SKIP, NOREWIND, NOUNLOAD, STATS = 10
GO