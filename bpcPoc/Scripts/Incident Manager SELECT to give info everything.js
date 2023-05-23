// This script should catch the select press by operators in Incident Manager,
// Correspodning tower/R24/cameras/events should be shown.

if (Event.SourceType == "INC_MANAGER" && Event.Action == "SELECT") {

    //var display_id = GetObjectParentId(Event.SourceType,Event.SourceId,"DISPLAY");
    //var display_name = GetObjectName("DISPLAY",display_id)
    //DebugLogString("Operator selected this event on "+display_name);

    var full_event = Base64Decode(Event.GetParam("serializeBase64"), 0);
    var json = JSON.parse(full_event);

    var slave = Event.GetParam("slave_id");
    var slaveSplit = slave.split(".");

    var region_id = json.rows[0].Region.Id;

    var siteId = GetObjectIdByParam("SIGNALTOWER", "region_id", region_id);
    var siteId_numeric = siteId.replace(/[^0-9]/g, '');

    //DebugLogString(full_event);

    var SourceBaseMsg64 = Base64Decode(json.rows[0].SourceMsgBase64, 0);
    DebugLogString(SourceBaseMsg64);

    var SourceMsgSplit = SourceBaseMsg64.split("|");
    var src_objtype = SourceMsgSplit[0];
    var src_objid = SourceMsgSplit[1];
    var src_action = SourceMsgSplit[2];

    var zone = "";

    if (src_action == "AXXON_MOTION_IN_AREA3") {
        zone = "3";
    } else if (src_action == "AXXON_MOTION_IN_AREA2") {
        zone = "2";
    }

    DebugLogString(zone);

    source_event_split1 = SourceBaseMsg64.split(",received_time<");

    if (!empty(source_event_split1[1])) {

        source_event_split2 = source_event_split1[1].split(">");
        var received_time = source_event_split2[0];
    } else {
        var received_time = "";
    }

    DebugLogString("Operator click selection detected on " + slaveSplit[0] + ". Site id chosen is: " + siteId);
    DoReactStr("MACRO", 1004, "RUN", "slave_id<" + slaveSplit[0] + ">,number<" + siteId_numeric + ">,received_time<" + received_time + ">,zone<" + zone + ">");

};

function empty(str) {
    if (typeof str == 'undefined' || !str || str.length === 0 || str === "" || !/[^\s]/.test(str) || /^\s*$/.test(str) || str.replace(/\s/g, "") === "") { return true; }
    else { return false; }
};