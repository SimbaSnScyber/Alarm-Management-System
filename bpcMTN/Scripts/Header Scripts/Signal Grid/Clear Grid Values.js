// This script clears the values used in the Signal Grid when the operator finalizes the event
var dbName = "PSIM";
var sqlUserMTN = "SQL_Auth_Account_For_PSIM";
var sqlPassMTN = "@F%L)Dfhq123asduiop#$577pMg_";
var instanceNameMTN = "NLPAG71,1550";

if (Event.SourceType == "MACRO" && Event.SourceId == 811 && Event.Action == "RUN") {
    var slaveId = Event.GetParam("computer");
    DebugLogString("Clear Grid Counters: running script to clear grid values from computer: " + slaveId);
    var siteId = Event.GetParam("number"); // From HTML we get T655 but from IM we get 655
    var towerNumber = siteId.replace(/[^0-9]/g, ''); // Remove non-numbers from siteId
    var towerWithPrefix = ""
    if (siteId.indexOf("D") !== -1) { // If a site is like D123
        towerWithPrefix = "D" + towerNumber;
    } else if (siteId.indexOf("TX") !== -1) { // If a site is like TX123
        towerWithPrefix = "TX" + towerNumber;
    } else if (siteId.indexOf("T") !== -1) { // If a site is like T123
        towerWithPrefix = "T" + towerNumber;
    } else if (siteId.indexOf("X") !== -1) { // If a site is like X123
        towerWithPrefix = "X" + towerNumber;
    } else {
        towerWithPrefix = "T" + towerNumber; // Else just add T to the site
    }
    var detectorIds = [];
    var runCams;
    // This information is also available in the Database in the OBJ_SIGNALTOWER table
    var runRegion = GetObjectParam("SIGNALTOWER", towerWithPrefix, "region_id"); // Get the region of the tower

    DebugLogString("Clear Grid Counters: result for region is: " + runRegion);
    if (!empty(runRegion)) {
        var cmdCams = "sqlcmd -U \"" + sqlUserMTN + "\" -P \"" + sqlPassMTN + "\" -S \"" + instanceNameMTN + "\" -d " + dbName + " -W -h -1 -Q \"SET NOCOUNT ON; SELECT STRING_AGG([id], ',') FROM [PSIM].[dbo].[OBJ_CAM] where [region_id] = '" + runRegion.replace(/(\r\n|\n|\r)/gm, "") + "';\"";
        runCams = run_cmd_timeout(cmdCams, 10000); // Get the camera IDs for the site as "ww,xx,yy,zz"

        DebugLogString("Clear Grid Counters: cameras are: " + runCams);
        if (!empty(runCams)) {
            var s = runCams.split(","); // Split the string into an array
            for (k = 0; k < s.length; k++) {
                // Use the camera ID to get the IDs of the camera's motion detectors
                detectorIds.push(GetObjectChildIds("CAM", parseInt(s[k]), "CAM_VMDA_DETECTOR"));
            }
            DebugLogString("Clear Grid Counters: detector IDs are " + detectorIds + ", total detectors number found " + detectorIds.length + " for site " + towerNumber);
        }
    } else {
        messageAction("Tower T" + towerNumber + " has not been assigned to a region!", slaveId);
    }

    // Determine whether this site has cameras or not
    if (runCams.replace(/(\r\n|\n|\r)/gm, "") == "NULL") {
        var towerVvs = "No";
    } else {
        var towerVvs = "Yes";
    }

    if (towerVvs == "Yes") {
        DebugLogString("Clear Grid Counters: detectorIds array " + detectorIds);
        var detectorsString = detectorIds.join();
        DebugLogString("Clear Grid Counters: detectorsString " + detectorsString);
        var detectorSplit = detectorsString.split(",");
        for (j = 0; j < detectorSplit.length; j++) {
            // Receive Detector Name like: T000132 CC2 FD Motion, split by a space into an array, then join with an underscore
            // This removes the spaces so we turn "T000132 CC2 FD Motion" into "T000132_CC2_FD_Motion"
            var detectorName = GetObjectName("CAM_VMDA_DETECTOR", detectorSplit[j]).split(" ").join("_");
            Itv_var(detectorName + "_countVMDA") = "";
            Itv_var(detectorName + "_timeVMDA") = "";
        }
    }

    var zones = getZonesForTowers(towerWithPrefix).split(";");

    // Loop for each zone from zones that were triggered in the last day
    for (var k = 0; k < zones.length; k++) {
        var zone = zones[k];
        DebugLogString("Clear Grid Counters: clearing values for tower " + towerWithPrefix + " and zone " + zone);
        Itv_var(towerWithPrefix + "_" + zone + "_STZoneTime") = "";
        Itv_var(towerWithPrefix + "_" + zone + "_STZoneEvent") = "";
        Itv_var(towerWithPrefix + "_" + zone + "_STZoneCount") = "";
    }
}

// Get the zones that were triggered from the past day
function getZonesForTowers(towerId) {
    var cmd = "sqlcmd -U \"" + sqlUserMTN + "\" -P \"" + sqlPassMTN + "\" -S \"" + instanceNameMTN + "\" -d " + dbName + " -W -h -1 -Q \"SET NOCOUNT ON; SELECT DISTINCT TRIM(param1) + ';' FROM [PSIM].[dbo].[PROTOCOL] WITH (NOLOCK) WHERE [objtype] = 'SIGNALTOWER' AND objid = '" + towerId + "' and param1 != '' AND [date] >= DATEADD(hour, -8, GETDATE());\"";
    DebugLogString("Clear Grid Counters: getZonesForTowers: cmd is " + cmd);
    var result = run_cmd_timeout(cmd, 5000).replace(/(\r\n|\n|\r)/gm, "");
    DebugLogString("Clear Grid Counters: getZonesForTowers: result of zones triggered on tower for " + id + " is " + result);
    return result;
}

function messageAction(msg, slave) {
    var cmd = "mshta \"javascript:var sh=new ActiveXObject( 'WScript.Shell' ); sh.Popup( '" + msg + "', 10, 'Warning', 64 );close()\"";
    DoReactStr("SLAVE", slave, "CREATE_PROCESS", "command_line<" + cmd + ">");
};

function empty(str) {
    if (typeof str == 'undefined' || !str || str.length === 0 || str === "" || !/[^\s]/.test(str) || /^\s*$/.test(str) || str === "") { return true; }
    else { return false; }
};