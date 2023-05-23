// This script inserts data into custom operator actions table. This information can be used for CiiMS/reports, etc
// the data insertion is done vis sqlcmd command line, but there is also built-in JSCript methods to work with SQL

var db = "dataservice";	// DB where to insert the data
var sqlTablename = "operator_action"; // name of the table
var sqlInstance = "VPSIM"; // SQL instance where to insert the data 
var sqlUserName = "PSIM"; // SQL login
var sqlPassword = "Intellect_default_db_4";	// SQL password

// The script should catch operator steps in the workflow of any IM interface:

if (Event.SourceType == "INC_SERVER" && Event.Action == "EVENT") {
    var full_event = Base64Decode(Event.GetParam("serializeBase64"), 0); // catching the event's parameter with base64 decoded full event and decoding it from Base64
    var json = JSON.parse(full_event);	// parsing JSON from the previous variable
    var WorksBase64 = json.rows[0].WorksBase64;	// WorksBase64 array of JSON contains all operator actions done
    var WorksBase64_length = WorksBase64.length;

    // Process the script ONLY when operator done at least one step in the workflow, ignore rest of the events. This can be achieved by checking the length of WorksBase64 array
    if (WorksBase64_length >= 2) {

        var user_id = json.rows[0].Assignee.Id; // grabbing user_id
        var im_id = json.rows[0].IncServerProcessor.id;	// grabbing im_id

        var region_id = json.rows[0].Region.Id;
        var siteId = GetObjectIdByParam("SIGNALTOWER", "region_id", region_id);	// siteID

        var source_event = json.rows[0].SourceMsgBase64;
        var SourceMsgBase64_b64_decoded = Base64Decode(source_event, 0);
        var SourceMsgSplit = SourceMsgBase64_b64_decoded.split("|");
        var src_objtype = SourceMsgSplit[0]; // src_objtype
        var src_objid = SourceMsgSplit[1]; // src_objid
        var src_action = SourceMsgSplit[2]; // src_action

        var source_event_guid = getGuidOfSourceEvent(SourceMsgBase64_b64_decoded).replace(/[{}]/g, ""); // event_guid

        var source_timestamp = getSourceAlertTimestamp(SourceMsgBase64_b64_decoded); // alert_timestamp

        last_step = Base64Decode(WorksBase64[WorksBase64_length - 2], 0);
        var step_raw = last_step.substring(3);
        var step_name = getStepName(step_raw); // parent_control_id
        var slave = getHostNameFromOperatorSteps(step_raw); // slave_id
        var control_type = getControlTypeFromStep(step_raw); // im_type
        var step_timestamp = getTimestampFromStep(step_raw); // ack_timestamp

        switch (control_type) {
            case "comment":
                var edit_text = getCommentTextFromOperatorStep(step_raw); // edit_text
                var child_control_id_0 = "";
                var child_control_id_1 = "";
                var child_control_id_2 = "";
                var child_control_id_3 = "";
                break;
            case "button":
                var edit_text = "";
                var child_control_id_0 = "";
                var child_control_id_1 = "";
                var child_control_id_2 = "";
                var child_control_id_3 = "";
                break;
            case "combobox_set":
                var edit_text = "";
                var child_control_id_0 = getChildControlIdValue(step_raw, "0");
                var child_control_id_1 = getChildControlIdValue(step_raw, "1");
                var child_control_id_2 = getChildControlIdValue(step_raw, "2");
                var child_control_id_3 = getChildControlIdValue(step_raw, "3");
                break;
            case "radio_set":
                var edit_text = "";
                var child_control_id_0 = getChildControlIdValue(step_raw, "0");
                var child_control_id_1 = getChildControlIdValue(step_raw, "1");
                var child_control_id_2 = getChildControlIdValue(step_raw, "2");
                var child_control_id_3 = getChildControlIdValue(step_raw, "3");
                break;
            default:
                var edit_text = "";
                var child_control_id_0 = "";
                var child_control_id_1 = "";
                var child_control_id_2 = "";
                var child_control_id_3 = "";
        }

        DebugLogString("Catching operator steps: computer " + slave + "; event: " + src_objtype + "|" + src_objid + "|" + src_action + "; operator is doing step " + step_name + ", control type: " + control_type + ", timestamp is " + step_timestamp + ", event guid is " + source_event_guid);

        //DebugLogString("Catching operator steps: full event is: "+full_event);
        SetObjectParam("SIGNALTOWER", siteId, "last_operator_action", Event.GetParam("date") + " " + Event.GetParam("time")); // Setting the timestamp of last operator action to the SignalTower integration
        doSQLInsert(user_id, control_type, im_id, slave, source_event_guid, source_timestamp, src_objtype, src_objid, src_action, step_name, edit_text, child_control_id_0, child_control_id_0, child_control_id_1, child_control_id_2, child_control_id_3, "", step_timestamp, siteId); // SQL INSERT INTO
    }
};

function getHostNameFromOperatorSteps(step_string) {
    var message_split = step_string.split("slave_id<");
    var slave = message_split[1].split(">,");
    return slave[0];
};

function getStepName(step_string) {
    var message_split = step_string.split("control_id<");
    var step_name = message_split[1].split(">,");
    return step_name[0];
};

function getControlTypeFromStep(step_string) {
    var message_split = step_string.split("control_type<");
    var control_type = message_split[1].split(">,");
    return control_type[0];
};

function getTimestampFromStep(step_string) {
    var message_split = step_string.split("timestamp<");
    var step_timestamp = message_split[1].split(">,");
    return step_timestamp[0].replace(/[<>]/g, "");
};

function getGuidOfSourceEvent(step_string) {
    var message_split = step_string.split("guid_pk<");
    var guid = message_split[1].split(">,");
    return guid[0];
};

function getSourceAlertTimestamp(step_string) {
    var message_split1 = step_string.split("date<");
    var dateSplit = message_split1[1].split(">,");
    var date = dateSplit[0];
    var split = date.split("-");
    var newDate = "20" + split[2] + "-" + split[1] + "-" + split[0];
    var newDate2 = newDate.replace(/[<>]/g, "");
    var message_split2 = step_string.split(",time<");
    var timeSplit = message_split2[1].split(">,");
    var time = timeSplit[0];
    return newDate2 + " " + time
};

function getCommentTextFromOperatorStep(step_string) {
    var message_split = step_string.split("edit_text<");
    var text = message_split[1].split(">,");
    return text[0].replace(/[<>]/g, "");
};

function getChildControlIdValue(step_string, id) {
    var message_split = step_string.split("child_control_id." + id + "<");
    //DebugLogString("getChildControlIdValue: message_split[0] is "+message_split[0]+"; message_split[1] is "+message_split[1] );
    if (!empty(message_split[1])) {
        var value = message_split[1].split(">,");
        return value[0].replace(/[<>]/g, "");
    } else {
        return "";
    }
};

function empty(str) {
    if (typeof str == 'undefined' || !str || str.length === 0 || str === "" || !/[^\s]/.test(str) || /^\s*$/.test(str) || str.replace(/\s/g, "") === "") { return true; }
    else { return false; }
};

function doSQLInsert(userid, imtype, imid, slaveid, eventguid, alerttimestamp, srcobjtype, srcobjid, srceventtype, parentcontrol, edittext, childcontrolid, child0, child1, child2, child3, image, acktimestamp, site) {
    //DebugLogString("Catching operator steps: doSQLInsert: pushing steps data to the SQL "+sqlInstance);
    var query = "\"INSERT INTO operator_action (userid, im_type, im_id, slave_id, event_guid, alert_timestamp, src_objtype, src_objiid, src_event_type, parent_control_id, edit_text, child_control_id, child_control_id_0, child_control_id_1, child_control_id_2, child_control_id_3, image_src, ack_timestamp, siteID) ";
    var query2 = "VALUES ('" + userid + "', '" + imtype + "', '" + imid + "', '" + slaveid + "', '" + eventguid + "', '" + alerttimestamp + "', '" + srcobjtype + "', '" + srcobjid + "', '" + srceventtype + "', '" + parentcontrol + "', '" + edittext + "', '" + childcontrolid + "', '" + child0 + "','" + child1 + "','" + child2 + "','" + child3 + "','" + image + "','" + acktimestamp + "', '" + site + "')\"";
    var cmd = "sqlcmd -U " + sqlUserName + " -P " + sqlPassword + " -S \"" + sqlInstance + "\" -d " + db + " -Q " + query + "" + query2 + "";
    DebugLogString("Catching operator steps: doSQLInsert: cmd is: " + cmd);
    var run = run_cmd_timeout(cmd, 7000);
    DebugLogString("Catching operator steps: doSQLInsert: cmd result is: " + run.replace(/(\r\n|\n|\r)/gm, ""));
};