// This script should catch the select press by operators in Incident Manager,
// Correspodning tower/R24/cameras/events should be shown.

if (Event.SourceType == "INC_MANAGER" && Event.Action == "SELECT") {

    var display_id = GetObjectParentId(Event.SourceType, Event.SourceId, "DISPLAY");
    var display_name = GetObjectName("DISPLAY", display_id)
    DebugLogString("Operator selected this event on " + display_name);

    var full_event = Base64Decode(Event.GetParam("serializeBase64"), 0);
    var json = JSON.parse(full_event);

    var source_event = json.rows[0].SourceMsgBase64;
    var SourceMsgBase64_b64_decoded = Base64Decode(source_event, 0);

    var event_uuid = getGuidOfSourceEvent(SourceMsgBase64_b64_decoded).replace(/[{}]/g, ""); // event_guid
    DebugLogString("Incident Manager SELECT script: event uuid is: " + event_uuid);

    var slave = Event.GetParam("slave_id");
    var slaveSplit = slave.split(".");

    var region_id = json.rows[0].Region.Id;

    var siteId = GetObjectIdByParam("SIGNALTOWER", "region_id", region_id);
    var siteId_numeric = siteId.replace(/[^0-9]/g, '');

    DebugLogString("Operator click selection detected on " + slaveSplit[0] + ". Site id chosen is: " + siteId_numeric);
    DoReactStr("MACRO", 1004, "RUN", "computer<" + slaveSplit[0] + ">,number<" + siteId_numeric + ">,display_name<" + display_name + ">,event_uuid<" + event_uuid + ">,is_search<" + false + ">");
};

function getGuidOfSourceEvent(step_string) {
    var message_split = step_string.split("guid_pk<");
    var guid = message_split[1].split(">,");
    return guid[0];
};