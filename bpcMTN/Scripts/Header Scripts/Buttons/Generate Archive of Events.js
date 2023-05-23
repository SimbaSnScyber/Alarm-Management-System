//var instanceName = "10.244.39.101\\SQLEXPRESS2014";
var dbName = "PSIM";
//var sqlUser = "sa";
//var sqlPass = "Intellect_default_DB_4";
var timeout = 7000;
var sqlUserMTN = "SQL_Auth_Account_For_PSIM";
var sqlPassMTN = "@F%L)Dfhq123asduiop#$577pMg_";
var instanceNameMTN = "NLPAG71,1550";

if (Event.SourceType == "MACRO" && Event.SourceId == 666 && Event.Action == "RUN") {
    var slaveId = Event.GetParam("computer");
    var siteId = Event.GetParam("tower"); // From HTML we get T655 but from IM we get 655
    var towerNumber = siteId.replace(/[^0-9]/g, ''); // Remove non-numbers from siteId

    var timeFrame = Event.GetParam("timeFrame")
    var timeValue = Event.GetParam("timeValue")

    var timestamp = Event.GetParam("date") + " " + Event.GetParam("time");
    DebugLogString(timestamp + " Generate Archive of Events script: caught event from " + slaveId + "...");

    // Header HTML Interface ID for all stacks go here
    var headerOpcie = [];

    // Inside the switch we check which computer we're using then 
    // we put the IDs of the monitors and the HTMLs inside their respective arrays
    switch (slaveId) {
        case "BTS01":
            headerOpcie = [23, 24, 25, 26];
            not_found = false;
            break;
        case "BTS02":
            headerOpcie = [27, 28, 29];
            not_found = false;
            break;
        case "BTS03":
            headerOpcie = [30, 31, 32];
            not_found = false;
            break;
        case "BTS04":
            headerOpcie = [4, 34, 35];
            not_found = false;
            break;
        case "BTS05":
            headerOpcie = [3, 5, 6];
            not_found = false;
            break;
        case "BTS06":
            headerOpcie = [20, 38, 40];
            not_found = false;
            break;
        case "BTS07":
            headerOpcie = [41, 42, 46];
            not_found = false;
            break;
        case "BTS08":
            headerOpcie = [48, 49, 51];
            not_found = false;
            break;
        case "BTS09":
            headerOpcie = [1, 9, 10, 12, 13, 15];
            not_found = false;
            break;
        case "BTSWALL1":
            headerOpcie = [16, 18, 19, 37];
            not_found = false;
            break;
        case "BTS10":
            headerOpcie = [52, 54, 55, 57, 58];
            not_found = false;
            break;
        case "BTS11":
            headerOpcie = [60, 61, 64, 65, 66];
            not_found = false;
            break;
        case "MEYERM3":
            headerOpcie = [67, 68, 69];
            not_found = false;
            break;
        case "MOJELAB":
            headerOpcie = [70, 77, 78];
            not_found = false;
            break;
        case "SIMELANES2":
            headerOpcie = [74, 79, 80];
            not_found = false;
            break;
        default:
            not_found = true;
    }

    DebugLogString("Generate Archive of Events script: Do we have a towerNumber: " + towerNumber)
    if (!empty(towerNumber) && !not_found) {

        var towerNamePre = GetObjectName("SIGNALTOWER", siteId);
        DebugLogString("Generate Archive of Events script: Tower \"" + towerNumber + "\" has name \"" + towerNamePre + ".\"");
        if ((towerNamePre == "__error_value") || !(isNumeric(towerNumber))) {
            messageAction("No tower found with ID " + towerNumber + "!", slaveId);
        } else {
            DebugLogString(timestamp + " Generate Archive of Events script: Displaying site " + towerNumber + " on " + slaveId + "...");
            var detectorIds = [];
            var runCams;
            var runRegion = GetObjectParam("SIGNALTOWER", siteId, "region_id");
            DebugLogString("Generate Archive of Events script: result for region is: " + runRegion);
            if (!empty(runRegion)) {
                var cmdCams = "sqlcmd -U \"" + sqlUserMTN + "\" -P \"" + sqlPassMTN + "\" -S \"" + instanceNameMTN + "\" -d " + dbName + " -W -h -1 -Q \"SET NOCOUNT ON; SELECT STRING_AGG([id], ',') FROM [PSIM].[dbo].[OBJ_CAM] where [region_id] = '" + runRegion.replace(/(\r\n|\n|\r)/gm, "") + "';\"";
                DebugLogString("Generate Archive of Events script: SQL query for cams: " + cmdCams);
                runCams = run_cmd_timeout(cmdCams, 10000);
                DebugLogString("Generate Archive of Events script: cameras are: " + runCams);
                if (!empty(runCams)) {
                    var s = runCams.split(",");
                    for (k = 0; k < s.length; k++) {
                        detectorIds.push(GetObjectChildIds("CAM", parseInt(s[k]), "CAM_VMDA_DETECTOR"));
                    }
                    DebugLogString("Generate Archive of Events script: detector IDs are " + detectorIds + ", total detectors number found " + detectorIds.length + " for site " + towerNumber);
                }
            } else {
                messageAction("Tower T" + towerNumber + " has not been assigned to a region!", slaveId);
            }

            if (runCams.replace(/(\r\n|\n|\r)/gm, "") == "NULL") {
                var towerVvs = "No";
            } else {
                var towerVvs = "Yes";
            }

            // Arrays to store the ST and VMDA strings
            var vmdaZoneArray = [];
            var stZoneArray = [];

            if (towerVvs == "Yes") {
                var resultingString = "";
                DebugLogString("Generate Archive of Events script: detectorIds array " + detectorIds);
                var detectorsString = detectorIds.join();
                DebugLogString("Generate Archive of Events script: detectorsString " + detectorsString);
                var detectorSplit = detectorsString.split(",");
                for (j = 0; j < detectorSplit.length; j++) {
                    var vvsCount = getCountOfVMDATriggers(detectorSplit[j], timeFrame, timeValue);
                    var vvsTime = getTimeOfLastVMDATriggers(detectorSplit[j], timeFrame, timeValue);
                    var zoneName = GetObjectName("CAM_VMDA_DETECTOR", detectorSplit[j]);

                    // Add the string to the array
                    if (!empty(vvsTime)) {
                        // vmdaZone should look like: 2022-06-29 10:49:13; T012741 TC3 Motion; 634;
                        var vmdaZone = vvsTime + ";" + zoneName + ";" + vvsCount;
                        DebugLogString("Generate Archive of Events script: vmdaZone is " + vmdaZone);

                        vmdaZoneArray.push(vmdaZone);
                    }
                    resultingString += GetObjectName("CAM_VMDA_DETECTOR", detectorSplit[j]) + " has " + vvsCount + " triggers,";
                }
                DebugLogString("Generate Archive of Events script: The resulting string for the detectors is: " + resultingString);
            } else {
                resultingString = "No VVS triggers on the site " + siteId + ",";
            }

            var zones = getZonesForTowers(siteId, timeFrame, timeValue).split(";");

            // Loop k times for each zone 
            for (var k = 0; k < zones.length; k++) {
                var zone = zones[k]
                var stDescription = getSignalTowerZoneEventDescriptionTime(siteId, zone, timeFrame, timeValue);
                var stEventCount = getSignalTowerZoneEventCount(siteId, zone, timeFrame, timeValue);
                var stZoneString = "";
                if (!empty(stDescription) && !empty(stEventCount)) {
                    // stZoneString should look like: 2022-06-29 22:10:05; Automatic O/C; zone; 3;
                    stZoneString = stDescription + zone + ";" + stEventCount;
                    stZoneArray.push(stZoneString);
                    DebugLogString("Generate Archive of Events script: stZoneString is " + stZoneString);
                }
            }

            DebugLogString("Generate Archive of Events script: stZoneArray: " + stZoneArray);
            DebugLogString("Generate Archive of Events script: vmdaZoneArray: " + vmdaZoneArray);

            // Finally join the arrays into a string with '|' as a delimiter
            for (i = 0; i < headerOpcie.length; i++) {
                DoReactStr("OPCIE", headerOpcie[i], "FUNC", "func_name<populateArchiveGrid>,stGridInfo<" + stZoneArray.join("|") + ">,vmdaGridInfo<" + vmdaZoneArray.join("|") + ">,siteId<" + siteId + ">");
            }
        }
    }
    DebugLogString(timestamp + " Generate Archive of Events script: finishing for site " + siteId + "!");
};

function empty(str) {
    if (typeof str == 'undefined' || !str || str.length === 0 || str === "" || !/[^\s]/.test(str) || /^\s*$/.test(str) || str === "") { return true; }
    else { return false; }
};

function isNumeric(num) {
    return !isNaN(num)
};

function messageAction(msg, slave) {
    var cmd = "mshta \"javascript:var sh=new ActiveXObject( 'WScript.Shell' ); sh.Popup( '" + msg + "', 10, 'Manual events creation', 64 );close()\"";
    //DebugLogString(cmd);
    DoReactStr("SLAVE", slave, "CREATE_PROCESS", "command_line<" + cmd + ">");
};

// Get the zones that were triggered from the past day
function getZonesForTowers(towerId, timeFrame, timeValue) {
    var cmd = "sqlcmd -U \"" + sqlUserMTN + "\" -P \"" + sqlPassMTN + "\" -S \"" + instanceNameMTN + "\" -d " + dbName + " -W -h -1 -Q \"SET NOCOUNT ON; SELECT DISTINCT param1 + ';' FROM [PSIM].[dbo].[PROTOCOL] WITH (NOLOCK) WHERE [objtype] = 'SIGNALTOWER' AND objid = '" + towerId + "' and param0 = '' and param1 != '' AND [date] >= DATEADD(" + timeFrame + ", -" + timeValue + ", GETDATE());\"";
    DebugLogString("Generate Archive of Events script: getZonesForTowers: cmd is " + cmd);
    var result = run_cmd_timeout(cmd, 5000).replace(/(\r\n|\n|\r)/gm, "");
    DebugLogString("Generate Archive of Events script: getZonesForTowers: result of zones triggered on tower for " + towerId + " is " + result);
    return result;
}

function getCountOfVMDATriggers(id, timeFrame, timeValue) {
    var cmd = "sqlcmd -U \"" + sqlUserMTN + "\" -P \"" + sqlPassMTN + "\" -S \"" + instanceNameMTN + "\" -d " + dbName + " -W -h -1 -Q \"SET NOCOUNT ON; SELECT COALESCE(count([objid]), '0') as cnt FROM [PSIM].[dbo].[PROTOCOL] WITH(NOLOCK) WHERE [PSIM].[dbo].[PROTOCOL].[objtype] = 'CAM_VMDA_DETECTOR' AND [action] = 'ALARM' AND [objid] = '" + id + "' AND [date] >= DATEADD(" + timeFrame + ", -" + timeValue + ", GETDATE());\"";
    DebugLogString("Generate Archive of Events script: getCountOfVMDATriggers: cmd is " + cmd);
    var result = run_cmd_timeout(cmd, 5000).replace(/(\r\n|\n|\r)/gm, "");
    DebugLogString("Generate Archive of Events script: getCountOfVMDATriggers: result VMDA triggers counter for " + id + " is " + result);
    return result;
};

// Get the time of the last VMDA trigger for the given ID within the past 6 hours
function getTimeOfLastVMDATriggers(id, timeFrame, timeValue) {
    var cmd = "sqlcmd -U \"" + sqlUserMTN + "\" -P \"" + sqlPassMTN + "\" -S \"" + instanceNameMTN + "\" -d " + dbName + " -W -h -1 -Q \"SET NOCOUNT ON; SELECT TOP(1) convert(varchar,[date],120) as [date] FROM [PSIM].[dbo].[PROTOCOL] WITH(NOLOCK) WHERE [PSIM].[dbo].[PROTOCOL].[objtype] = 'CAM_VMDA_DETECTOR' AND [action] = 'ALARM' AND [objid] = '" + id + "' AND [date] >= DATEADD(" + timeFrame + ", -" + timeValue + ", GETDATE()) ORDER BY date DESC;\"";
    DebugLogString("Generate Archive of Events script: getTimeOfLastVMDATriggers: cmd is " + cmd);
    var result = run_cmd_timeout(cmd, 23000).replace(/(\r\n|\n|\r)/gm, "");
    DebugLogString("Generate Archive of Events script: getTimeOfLastVMDATriggers: result last VMDA time for " + id + " is " + result);
    return result;
};

// Get the SignalTower Event description and time of the event for zone i 
function getSignalTowerZoneEventDescriptionTime(towerId, i, timeFrame, timeValue) {
    if (!empty(i)) {
        var cmd = "sqlcmd -U \"" + sqlUserMTN + "\" -P \"" + sqlPassMTN + "\" -S \"" + instanceNameMTN + "\" -d " + dbName + " -W -h -1 -Q \"SET NOCOUNT ON; SELECT TOP(1) convert(varchar,[date],120) + ';' as [date], (SELECT TOP 1 description FROM [PSIM].[dbo].[EVENT] WHERE EVENT.action = PROTOCOL.action) + ';' as [type] FROM [PSIM].[dbo].[PROTOCOL] WITH (NOLOCK) WHERE [objtype] = 'SIGNALTOWER' AND [objid] = '" + towerId + "' AND param1 = '" + i + "' AND [date] >= DATEADD(" + timeFrame + ", -" + timeValue + ", GETDATE()) ORDER BY [date] DESC;\"";
        DebugLogString("Generate Archive of Events script: getSignalTowerZoneEventDescriptionTime: cmd is " + cmd);
        var result = run_cmd_timeout(cmd, 5000).replace(/(\r\n|\n|\r)/gm, "");
        DebugLogString("Generate Archive of Events script: getSignalTowerZoneEventDescriptionTime: result DescriptionTime for " + towerId + " is " + result);
        return result;
    }
    DebugLogString("Generate Archive of Events script: Zone is empty: " + i)
    return ""
}

// Get the SignalTower Event total Count of the event for zone i 
function getSignalTowerZoneEventCount(towerId, i, timeFrame, timeValue) {
    if (!empty(i)) {
        var cmd = "sqlcmd -U \"" + sqlUserMTN + "\" -P \"" + sqlPassMTN + "\" -S \"" + instanceNameMTN + "\" -d " + dbName + " -W -h -1 -Q \"SET NOCOUNT ON; SELECT CONCAT(COALESCE(count(pk), '0'), ';') FROM [PSIM].[dbo].[PROTOCOL] WITH (NOLOCK) WHERE [objtype] = 'SIGNALTOWER' AND [objid] = '" + towerId + "' AND param1 = '" + i + "' AND [date] >= DATEADD(" + timeFrame + ", -" + timeValue + ", GETDATE());\"";
        DebugLogString("Generate Archive of Events script: getSignalTowerZoneEventCount: cmd is " + cmd);
        var result = run_cmd_timeout(cmd, 5000).replace(/(\r\n|\n|\r)/gm, "");
        DebugLogString("Generate Archive of Events script: getSignalTowerZoneEventCount: result Count for " + towerId + " is " + result);
        return result;
    }
    DebugLogString("Generate Archive of Events script: Zone is empty: " + i)
    return ""
}
