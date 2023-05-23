var sqlUserName = "PSIM"
var sqlPassword = "Intellect_default_db_4"
var sqlInstance = "10.4.110.62\\VPSIM"
var db = "dataservice"

if (Event.SourceType == "CAM_IP_DETECTOR" && Event.Action == "DETECTED_BEGIN") {

    var cam_id = GetObjectParentId("CAM_IP_DETECTOR", Event.SourceId, "CAM");
    var object_state = GetObjectParam("CAM_IP_DETECTOR", Event.SourceId, "flags");
    DebugLogString("Detected trigger of embedded analytics " + Event.SourceId + " on camera " + cam_id);

    if (!empty(cam_id)) {

        var cam_region = GetObjectParam("CAM", cam_id, "region_id");

        if (!empty(cam_region)) {

            var siteId = GetObjectIdByParam("SIGNALTOWER", "region_id", cam_region);
            var param_split = Event.GetParam("param0").split(";");

            if (!empty(param_split[0])) {
                var event_type = param_split[0].split("/");

                if (!empty(event_type[1]) && !empty(event_type[2])) {

                    switch (event_type[1]) {
                        case "FieldDetector":
                            var st_event = "EMBEDDED_INSIDE" + cam_id;
                            break;
                        case "LineDetector":
                            var st_event = "EMBEDDED_CROSSING" + cam_id;
                            break;
                        default:
                            var st_event = "UNKNOWN";
                    }
                    DebugLogString("Final event is " + st_event);
                    if ((object_state == "0") || empty(object_state)) {

                        DebugLogString("Detected embedded analytics event \"" + event_type[1] + "-" + event_type[2] + "\" for tower " + siteId + " - " + GetObjectName("SIGNALTOWER", siteId));
                        //DoReactStr("CAM_IP_DETECTOR",Event.SourceId,"DISABLE","");
                        var i = "cam:" + GetObjectParentId("CAM_IP_DETECTOR", Event.SourceId, "CAM")
                        NotifyEventStr("SIGNALTOWER", siteId, st_event, "embedded_id<" + Event.SourceId + ">,param1<embedded_id:" + Event.SourceId + ">,param0<cam:" + GetObjectParentId("CAM_IP_DETECTOR", Event.SourceId, "CAM") + ">");
                        DebugLogString(timestamp + " Embedded Analytics Processing script: Adding the site ID: " + siteId + "; action: " + st_event + "; Region ID " + cam_region + "; zone " + i + " to custom table ")
                        doSQLInsert(siteId, st_event, cam_region, i)
                    }
                }
            }
        }
    }
};

function empty(str) {
    if (typeof str == 'undefined' || !str || str.length === 0 || str === "" || !/[^\s]/.test(str) || /^\s*$/.test(str) || str === "") { return true; }
    else { return false; }
};

function doSQLInsert(objid, action, region_id, zone) {
    //DebugLogString("SignalTower events processing: doSQLInsert: pushing steps data to the SQL "+sqlInstance);
    var query = "\"INSERT INTO signaltower_processing (objid, action, region_id, zone, date) ";
    var query2 = "VALUES ('" + objid + "', '" + action + "', '" + region_id + "', '" + zone + "', GETDATE())\"";
    var cmd = "sqlcmd -U " + sqlUserName + " -P " + sqlPassword + " -S \"" + sqlInstance + "\" -d " + db + " -Q " + query + "" + query2 + "";
    DebugLogString("SignalTower events processing: doSQLInsert: cmd is: " + cmd);
    var run = run_cmd_timeout(cmd, 2000);
    DebugLogString("SignalTower events processing: doSQLInsert: cmd result is: " + run.replace(/(\r\n|\n|\r)/gm, ""));
};