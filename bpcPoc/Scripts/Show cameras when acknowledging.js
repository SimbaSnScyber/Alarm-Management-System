mon = "1";

if (Event.SourceType == "INC_SERVER" && Event.Action == "EVENT") {
    var timestamp = Event.GetParam("date") + " " + Event.GetParam("time");
    var full_event = Base64Decode(Event.GetParam("serializeBase64"), 0);
    var json = JSON.parse(full_event);
    var WorksBase64 = json.rows[0].WorksBase64;
    var WorksBase64_length = WorksBase64.length;

    var event_status = json.rows[0].Status;
    var event_resolution = json.rows[0].Resolution;

    DebugLogString(timestamp + " Event status is: " + event_status + "; Event resolution is: " + event_resolution + "; WorksBase length is: " + WorksBase64_length);

    var source_event = json.rows[0].SourceMsgBase64;
    var SourceMsgBase64_b64_decoded = Base64Decode(source_event, 0);
    var source_timestamp = getSourceAlertTimestamp(SourceMsgBase64_b64_decoded);

    var SourceMsgSplit = SourceMsgBase64_b64_decoded.split("|");
    var src_objtype = SourceMsgSplit[0];
    var src_objid = SourceMsgSplit[1];
    var src_action = SourceMsgSplit[2];
    DebugLogString("SourceMsgBase64_b64_decoded is " + SourceMsgBase64_b64_decoded);

    if ((event_status == 1) && (WorksBase64_length == 1)) {
        DebugLogString(timestamp + " Catched an acknowledged event! Source timestamp is: " + source_timestamp);

        if (src_objtype == "CAM_VMDA_DETECTOR2") {
            var cam_id = GetObjectParentId("CAM_VMDA_DETECTOR2", src_objid, "CAM");
            changeCamerasInMonitor(mon, cam_id, source_timestamp);
        }

        if (src_objtype == "SIGNALTOWER" && src_objid == "3") {
            changeCamerasInMonitor(mon, "1", source_timestamp);
            changeCamerasInMonitor(mon, "2", source_timestamp);
            changeCamerasInMonitor(mon, "3", source_timestamp);
            changeCamerasInMonitor(mon, "4", source_timestamp);
        }
    }

    if (WorksBase64_length >= 2 && event_status == 3 && event_resolution == 2) {

        DebugLogString("Catched IM closing event!");

        if (src_objtype == "CAM_VMDA_DETECTOR2") {
            DoReactStr("CAM_VMDA_DETECTOR2", src_objid, "ENABLE", "");
        }

        if (src_objtype == "SIGNALTOWER") {
            DoReactStr("CAM_IP_DETECTOR", "", "ENABLE", "");
        }
    }
};

function changeCamerasInMonitor(monitor, camera, timestamp) {
    var timestamp_split = timestamp.split(" ");

    //DoReactStr("MONITOR",monitor,"REMOVE_ALL","");
    //DoReactStr("MONITOR",monitor,"ADD_SHOW","cam<"+camera+">,delay<1>");
    DoReactStr("MONITOR", monitor, "ARCH_FRAME_TIME", "cam<" + camera + ">,delay<2>,time<" + timestamp_split[1] + ">,date<" + timestamp_split[0] + ">");
};

function getSourceAlertTimestamp(step_string) {
    var message_split1 = step_string.split("date<");
    var dateSplit = message_split1[1].split(">,");
    var date = dateSplit[0];
    var split = date.split("-");
    var newDate = split[0] + "-" + split[1] + "-" + split[2];
    var newDate2 = newDate.replace(/[<>]/g, "");
    var message_split2 = step_string.split(",time<");
    var timeSplit = message_split2[1].split(">,");
    var time = timeSplit[0];
    return newDate2 + " " + time
};