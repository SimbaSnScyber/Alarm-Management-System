var time_difference_to_trigger_events = 230;

if (Event.SourceType == "CAM_VMDA_DETECTOR" && Event.Action == "ALARM") {

    var timestamp = Event.GetParam("date") + " " + Event.GetParam("time");	// timestamp of the event
    var camera = Event.GetParam("cam");
    var nameSplit = GetObjectName("CAM", camera).split(" ");
    var zone = nameSplit[1].toLowerCase();					// getting the trigger zone from the camera name
    var cameraRegion = GetObjectParam("CAM", camera, "region_id");
    var towerId = GetObjectIdByParam("SIGNALTOWER", "region_id", cameraRegion);	// getting the tower Id
    var previous_timestamp = GetObjectParam("SIGNALTOWER", towerId, zone + "lastmessage");	// timestamp of the previous trigger
    var zone_state = GetObjectParam("SIGNALTOWER", towerId, zone + "state");		// zone	state

    // Receive Detector Name like: T000132 CC2 FD Motion, split by a space into an array, then join with an underscore
    // This removes the spaces so we turn "T000132 CC2 FD Motion" into "T000132_CC2_FD_Motion"
    var detectorName = GetObjectName("CAM_VMDA_DETECTOR", Event.SourceId).split(" ").join("_");

    DebugLogString(timestamp + " VMDA processing script: Detector name for ID of " + Event.SourceId + " is " + detectorName);
    DebugLogString(timestamp + " VMDA processing script: Is the variable empty? " + empty(Itv_var(detectorName + "_countVMDA")));
    // Going through the trouble of using the Date object to reformat the date as YYYY-MM-DD instead of DD-MM-YY
    var betterDate = new Date();
    var day = betterDate.getDate();
    var month = (betterDate.getMonth() + 1);
    var year = betterDate.getFullYear();
    var fullDateTime = year + "-" + month + "-" + day + " " + Event.GetParam("time");
    // Initialize the global variable if it doesn't exist
    if (empty(Itv_var(detectorName + "_countVMDA"))) {
        DebugLogString(timestamp + " VMDA processing script: Initializing the variable");
        Itv_var(detectorName + "_countVMDA") = 0;
    }
    // Make it an integer
    var counter = parseInt(Itv_var(detectorName + "_countVMDA"));
    DebugLogString(timestamp + " VMDA processing script: Detector count with ID of " + Event.SourceId + " and name " + detectorName + " is " + counter);
    Itv_var(detectorName + "_countVMDA") = ++counter; // Add to the counter
    Itv_var(detectorName + "_timeVMDA") = fullDateTime; // Timestamp the counter increment
    DebugLogString(timestamp + " VMDA processing script: Detector count with ID of " + Event.SourceId + " and name " + detectorName + " is now " + Itv_var(detectorName + "_countVMDA"));

    if (zone_state == "3" || zone_state == "4") {
        DebugLogString(timestamp + " VMDA processing script:  " + zone + " of the " + towerId + " with state \"" + zone_state + "\" - zone is OVERACTIVE!..");
        var isOveractive = true;
    } else {
        var isOveractive = false;
    }

    if (!empty(previous_timestamp)) {
        var recentTrigger = getTimeDifference(previous_timestamp);
    }

    // if no previous timestamp or the last trigger was more than 2 minutes ago AND no overactive
    if ((empty(previous_timestamp) || recentTrigger) && !isOveractive) {

        DebugLogString(timestamp + " VMDA processing script: no recent trigger for the " + zone + " of the " + towerId + " with state \"" + zone_state + "\", thus CREATING a new event SIGNALTOWER|" + towerId + "|" + zone.toUpperCase() + "...");

        if (!empty(camera) && !empty(cameraRegion) && !empty(towerId) && !empty(zone)) {

            var towerState = GetObjectState("SIGNALTOWER", towerId);
            changeZoneTimestamp(towerId, zone);
            DebugLogString(timestamp + " VMDA processing script: tower is " + towerId + ", its state is " + towerState + ", VMDA zone is " + zone);

            if (empty(towerState) || towerState == "NORMAL") {
                NotifyEventStr("SIGNALTOWER", towerId, zone.toUpperCase(), "region_id<" + cameraRegion + ">");
            } else if (towerState == "PARKED") {
                NotifyEventStr("SIGNALTOWER", towerId, "P_" + zone.toUpperCase(), "region_id<" + cameraRegion + ">");
            } else if (towerState == "BPC_PARKED") {
                NotifyEventStr("SIGNALTOWER", towerId, "B_" + zone.toUpperCase(), "region_id<" + cameraRegion + ">");
            }
        }
    } else {
        DebugLogString(timestamp + " VMDA processing script:  " + zone + " of the " + towerId + " with state \"" + zone_state + "\", thus NOT PRODUCING a new event...");
    }
};

function empty(str) {
    if (typeof str == 'undefined' || !str || str.length === 0 || str === "" || !/[^\s]/.test(str) || /^\s*$/.test(str) || str === "") { return true; }
    else { return false; }
};

function changeZoneTimestamp(tower, zoneId) {
    DebugLogString(timestamp + " VMDA processing script::changeZoneTimestamp(): changing tower ID \"" + tower + "\" zone \"" + zoneId + "\" time to " + timestamp);
    SetObjectParam("SIGNALTOWER", tower, zoneId + "lastmessage", timestamp);	// Setting the zone state timestamp here
};

// Use the match function to split the date value into an array with just the number values of the date
// Then use the number values to create a new Date object
function parseDate(input) {
    DebugLogString(timestamp + " VMDA processing script: parseDate: " + input)
    // input values: 14-07-22 15:09:24
    var parts = input.match(/(\d+)/g);
    // parts values: day, month, year, hours, minutes, seconds
    DebugLogString(timestamp + " VMDA processing script: parseDate: parts is " + parts)
    // new Date(year, month, date[, hours[, minutes[, seconds[,ms]]]])
    // parts[2] format is YY so we just make it YYYY
    var date = new Date("20" + parts[2], parts[1] - 1, parts[0], parts[3], parts[4], parts[5]);
    DebugLogString(timestamp + " VMDA processing script: parseDate: new Date to return is " + date)
    return date;
};

function getTimeDifference(old_value) {
    var diff = parseDate(timestamp) - parseDate(old_value);
    DebugLogString(timestamp + " VMDA processing script::getTimeDifference(): old value " + old_value + "; existing value is " + timestamp);
    DebugLogString(timestamp + " VMDA processing script::getTimeDifference(): difference is " + diff / 1000);

    if (diff / 1000 >= 130) {		// if last trigger was more than 2 minutes ago
        return true;
    } else {
        return false;
    }
};