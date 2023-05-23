//var instanceName = "10.244.39.101\\SQLEXPRESS2014";
var dbName = "intellect";
var customDB = "dataservice"
//var sqlUser = "sa";
//var sqlPass = "Intellect_default_DB_4";
var timeout = 7000;
var sqlUser = "PSIM";
var sqlPass = "Intellect_default_db_4";
var instanceName = "VPSIM";

if (Event.SourceType == "MACRO" && Event.SourceId == 1004 && Event.Action == "RUN") {
    var slaveId = Event.GetParam("slave_id");
    var siteId;
    var timestamp = Event.GetParam("date") + " " + Event.GetParam("time");
    var received_time = Event.GetParam("received_time");
    var displayName = GetObjectName("DISPLAY", Event.SourceId);

    DebugLogString(timestamp + " Tower dialog script: caught event from " + slaveId + ". Received time is " + received_time + "...");

    var gridOpcie = [];
    var htmlOpcie = []
    switch (slaveId) {
        case "AXXONDEMO1":
            var mon = [1];
            gridOpcie = [4];
            var htmlOpcie = [5]
            not_found = false;
            break;
        case "STEYNFAARDTD":
            var mon = [1];
            gridOpcie = [2];
            not_found = false;
            break;
        default:
            mon = [545];
            not_found = true;
    }

    var isAxxonDemo = slaveId.indexOf("AXXONDEMO") !== -1;
    if (isAxxonDemo) {
        var mon = [1];
        gridOpcie = [4];
        var htmlOpcie = [5]
        not_found = false;
    }

    if (!empty(Event.GetParam("number")) && !not_found) {

        var towerNamePre = GetObjectName("SIGNALTOWER", Event.GetParam("number"));
        DebugLogString("Tower dialog script: Tower \"" + Event.GetParam("number") + "\" has name \"" + towerNamePre + ".\"");
        if ((towerNamePre == "__error_value") || !(isNumeric(Event.GetParam("number")))) {

            messageAction("No tower found with ID " + Event.GetParam("number") + "!", slaveId);
        } else {
            for (i = 0; i < mon.length; i++) {
                DoReactStr("MONITOR", mon[i], "REMOVE_ALL", "");
            }

            DebugLogString(timestamp + " Tower dialog script: Displaying site " + Event.GetParam("number") + " on " + slaveId + "...");
            var detectorIds = [];
            var runCams;
            var runRegion = GetObjectParam("SIGNALTOWER", Event.GetParam("number"), "region_id");
            DebugLogString("Tower dialog script: result for region is: " + runRegion);
            if (!empty(runRegion)) {
                var cmdCams = "sqlcmd -U \"" + sqlUser + "\" -P \"" + sqlPass + "\" -S \"" + instanceName + "\" -d " + dbName + " -W -h -1 -Q \"SET NOCOUNT ON; SELECT STRING_AGG([id], ',') FROM [intellect].[dbo].[OBJ_CAM] where [region_id] = '" + runRegion.replace(/(\r\n|\n|\r)/gm, "") + "';\"";
                DebugLogString("Tower dialog script: cmd for cams is: " + cmdCams);
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
                    DebugLogString("Tower dialog script: detector IDs are " + detectorIds + ", total detectors number found " + detectorIds.length + " for site " + Event.GetParam("number"));
                }
            } else {
                messageAction("Tower T" + Event.GetParam("number") + " has not been assigned to a region!", slaveId);
            }

            //DebugLogString("Tower dialog script: tower has cameras (towerVvs variable)? " + towerVvs)
            //
            DebugLogString("Tower dialog script: closing all dialogs on " + slaveId + "...");
            DoReactStr("DIALOG", slaveId + "-Data", "CLOSE_ALL", "");
            DoReactStr("DIALOG", slaveId + "-VMDA", "CLOSE_ALL", "");
            //DoReactStr("DIALOG", slaveId + "-VMDA", "CLOSE", "");
            //DoReactStr("DIALOG", slaveId + "-VMDA", "CLOSE", "");

            DoReactStr("DIALOG", "" + slaveId + "-Tower", "CLOSE", "");

            var ST_coord = GetObjectParam("SIGNALTOWER", Event.GetParam("number"), "coordinates");
            // DebugLogString("Coordinates are "+ST_coord);
            var split = ST_coord.split(',');

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

            var towerName = GetObjectName("SIGNALTOWER", Event.GetParam("number"));
            var towerRegion = GetObjectParam("SIGNALTOWER", Event.GetParam("number"), "region_name");
            var towerCluster = GetObjectParam("SIGNALTOWER", Event.GetParam("number"), "cluster_name");
            var responseTime = GetObjectParam("SIGNALTOWER", Event.GetParam("number"), "response_time");
            var r24_state = GetObjectParam("SIGNALTOWER", Event.GetParam("number"), "r24");
            var siteType = GetObjectParam("SIGNALTOWER", Event.GetParam("number"), "site_type");
            var subcontractor = GetObjectParam("SIGNALTOWER", Event.GetParam("number"), "subcontractor");

            //DebugLogString("New fields: "+subcontractor+";"+siteType);

            if (runCams.replace(/(\r\n|\n|\r)/gm, "") == "NULL") {
                var towerVvs = "No";
            } else {
                var towerVvs = "Yes";
            }

            var towerIntrusion = received_time;

            /* if (empty(towerIntrusion)) {
               towerIntrusion = "No";
            } else {
                towerIntrusion = "Yes";
            }
        */
            var tier = GetObjectParam("SIGNALTOWER", Event.GetParam("number"), "tier");
            var icryptoRef = GetObjectParam("SIGNALTOWER", Event.GetParam("number"), "icrypto");
            var intrusion = GetObjectParam("SIGNALTOWER", Event.GetParam("number"), "intrusion");

            if (empty(icryptoRef)) {
                var icryptoRef = "None";
            }

            for (i = 0; i < htmlOpcie.length; i++) {
                DoReactStr("OPCIE", htmlOpcie[i], "FUNC", "func_name<populateData>,coordinates<" + latitude + "," + longitude + ">,id<" + Event.GetParam("number") + "-" + Event.GetParam("zone") + ">,name<" + towerName + ">,region<" + towerRegion + ">,siteCluster<" + towerCluster + ">,VVS<" + towerVvs + ">,Alarm<" + towerIntrusion + ">,tier<" + tier + ">,icrypto_ref<" + icryptoRef + ">,subcontractor<" + subcontractor + ">,type<" + siteType + ">");
            }
            DoReactStr("DIALOG", slaveId + "-Data", "RUN", "coordinates<" + latitude + "," + longitude + ">,id<" + Event.GetParam("number") + "-" + Event.GetParam("zone") + ">,name<" + towerName + ">,region<" + towerRegion + ">,siteCluster<" + towerCluster + ">,VVS<" + towerVvs + ">,Alarm<" + towerIntrusion + ">,tier<" + tier + ">,icrypto_ref<" + icryptoRef + ">,subcontractor<" + subcontractor + ">,type<" + siteType + ">");
            //
            DebugLogString("Tower dialog script: closing all dialogs on " + slaveId + "...");

            var towerId = Event.GetParam("number");
            DoReactStr("DIALOG", slaveId + "-Tower", "RUN", "");

            // Arrays to store the ST and VMDA strings
            var embeddedZoneArray = [];
            var stZoneArray = [];
            if (towerVvs == "Yes") {
                // DebugLogString("Tower dialog script: detectorIds array " + detectorIds);
                // var detectorsString = detectorIds.join();
                // DebugLogString("Tower dialog script: detectorsString " + detectorsString);
                // var detectorSplit = detectorsString.split(",");
                // for (j = 0; j < detectorSplit.length; j++) {
                //     var vvsCount = getCountOfVMDATriggers(detectorSplit[j]);
                //     var vvsTime = getTimeOfLastVMDATriggers(detectorSplit[j]);
                //     var zoneName = GetObjectName("CAM_VMDA_DETECTOR", detectorSplit[j]);

                //     // Add the string to the array
                //     if (!empty(vvsTime)) {
                //         // vmdaZone should look like: 2022-06-29 10:49:13; T012741 TC3 Motion; 634;
                //         var vmdaZone = vvsTime + ";" + zoneName + ";" + vvsCount;
                //         DebugLogString("Tower dialog script: vmdaZone is " + vmdaZone);

                //         vmdaZoneArray.push(vmdaZone);
                //     }
                // }
            }

            // Loop 4 times for each zone from zones 1-4
            for (zone = 1; zone < 5; zone++) {
                var stDescription = getSignalTowerZoneEventDescriptionTime(towerId, zone);
                var stEventCount = getSignalTowerZoneEventCount(towerId, zone);
                var stZoneString = "";
                if (!empty(stDescription) && !empty(stEventCount)) {
                    // stZoneString should look like: 2022-06-29 22:10:05; Automatic O/C; 3;
                    stZoneString = stDescription + stEventCount + zone + ";";
                    stZoneArray.push(stZoneString);
                    DebugLogString("Tower dialog script: stZoneString is " + stZoneString);
                }
            }

            DebugLogString("Tower dialog script: stZoneArray: " + stZoneArray);
            DebugLogString("Tower dialog script: vmdaZoneArray: " + embeddedZoneArray);

            // Finally join the arrays into a string with '|' as a delimiter
            for (i = 0; i < htmlOpcie.length; i++) {
                DoReactStr("OPCIE", htmlOpcie[i], "FUNC", "func_name<populateGrid>,stGridInfo<" + stZoneArray.join("|") + ">,vmdaGridInfo<" + embeddedZoneArray.join("|") + ">,towerId<" + towerId + ">");
            }
        }
    }
    DebugLogString(timestamp + " Tower dialog script: finishing for site " + towerId + "!");
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

// Get the SignalTower Event description and time of the event for zone i 
function getSignalTowerZoneEventDescriptionTime(towerId, i) {
    var cmd = "sqlcmd -U \"" + sqlUser + "\" -P \"" + sqlPass + "\" -S \"" + instanceName + "\" -d " + customDB + " -W -h -1 -Q \"SET NOCOUNT ON; SELECT TOP(1) convert(varchar,dataservice.signaltower_processing.[date],120) + ';' as [date], (SELECT TOP 1 description FROM [intellect].[dbo].[EVENT] WHERE EVENT.action = signaltower_processing.action) + ';' as [type] FROM [dataservice].[dbo].[signaltower_processing] WITH (NOLOCK) WHERE [dataservice].[dbo].[signaltower_processing].[objid] = '" + towerId + "' AND [dataservice].[dbo].[signaltower_processing].zone = 'cam:" + i + "' AND [date] >= DATEADD(hour, -3, GETDATE()) ORDER BY [dataservice].[dbo].[signaltower_processing].[date] DESC;\"";
    DebugLogString("Tower dialog script: getSignalTowerZoneEventDescriptionTime: cmd is " + cmd);
    var result = run_cmd_timeout(cmd, 2000).replace(/(\r\n|\n|\r)/gm, "");
    DebugLogString("Tower dialog script: getSignalTowerZoneEventDescriptionTime: result DescriptionTime for " + towerId + " is " + result);
    return result;
}

// Get the SignalTower Event total Count of the event for zone i 
function getSignalTowerZoneEventCount(towerId, i) {
    var cmd = "sqlcmd -U \"" + sqlUser + "\" -P \"" + sqlPass + "\" -S \"" + instanceName + "\" -d " + customDB + " -W -h -1 -Q \"SET NOCOUNT ON; SELECT CONCAT(COALESCE(count(objid), '0'), ';') FROM [dataservice].[dbo].[signaltower_processing] WITH (NOLOCK) WHERE [objid] = '" + towerId + "' AND zone = 'cam:" + i + "' AND [date] >= DATEADD(hour, -3, GETDATE());\"";
    DebugLogString("Tower dialog script: getSignalTowerZoneEventCount: cmd is " + cmd);
    var result = run_cmd_timeout(cmd, 2000).replace(/(\r\n|\n|\r)/gm, "");
    DebugLogString("Tower dialog script: getSignalTowerZoneEventCount: result Count for " + towerId + " is " + result);
    return result;
}

// Get the Embedded Event description and time of the event for zone i 
function getEmbeddedZoneEventDescriptionTime(towerId, i) {
    var cmd = "sqlcmd -U \"" + sqlUser + "\" -P \"" + sqlPass + "\" -S \"" + instanceName + "\" -d " + customDB + " -W -h -1 -Q \"SET NOCOUNT ON; SELECT TOP(1) convert(varchar,dataservice.dbo.signaltower_processing.[date],120) + ';' as [date], (SELECT TOP 1 description FROM [intellect].[dbo].[EVENT] WHERE EVENT.action + '" + i + "' = signaltower_processing.action) + ';' as [type] FROM [dataservice].[dbo].[signaltower_processing] WITH (NOLOCK) WHERE [dataservice].[dbo].[signaltower_processing].[objid] = '" + towerId + "' AND [dataservice].[dbo].[signaltower_processing].zone = 'cam:" + i + "' AND [date] >= DATEADD(hour, -4, GETDATE()) ORDER BY [dataservice].[dbo].[signaltower_processing].[date] DESC;\"";
    DebugLogString("Tower dialog script: getEmbeddedZoneEventDescriptionTime: cmd is " + cmd);
    var result = run_cmd_timeout(cmd, 1000).replace(/(\r\n|\n|\r)/gm, "");
    DebugLogString("Tower dialog script: getEmbeddedZoneEventDescriptionTime: result DescriptionTime for " + towerId + " is " + result);
    return result;
}

// Get the Embedded Event total Count of the event for zone i 
function getEmbeddedZoneEventCount(towerId, i) {
    var cmd = "sqlcmd -U \"" + sqlUser + "\" -P \"" + sqlPass + "\" -S \"" + instanceName + "\" -d " + customDB + " -W -h -1 -Q \"SET NOCOUNT ON; SELECT CONCAT(COALESCE(count(objid), '0'), ';') FROM [dataservice].[dbo].[signaltower_processing] WITH (NOLOCK) WHERE [objid] = '" + towerId + "' AND zone = 'cam:" + i + "' AND [date] >= DATEADD(hour, -4, GETDATE());\"";
    DebugLogString("Tower dialog script: getEmbeddedZoneEventCount: cmd is " + cmd);
    var result = run_cmd_timeout(cmd, 1000).replace(/(\r\n|\n|\r)/gm, "");
    DebugLogString("Tower dialog script: getEmbeddedZoneEventCount: result Count for " + towerId + " is " + result);
    return result;
}

// Get the distinct zones for given towerId
function getDistinctZoneCount(towerId) {
    var cmd = "sqlcmd -U \"" + sqlUser + "\" -P \"" + sqlPass + "\" -S \"" + instanceName + "\" -d " + customDB + " -W -h -1 -Q \"SET NOCOUNT ON; SELECT DISTINCT zone FROM [dataservice].[dbo].[signaltower_processing] WITH (NOLOCK) WHERE [objid] = '" + towerId + "' AND [zone] LIKE '%zone%' AND [date] >= DATEADD(hour, -4, GETDATE());\"";
    DebugLogString("Tower dialog script: getDistinctZoneCount: cmd is " + cmd);
    var result = run_cmd_timeout(cmd, 1000).replace(/(\r\n|\n|\r)/gm, "|");
    DebugLogString("Tower dialog script: getDistinctZoneCount: result Count for " + towerId + " is " + result);
    return result;
}