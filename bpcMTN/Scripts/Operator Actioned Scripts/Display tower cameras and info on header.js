//var instanceName = "10.244.39.101\\SQLEXPRESS2014";
var dbName = "PSIM";
//var sqlUser = "sa";
//var sqlPass = "Intellect_default_DB_4";
var timeout = 7000;
var sqlUserMTN = "SQL_Auth_Account_For_PSIM";
var sqlPassMTN = "@F%L)Dfhq123asduiop#$577pMg_";
var instanceNameMTN = "NLPAG71,1550";

if (Event.SourceType == "MACRO" && Event.SourceId == 1004 && Event.Action == "RUN") {
    var slaveId = Event.GetParam("computer");
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
    var timestamp = Event.GetParam("date") + " " + Event.GetParam("time");
    var displayName = Event.GetParam("display_name");
    DebugLogString(timestamp + " Tower dialog script: caught event from " + slaveId + "...");

    // Header HTML Interface ID for all stacks go here
    var headerOpcie = [];

    // Inside the switch we check which computer we're using then 
    // we put the IDs of the monitors and the HTMLs inside their respective arrays
    switch (slaveId) {
        case "BTS01":
            var mon = [603, 17, 24, 35];
            headerOpcie = [23, 24, 25, 26];
            not_found = false;
            break;
        case "BTS02":
            var mon = [29, 26, 28];
            headerOpcie = [27, 28, 29];
            not_found = false;
            break;
        case "BTS03":
            var mon = [56, 57, 58];
            headerOpcie = [30, 31, 32];
            not_found = false;
            break;
        case "BTS04":
            var mon = [60, 62, 63];
            headerOpcie = [4, 34, 35];
            not_found = false;
            break;
        case "BTS05":
            var mon = [3, 4, 71];
            headerOpcie = [3, 5, 6];
            not_found = false;
            break;
        case "BTS06":
            var mon = [5, 10, 88];
            headerOpcie = [20, 38, 40];
            not_found = false;
            break;
        case "BTS07":
            var mon = [12, 13, 40];
            headerOpcie = [41, 42, 46];
            not_found = false;
            break;
        case "BTS08":
            var mon = [43, 69, 70];
            headerOpcie = [48, 49, 51];
            not_found = false;
            break;
        case "BTS09":
            var mon = [27, 30, 31, 32, 33, 36, 51, 53, 54, 55, 68];
            headerOpcie = [1, 9, 10, 12, 13, 15];
            not_found = false;
            break;
        case "BTSWALL1":
            var mon = [1067, 34];
            headerOpcie = [16, 18, 19, 37];
            not_found = false;
            break;
        case "BTS10":
            var mon = [23, 14, 20, 21, 22];
            headerOpcie = [52, 54, 55, 57, 58];
            not_found = false;
            break;
        case "BTS11":
            var mon = [52, 41, 42, 9, 44];
            headerOpcie = [60, 61, 64, 65, 66];
            not_found = false;
            break;
        case "BTS12":
            var mon = [45, 47, 48, 49, 25];
            not_found = false;
            break;
        case "MEYERM3":
            var mon = [37, 38, 39];
            headerOpcie = [67, 68, 69];
            not_found = false;
            break;
        case "MOJELAB":
            var mon = [50, 59, 61];
            headerOpcie = [70, 77, 78];
            not_found = false;
            break;
        case "SIMELANES2":
            var mon = [74, 75, 77];
            headerOpcie = [74, 79, 80];
            not_found = false;
            break;
        default:
            mon = [545];
            not_found = true;
    }

    if (!empty(towerNumber) && !not_found) {

        var towerNamePre = GetObjectName("SIGNALTOWER", towerWithPrefix);
        DebugLogString("Tower dialog script: Tower \"" + towerNumber + "\" has name \"" + towerNamePre + ".\"");
        if ((towerNamePre == "__error_value") || !(isNumeric(towerNumber))) {
            messageAction("No tower found with ID " + towerNumber + "!", slaveId);
        } else {
            // Clear the monitors on the computer
            for (i = 0; i < mon.length; i++) {
                DoReactStr("MONITOR", mon[i], "REMOVE_ALL", "");
            }

            DebugLogString(timestamp + " Tower dialog script: Displaying site " + towerNumber + " on " + slaveId + "...");
            var detectorIds = [];
            var runCams;
            var runRegion = GetObjectParam("SIGNALTOWER", towerWithPrefix, "region_id");
            DebugLogString("Tower dialog script: result for region is: " + runRegion);
            if (!empty(runRegion)) {
                var cmdCams = "sqlcmd -U \"" + sqlUserMTN + "\" -P \"" + sqlPassMTN + "\" -S \"" + instanceNameMTN + "\" -d " + dbName + " -W -h -1 -Q \"SET NOCOUNT ON; SELECT STRING_AGG([id], ',') FROM [PSIM].[dbo].[OBJ_CAM] where [region_id] = '" + runRegion.replace(/(\r\n|\n|\r)/gm, "") + "';\"";
                runCams = run_cmd_timeout(cmdCams, 10000);
                //DebugLogString("Tower dialog script: SQL query for cams: "+cmdCams);
                DebugLogString("Tower dialog script: cameras are: " + runCams);
                if (!empty(runCams)) {

                    var s = runCams.split(",");
                    for (k = 0; k < s.length; k++) {
                        for (i = 0; i < mon.length; i++) {
                            //DebugLogString("Tower dialog script: populating monitor "+mon[i]+" with camera "+parseInt(s[k]));
                            DoReactStr("MONITOR", mon[i], "ADD_SHOW", "cam<" + parseInt(s[k]) + ">");
                        }
                        detectorIds.push(GetObjectChildIds("CAM", parseInt(s[k]), "CAM_VMDA_DETECTOR"));
                    }
                    DebugLogString("Tower dialog script: detector IDs are " + detectorIds + ", total detectors number found " + detectorIds.length + " for site " + towerNumber);
                }
            } else {
                messageAction("Tower T" + towerNumber + " has not been assigned to a region!", slaveId);
            }

            var ST_coord = GetObjectParam("SIGNALTOWER", towerWithPrefix, "coordinates");
            //DebugLogString("Coordinates are "+ST_coord);
            var split = ST_coord.split(';');

            if (empty(split[0])) {
                var longitude = "No data";
            } else {
                var longitude = split[1].substring(0, 9);
            }
            if (empty(split[1])) {
                var latitude = "No data";
            } else {
                var latitude = split[0].substring(0, 10);
            }

            var towerName = GetObjectName("SIGNALTOWER", towerWithPrefix);
            var towerRegion = GetObjectParam("SIGNALTOWER", towerWithPrefix, "region_name");
            var towerCluster = GetObjectParam("SIGNALTOWER", towerWithPrefix, "cluster_name");
            var responseTime = GetObjectParam("SIGNALTOWER", towerWithPrefix, "response_time");
            var r24_state = GetObjectParam("SIGNALTOWER", towerWithPrefix, "r24");
            var siteType = GetObjectParam("SIGNALTOWER", towerWithPrefix, "site_type");
            var subcontractor = GetObjectParam("SIGNALTOWER", towerWithPrefix, "subcontractor");

            //DebugLogString("New fields: "+subcontractor+";"+siteType);

            if (runCams.replace(/(\r\n|\n|\r)/gm, "") == "NULL") {
                var towerVvs = "No";
            } else {
                var towerVvs = "Yes";
            }

            var towerIntrusion = GetObjectParam("SIGNALTOWER", towerWithPrefix, "intrusion");

            if (empty(towerIntrusion)) {
                towerIntrusion = "No";
            } else {
                towerIntrusion = "Yes";
            }
            var tier = GetObjectParam("SIGNALTOWER", towerWithPrefix, "tier");
            var icryptoRef = GetObjectParam("SIGNALTOWER", towerWithPrefix, "icrypto");

            if (empty(icryptoRef)) {
                var icryptoRef = "None";
            }

            DebugLogString("Tower dialog script: dispatch time global var check: " + Itv_var(towerWithPrefix + "_r24_dispatchTime"));
            for (i = 0; i < headerOpcie.length; i++) {
                DoReactStr("OPCIE", headerOpcie[i], "FUNC", "func_name<setAllInfo>,towerCode<" + siteId + ">,popTime<" + responseTime + ">,state<" + r24_state + ">,referenceId<" + Itv_var(towerWithPrefix + "_r24_key") + ">");
                DoReactStr("OPCIE", headerOpcie[i], "FUNC", "func_name<populateData>,coordinates<" + latitude + "," + longitude + ">,id<" + siteId + ">,name<" + towerName + ">,region<" + towerRegion + ">,siteCluster<" + towerCluster + ">,VVS<" + towerVvs + ">,Alarm<" + towerIntrusion + ">,tier<" + tier + ">,icrypto_ref<" + icryptoRef + ">,subcontractor<" + subcontractor + ">,type<" + siteType + ">");
                if (!empty(Itv_var(siteId + "_r24_dispatchTime"))) {
                    DoReactStr("OPCIE", headerOpcie[i], "FUNC", "func_name<setDispatchTime>,dispatchTime<" + Itv_var(siteId + "_r24_dispatchTime") + ">,fullTimestamp<" + Itv_var(siteId + "_r24_dispatchFullTime") + ">");
                } else {
                    DoReactStr("OPCIE", headerOpcie[i], "FUNC", "func_name<clearDispatchTimes>,dispatchTime<>,fullTimestamp<>");
                }
            }

            // Arrays to store the ST and VMDA strings
            var vmdaZoneArray = [];
            var stZoneArray = [];
            if (towerVvs == "Yes") {
                var resultingString = "";
                DebugLogString("Tower dialog script: detectorIds array " + detectorIds);
                var detectorsString = detectorIds.join();
                DebugLogString("Tower dialog script: detectorsString " + detectorsString);
                var detectorSplit = detectorsString.split(",");
                for (j = 0; j < detectorSplit.length; j++) {
                    // Receive Detector Name like: T000132 CC2 FD Motion, split by a space into an array, then join with an underscore
                    // This removes the spaces so we turn "T000132 CC2 FD Motion" into "T000132_CC2_FD_Motion"
                    var detectorName = GetObjectName("CAM_VMDA_DETECTOR", detectorSplit[j]).split(" ").join("_");;
                    var vvsCount = Itv_var(detectorName + "_countVMDA");
                    var vvsTime = Itv_var(detectorName + "_timeVMDA");

                    // Add the string to the array
                    if (!empty(vvsTime)) {
                        // vmdaZone should look like: 2022-06-29 10:49:13; T012741 TC3 Motion; 634;
                        var vmdaZone = vvsTime + ";" + detectorName + ";" + vvsCount;
                        DebugLogString("Tower dialog script: vmdaZone is " + vmdaZone);

                        vmdaZoneArray.push(vmdaZone);
                    }
                    resultingString += GetObjectName("CAM_VMDA_DETECTOR", detectorSplit[j]) + " has " + vvsCount + " triggers,";
                }
                DebugLogString("Tower dialog script: The resulting string for the detectors is: " + resultingString);
            }

            var zones = getZonesForTowers(towerWithPrefix).split(";");

            // Loop for each zone from zones that were triggered in the last day
            for (var k = 0; k < zones.length; k++) {
                var zone = zones[k];
                var stTime = Itv_var(towerWithPrefix + "_" + zone + "_STZoneTime");
                var stDescription = Itv_var(towerWithPrefix + "_" + zone + "_STZoneEvent");
                var stEventCount = Itv_var(towerWithPrefix + "_" + zone + "_STZoneCount");
                var stZoneString = "";
                if (!empty(stDescription) && !empty(stEventCount)) {
                    // stZoneString should look like: 2022-06-29 22:10:05; Automatic O/C; zone; 3;
                    stZoneString = stTime + ";" + stDescription + ";" + zone + ";" + stEventCount + ";";
                    stZoneArray.push(stZoneString);
                    DebugLogString("Tower dialog script: stZoneString is " + stZoneString);
                }
            }

            DebugLogString("Tower dialog script: stZoneArray: " + stZoneArray);
            DebugLogString("Tower dialog script: vmdaZoneArray: " + vmdaZoneArray);

            // Finally join the arrays into a string with '|' as a delimiter
            for (i = 0; i < headerOpcie.length; i++) {
                DoReactStr("OPCIE", headerOpcie[i], "FUNC", "func_name<populateGrid>,stGridInfo<" + stZoneArray.join("|") + ">,vmdaGridInfo<" + vmdaZoneArray.join("|") + ">,siteId<" + siteId + ">");
            }
        }
    }
    DebugLogString(timestamp + " Tower dialog script: finishing for site " + towerWithPrefix + "!");
};

function empty(str) {
    if (typeof str == 'undefined' || !str || str.length === 0 || str === "" || !/[^\s]/.test(str) || /^\s*$/.test(str) || str.replace(/\s/g, "") === "") { return true; }
    else { return false; }
};

function hasNumber(myString) {
    return /\d/.test(myString);
}

function isNumeric(num) {
    return !isNaN(num)
};

function messageAction(msg, slave) {
    var cmd = "mshta \"javascript:var sh=new ActiveXObject( 'WScript.Shell' ); sh.Popup( '" + msg + "', 10, 'Warning', 64 );close()\"";
    DoReactStr("SLAVE", slave, "CREATE_PROCESS", "command_line<" + cmd + ">");
};

// Get the zones that were triggered from the past day
function getZonesForTowers(towerId) {
    var cmd = "sqlcmd -U \"" + sqlUserMTN + "\" -P \"" + sqlPassMTN + "\" -S \"" + instanceNameMTN + "\" -d " + dbName + " -W -h -1 -Q \"SET NOCOUNT ON; SELECT DISTINCT TRIM(param1) + ';' FROM [PSIM].[dbo].[PROTOCOL] WITH (NOLOCK) WHERE [objtype] = 'SIGNALTOWER' AND objid = '" + towerId + "' and param1 != '' AND [date] >= DATEADD(day, -1, GETDATE());\"";
    DebugLogString("Tower dialog script: getZonesForTowers: cmd is " + cmd);
    var result = run_cmd_timeout(cmd, 5000).replace(/(\r\n|\n|\r)/gm, "");
    DebugLogString("Tower dialog script: getZonesForTowers: result of zones triggered on tower for " + towerId + " is " + result);
    return result;
}