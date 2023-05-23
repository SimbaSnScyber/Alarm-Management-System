  SELECT userid as UserID, parent_control_id as 'Workflow Element', edit_text as 'Comment', slave_id as 'Computer', alert_timestamp as 'Alert Timestamp', dateadd(HOUR, 2, ack_timestamp) as 'Element Click Timestamp', src_objiid as 'Tower ID', (
SELECT TOP 1 description FROM [PSIM].[dbo].[EVENT] WHERE EVENT.action = [dataservice].[dbo].[operator_action].src_event_type
  ) as 'Event Type'
  FROM [dataservice].[dbo].[operator_action] where src_event_type = 'MULTI_ZONE' -- Change this value
  and ack_timestamp >= '2022-09-12 00:00:00' order by alert_timestamp

  select distinct src_event_type FROM [dataservice].[dbo].[operator_action] where ack_timestamp >= '2022-09-12 00:00:00' -- Get event types from here

