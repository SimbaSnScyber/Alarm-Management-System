// Catching when operator choses the no dispatch 3 times

var db = "dataservice"; 				// DB with operator action table
var sqlInstance = "10.245.39.101\\SQLEXPRESS2014"; 	// SQL instance with operators action table
var operator_actions_table = "dbo.operator_action";	// name of operators actions table
var sqlUserName = "PSIM";
var sqlPassword = "\"YSPW7509-sywj!#O%&\"";
var threshold = "3"; 					// number of false alarms classifications to process the OA script further
var hoursBack = "-3"; 					// for this amount of time to look back when doing the SQL query
var timeout = 60000;

if (Event.SourceType == "INC_SERVER" && Event.Action == "EVENT") {
    var timestamp = Event.GetParam("date") + " " + Event.GetParam("time");
    var full_event = Base64Decode(Event.GetParam("serializeBase64"), 0);
    var json = JSON.parse(full_event);
    var WorksBase64 = json.rows[0].WorksBase64;
    var WorksBase64_length = WorksBase64.length;

    var event_status = json.rows[0].Status;
    var event_resolution = json.rows[0].Resolution;

    if (WorksBase64_length >= 2 && event_status == 1 && event_resolution == 0) { //only process the script when operator done at least one step in the workflow; status=1 is acknolwedged; resolution=0 is event is not resolved
        last_step = Base64Decode(WorksBase64[WorksBase64_length - 2], 0);
        var step_raw = last_step.substring(3);
        var step_name = getStepName(step_raw);
        var slave = getHostNameFromOperatorSteps(step_raw);
        var region_id = json.rows[0].Region.Id;
        var siteId = GetObjectIdByParam("SIGNALTOWER", "region_id", region_id);
        var siteId_numeric = siteId.replace(/[^0-9]/g, '');
        DebugLogString(timestamp + " Catching operator actions for logics script: computer " + slave + ": operator is doing step \"" + step_name + "\" while processing tower " + siteId + ".");

        // ***** OVERACTIVE LOGIC START *****
        if (step_name == "no_dispatch_comment") {	// catching when operator selects the no_dispatch step in IM to check if Overactive logic applies
            if (!empty(siteId)) {
                DebugLogString(timestamp + " Catching operator actions for logics script: OA first stage: captured no dispatch reaction. Computer " + slave + ", step is \"" + step_name + "\".");
                var false_triggers = getNumberOfProcessedEventsWithoutDispatch(siteId);
                if (false_triggers >= threshold) {
                    DebugLogString(timestamp + " Catching operator actions for logics script: OA first stage: detected that site " + siteId + " was processed without dispatch more or equal " + threshold + " times during last " + hoursBack + " hours.");
                    DoReactStr("MACRO", "482", "RUN", "tower<" + siteId + ">");
                }
            }
            // ***** OVERACTIVE LOGIC STOP *****

            // ***** R24 DISPATCH LOGIC START *****
        } else if (step_name == "r24_dispatch") {	// catching when operator presses the R24 dispatch button in IM workflow to initiate a R24 confirmation dispatch dialog
            DebugLogString(timestamp + " Catching operator actions for logics script: R24 dispatch: catched dispatch event in IM! Computer is: " + slave + "; site ID is: " + siteId + ". Confirmation shall be sent next");
            if (!empty(siteId_numeric)) {
                DoReactStr("MACRO", "999", "RUN", "number<" + siteId_numeric + ">,computer<" + slave + ">"); // Do the the dispatch confirmation dialog
            }
            // ***** R24 DISPATCH LOGIC STOP *****

            // ***** R24 UPDATE LOGIC START *****
        } else if (step_name == "r24_feedback") {	// catching when operator presses the R24 update button in IM workflow to initiate current R24 dispatch update
            if (!empty(siteId_numeric)) {
                var siteId_numeric = siteId.replace(/[^0-9]/g, '');
                DebugLogString(timestamp + " Catching operator actions for logics script: R24 update: catched update event in IM! Computer is: " + slave + "; site ID is: " + siteId + ".");
                DoReactStr("MACRO", "1003", "RUN", "number<" + siteId_numeric + ">,computer<" + slave + ">");
            }
            // ***** R24 UPDATE LOGIC STOP *****

            /*
                // ***** R24 CLOSE LOGIC START *****
                } else if (Itv_var("T" + siteId + "_r24_manual") != "1" && step_name == "finalize") { // catching when operator presses the R24 close button in IM workflow to initiate current R24 dispatch close
                    if (!empty(siteId_numeric)) {
                        DebugLogString(timestamp+" Catching operator actions for logics script: R24 close: catched close dispatch event in IM! Computer is: " + slave + "; site ID is: " + siteId + ".");
                        DoReactStr("MACRO", "1002", "RUN", "number<" + siteId_numeric + ">,computer<" + slave + ">");
                        // As this is the end of the workflow, we set this value to 0 to ensure other events don't register a manual dispatch. TODO: Carefully check this
                        Itv_var("T" + siteId + "_r24_manual") = "0";
                    }
                // ***** R24 CLOSE LOGIC STOP *****
            */
            // ***** R24 MANUAL DISPATCH LOGIC START *****
        } else if (step_name == "r24_choice") {
            var child_control_id_0 = getChildControlIdValue(step_raw, "0");
            var child_control_id_1 = getChildControlIdValue(step_raw, "1");
            if (child_control_id_0 == "0" && child_control_id_1 == "1") {	// catching when operator selects manual dispatch radio option
                Itv_var("T" + siteId + "_r24_manual") = "1";	// global var of manual dispatch
                DebugLogString(timestamp + " Catching operator actions for logics script: R24 manual selection: catched R24 manual selection event in IM! Computer is: " + slave + "; site ID is: " + siteId + ", global var is " + Itv_var("T" + siteId + "_r24_manual") + ".");
            }
            // ***** R24 MANUAL DISPATCH LOGIC STOP *****

            // ***** CiiMS SENDING LOGIC START && R24 CLOSE LOGIC START *****
        } else if (step_name == "finalize") {	// catching the Review done CiiMS button pressed by an operator in the IM workflow
            DebugLogString(timestamp + " Catching operator actions for logics script: R24 close: catched close dispatch event in IM! Computer is: " + slave + "; site ID is: " + siteId + ".");
            DoReactStr("MACRO", "1002", "RUN", "number<" + siteId_numeric + ">,computer<" + slave + ">");
            // As this is the end of the workflow, we set this value to 0 to ensure other events don't register a manual dispatch. TODO: Carefully check this
            Itv_var("T" + siteId + "_r24_manual") = "0";

            DebugLogString(timestamp + " Catching operator actions for logics script: Clear Grid Values script: caught the clearing grid values on workstation " + slave + "!");
            DoReactStr("MACRO", "811", "RUN", "number<" + siteId + ">,computer<" + slave + ">");

            var source_event = json.rows[0].SourceMsgBase64;
            var SourceMsgBase64_b64_decoded = Base64Decode(source_event, 0);
            var event_uuid = getGuidOfSourceEvent(SourceMsgBase64_b64_decoded).replace(/[{}]/g, ""); // event_guid
            DebugLogString(timestamp + " Catching operator actions for logics script: sending CiiMS Payload script: catched the IM closure event on workstation " + slave + "!");
            DoReactStr("MACRO", "2200", "RUN", "event_uuid<" + event_uuid + ">,computer<" + slave + ">");

            clearEventsIMPresenceFlags(siteId);

            // ***** CiiMS SENDING LOGIC STOP && R24 CLOSE LOGIC STOP *****

            // ***** CiiMS POPULATION LOGIC START *****
        } else if (step_name == "report_review" || step_name == "final_report_review") {	// catching open the CiiMS report button pressed by an operator in the IM workflow
            DoReactStr("MACRO", "2201", "RUN", "full_event<" + full_event + ">,computer<" + slave + ">");
            DebugLogString(timestamp + " Catching operator actions for logics script: population CiiMS Payload script: catched the IM population of CiiMS report event on workstation " + slave + "!");
            // ***** CiiMS POPULATION LOGIC STOP *****
        } else if (step_name == "finalize_no_dispatch") {	// catching the finalize button to confirm no dispatch
            DoReactStr("MACRO", "2202", "RUN", "full_event<" + full_event + ">,computer<" + slave + ">");
            DebugLogString(timestamp + " Catching operator actions for logics script: Park Event from IM script: caught the parking event from IM event on workstation " + slave + "!");
            // ***** PARK EVENT FROM IM LOGIC STOP *****
            DoReactStr("MACRO", "811", "RUN", "number<" + siteId + ">,computer<" + slave + ">");
            DebugLogString(timestamp + " Catching operator actions for logics script: Clear Grid Values script: caught the clearing grid values from IM event on workstation " + slave + "!");
            // ***** CLEAR GRID VALUES FROM IM LOGIC STOP *****
        } else if (step_name == "move_to_live") {	// catching the move to live button click
            DoReactStr("MACRO", "2203", "RUN", "full_event<" + full_event + ">,computer<" + slave + ">");
            DebugLogString(timestamp + " Catching operator actions for logics script: Move Event to Live From IM script: caught the moving event to live stack on workstation " + slave + "!");
            // ***** MOVE EVENT TO LIVE FROM IM LOGIC STOP *****
        } else if (step_name == "maintenance_complete") {	// catching the maintenance complete button click
            DoReactStr("MACRO", "2204", "RUN", "full_event<" + full_event + ">,computer<" + slave + ">");
            DebugLogString(timestamp + " Catching operator actions for logics script: Change Zone States to Normal: caught the changing zone states to normal script on workstation " + slave + "!");
            // ***** CHANGE ZONE STATES TO NORMAL FROM IM LOGIC STOP *****
        }
    }
};


function getGuidOfSourceEvent(step_string) {
    var message_split = step_string.split("guid_pk<");
    var guid = message_split[1].split(">,");
    return guid[0];
};

function getChildControlIdValue(step_string, id) {
    var message_split = step_string.split("child_control_id." + id + "<");
    if (!empty(message_split[1])) {
        var value = message_split[1].split(">,");
        return value[0].replace(/[<>]/g, "");
    } else {
        return "";
    }
};

function getNumberOfProcessedEventsWithoutDispatch(site) {
    DebugLogString(timestamp + " OA first stage: getNumberOfProcessedEventsWithoutDispatch(" + site + "): getting number of triggers for wich operators processed more than " + threshold + " times in the last " + hoursBack + " hours from SQL " + sqlInstance);

    var query = "\"SET NOCOUNT ON; SELECT count(h.event_guid) processings FROM (SELECT event_guid FROM " + operator_actions_table + " WHERE ack_timestamp >= DATEADD(hour, " + hoursBack + ", GETDATE())  AND siteID = '" + site + "' AND parent_control_id = 'no_dispatch_comment' GROUP by event_guid) h;";
    var cmd = "sqlcmd -U " + sqlUserName + " -P " + sqlPassword + " -S \"" + sqlInstance + "\" -s \"|\" -W -h -1 -d " + db + " -Q " + query + "\"";

    DebugLogString(timestamp + " OA first stage: getNumberOfProcessedEventsWithoutDispatch(" + site + "): SQL cmd is: " + cmd);
    var run = run_cmd_timeout(cmd, timeout);

    var runTrimmed = run.replace(/(\r\n|\n|\r)/gm, "");
    DebugLogString(timestamp + " OA first stage: getNumberOfProcessedEventsWithoutDispatch(" + site + "): SQL result is: " + runTrimmed);
    return runTrimmed;
};

clearEventsIMPresenceFlags(siteId);

function clearEventsIMPresenceFlags(site) {
    for (i = 1; i <= 10; i++) {		// setting the im_zone flags to "0"
        SetObjectParam("SIGNALTOWER", site, "im_zone" + i, "0");
        SetObjectParam("SIGNALTOWER", site, "im_zone" + i + "_bypass", "0");
        SetObjectParam("SIGNALTOWER", site, "im_zone" + i + "_tamper", "0");
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

function empty(str) {
    if (typeof str == 'undefined' || !str || str.length === 0 || str === "" || !/[^\s]/.test(str) || /^\s*$/.test(str) || str === "") { return true; }
    else { return false; }
};