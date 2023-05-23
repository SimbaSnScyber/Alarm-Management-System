var recording_period = "5"; // seconds

if (Event.SourceType == "CAM_VMDA_DETECTOR2" && Event.Action == "ALARM") {
    var cam_id = Event.GetParam("cam");

    DoReactStr("CAM", cam_id, "REC", "");
    DoReactStr("CAM", cam_id, "REC_STOP", "delay<" + recording_period + ">");
    DebugLogString("Camera " + cam_id + " started recording...");
};

