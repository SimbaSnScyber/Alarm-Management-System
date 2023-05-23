if (Event.SourceType == "CAM_VMDA_DETECTOR2" && Event.Action == "ALARM") {
    var neuro_vmda_name = GetObjectName("CAM_VMDA_DETECTOR2", Event.SourceId);
    var neuro_vmda_state = GetObjectParam("CAM_VMDA_DETECTOR2", Event.SourceId, "flags");

    DebugLogString("Detected neuro tracker \"" + neuro_vmda_name + "\" detection without presence in IM! State is: \"" + neuro_vmda_state + "\".");

    if ((neuro_vmda_state == "0") || empty(neuro_vmda_state)) {
        DebugLogString("Pushing event for IM for detector \"" + neuro_vmda_name + "\" and disabling the VMDA detector");
        NotifyEventStr("CAM_VMDA_DETECTOR2", Event.SourceId, "ALARM_IM", "");
        DoReactStr("CAM_VMDA_DETECTOR2", Event.SourceId, "DISABLE", "");
    }
};

function empty(str) {
    if (typeof str == 'undefined' || !str || str.length === 0 || str === "" || !/[^\s]/.test(str) || /^\s*$/.test(str) || str === "") { return true; }
    else { return false; }
};