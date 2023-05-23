// Catching when operator presses the R24 dispatch button in the IM interface here

if (Event.SourceType == "INC_SERVER" && Event.Action == "EVENT") {
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
        DebugLogString("R24 close: computer " + slave + ": operator is doing step " + step_name);

        // If the manual dispatch is not selected and the button clicked is "Finalize Event"
        if (Itv_var(siteId + "_r24_manual") != "1" && step_name == "finalize") {
            var region_id = json.rows[0].Region.Id;

            var siteId = GetObjectIdByParam("SIGNALTOWER", "region_id", region_id);
            var siteId_numeric = siteId.replace(/[^0-9]/g, '');
            DebugLogString("R24 close: catched close dispatch event in IM! Computer is: " + slave + "; site ID is: " + siteId + ".");
            DoReactStr("MACRO", "1201", "RUN", "number<" + siteId_numeric + ">,computer<" + slave + ">");

            // As this is the end of the workflow, we set this value to 0 to ensure other events don't register a manual dispatch
            Itv_var(siteId + "_r24_manual") = "0";
        }
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