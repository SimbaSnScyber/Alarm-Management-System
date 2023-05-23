if (Event.SourceType == "INC_SERVER" && Event.Action == "EVENT") {
    var full_event = Base64Decode(Event.GetParam("serializeBase64"), 0);
    var json = JSON.parse(full_event);
    var WorksBase64 = json.rows[0].WorksBase64;
    var WorksBase64_length = WorksBase64.length;

    var event_status = json.rows[0].Status;
    var event_resolution = json.rows[0].Resolution;
    // eventType
    if (WorksBase64_length >= 2 && event_status == 1 && event_resolution == 0) { //only process the script when operator done at least one step in the workflow; status=1 is acknolwedged; resolution=0 is event is not resolved
        last_step = Base64Decode(WorksBase64[WorksBase64_length - 2], 0);
        var step_raw = last_step.substring(3);
        var step_name = getStepName(step_raw);
        var slave = getHostNameFromOperatorSteps(step_raw);
        DebugLogString("R24 dispatch: computer " + slave + ": operator is doing step " + step_name);

        if (step_name == "r24_choice") {	// catching the R24 button press by step name
            var region_id = json.rows[0].Region.Id;

            var siteId = GetObjectIdByParam("SIGNALTOWER", "region_id", region_id);
            DebugLogString("Manual Flag Dispatch: caught R24 choice event in IM! Computer is: " + slave + "; site ID is: " + siteId);
            Itv_var("T" + siteId + "_r24_manual") = "1";
            DebugLogString("Manual R24 dispatch is set by operator " + Event.GetParam("user_id") + " for tower " + siteId + ". Global var is " + Itv_var("T" + siteId + "_r24_manual"));
        }
    }
}