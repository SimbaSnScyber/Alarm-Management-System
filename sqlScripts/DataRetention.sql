SELECT OBJ_GRABBER. name,

OBJ_GRABBER.parent_id, OBJ_GRABBER.type, OBJ_GRABBER.model, OBJ_GRABBER.ip,

[arch_hours_max] / 24

AS 'Recordings'

FROM [PSIM].[dbo]. [OBJ_GRABBER]

FULL JOIN [PSIM].[dbo].[OBJ_CAM]

ON OBJ_GRABBER.id = OBJ_CAM.parent_id

FULL JOIN [PSIM].[dbo].OBJ_CAM_VMDA

ON OBJ_CAM.id = OBJ_CAM_VMDA.parent_id

FULL JOIN [PSIM].[dbo].OBJ_CAM_VMDA_DETECTOR

ON OBJ_CAM_VMDA.id = OBJ_CAM_VMDA_DETECTOR.parent_id

FULL JOIN [PSIM].[dbo].OBJ_CAM_FACECAPTURE

ON OBJ_CAM.id = OBJ_CAM_FACECAPTURE. parent_id

