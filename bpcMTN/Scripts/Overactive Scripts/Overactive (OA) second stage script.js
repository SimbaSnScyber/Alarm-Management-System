/*
Zone states description:
normal - 0
bypass - 1
tamper - 2
overactive 1st stage - 3
overactive 2nd stage - 4
*/

var hoursBack = "-3";
var instanceName = "NLPAG71,1550";		// MTN SQL core - some of the data is being gathered from there
var dbName = "PSIM";
var sqlUserName = "SQL_Auth_Account_For_PSIM";
var sqlPassword = "@F%L)Dfhq123asduiop#$577pMg_";
var timeout = 60000;				// timeout for SQL queries

if (Event.SourceType == "MACRO" && Event.Action == "RUN" && Event.SourceId == 483) {
    var timestamp = Event.GetParam("date") + " " + Event.GetParam("time");

    var overactive_towers = getOATowersFromSQL();

    if (empty(overactive_towers) || overactive_towers == "NULL" || overactive_towers.indexOf("T") == -1) {

        DebugLogString(timestamp + " Overactive second stage: no overactive towers detected! " + overactive_towers);	// Doing nothing

    } else if (overactive_towers.indexOf(",") !== -1) {						// if results contains "," symbol then proceeding

        DebugLogString(timestamp + " Overactive second stage: overactive towers detected! " + overactive_towers);

        var overactive_towers_split = overactive_towers.split(",");
        var overactive_towers_length = overactive_towers_split.length - 1;				// -1 because we're adding "," symbol in the SQL query itself

        for (i = 0; i < overactive_towers_length; i++) {						// iterating over overactive towers

            var tower_region = GetObjectParam("SIGNALTOWER", overactive_towers_split[i], "region_id");
            var zone_triggers = getIndividualRawVMDATriggersPerRegion(tower_region, overactive_towers_split[i]);	// getting the VMDA zone triggers per tower

            if (!empty(zone_triggers)) {
                assignNewOveractiveVMDAStatesPerZone(overactive_towers_split[i], zone_triggers);
            }

            var zone_triggers = getIndividualRawSTTriggersPerRegion(tower_region, overactive_towers_split[i]);

            if (!empty(zone_triggers)) {
                assignNewOveractiveSTStatesPerZone(overactive_towers_split[i], zone_triggers);
            }
        }
    }
};

function changeZoneState(towerId, zoneId, state) {
    if (!empty(towerId) && !empty(zoneId) && !empty(state)) {
        DebugLogString(timestamp + " Overactive second stage: changeZoneState(" + towerId + "): changing tower ID \"" + towerId + "\" zone \"" + zoneId + "state\" to the state " + state);
        SetObjectParam("SIGNALTOWER", towerId, zoneId + "state", state);		// Setting the zone state here
        SetObjectParam("SIGNALTOWER", towerId, zoneId + "timestamp", timestamp);	// Setting the zone state timestamp here
    }
};

function produceOAEvent(towerId, zoneId) {
    zoneCapitalized = zoneId.toUpperCase();
    DebugLogString(timestamp + " Overactive second stage: produceOAEvent(" + towerId + "," + zoneId + "): generating event: SIGNALTOWER|" + towerId + "|OVERACTIVE_" + zoneCapitalized + "|");
    NotifyEventStr("SIGNALTOWER", towerId, "OVERACTIVE_" + zoneCapitalized, "");
};

function assignNewOveractiveVMDAStatesPerZone(tower, zone_triggers) {
    zone_triggers_splitted = zone_triggers.split("|");


    for (k = 0; k < zone_triggers_splitted.length; k++) {
        if (parseInt(zone_triggers_splitted[k]) >= 20) {
            var zone_name;
            switch (k) {
                case 0:
                    zone_name = "cc1";
                    break;
                case 1:
                    zone_name = "cc2";
                    break;
                case 2:
                    zone_name = "tc1";
                    break;
                case 3:
                    zone_name = "tc2";
                    break;
                case 4:
                    zone_name = "tc3";
                    break;
                default:
                    zone_name = "";
                    break;
            }

            DebugLogString(timestamp + " Overactive second stage: assignNewOveractiveStatesPerZone(): tower: " + tower + ": DETECTED zone " + zone_name + " triggered " + zone_triggers_splitted[k] + " times");
            changeZoneState(tower, zone_name, "4");
            produceOAEvent(tower, zone_name);
        }
    }
};

function assignNewOveractiveSTStatesPerZone(tower, zone_triggers) {
    zone_triggers_splitted = zone_triggers.split("|");


    for (k = 0; k < zone_triggers_splitted.length; k++) {
        if (parseInt(zone_triggers_splitted[k]) >= 20) {
            var zone_name;
            switch (k) {
                case 0:
                    zone_name = "zone1";
                    break;
                case 1:
                    zone_name = "zone2";
                    break;
                case 2:
                    zone_name = "zone3";
                    break;
                case 3:
                    zone_name = "zone4";
                    break;
                case 4:
                    zone_name = "zone5";
                    break;
                default:
                    zone_name = "";
                    break;
            }

            DebugLogString(timestamp + " Overactive second stage: assignNewOveractiveSTStatesPerZone(): tower: " + tower + ": DETECTED zone " + zone_name + " triggered " + zone_triggers_splitted[k] + " times");
            changeZoneState(tower, zone_name, "4");
            produceOAEvent(tower, zone_name);
        }
    }
};

function getIndividualRawVMDATriggersPerRegion(region_id, tower) {
    if (!empty(region_id) && !empty(tower)) {
        DebugLogString(timestamp + " Overactive second stage: getIndividualRawVMDATriggersPerRegion(" + region_id + "): getting number of all zone triggers for tower " + tower);

        var query = "\"SET NOCOUNT ON; SELECT c.CC1, c.CC2, c.TC1, c.TC2, c.TC3 from (Select region_id, count(case WHEN param0 LIKE '%CC1%' Then 1 else NULL END) as CC1, count(case WHEN param0 LIKE '%CC2%' Then 1 else NULL END) as CC2, count(case WHEN param0 LIKE '%TC1%' Then 1 else NULL END) as TC1, count(case WHEN param0 LIKE '%TC2%' Then 1 else NULL END) as TC2, count(case WHEN param0 LIKE '%TC3%' Then 1 else NULL END) as TC3, count(case param1 WHEN ' (Zone 001)' Then 1 else NULL END) as Door_contact, count(case param1 WHEN ' (Zone 002)' Then 1 else NULL END) as Motion_Sensor, count(case param1 WHEN ' (Zone 003)' Then 1 else NULL END) as Vibration1, count(case param1 WHEN ' (Zone 004)' Then 1 else NULL END) as Vibration2, count(case param1 WHEN ' (Zone 005)' Then 1 else NULL END) as Vibration3 FROM " + dbName + ".[dbo].[PROTOCOL] WITH (NOLOCK,NOWAIT) where ((objtype = 'CAM_VMDA_DETECTOR' and action = 'ALARM')) and  date >= DATEADD(hour, " + hoursBack + ", GETDATE()) AND region_id = '" + region_id + "' GROUP BY region_id) c where (CC1 > 19 or CC2 > 19 or TC1 > 19 or TC2 > 19 or TC3 > 19);";
        var cmd = "sqlcmd -U " + sqlUserName + " -P " + sqlPassword + " -S \"" + instanceName + "\" -s \"|\" -W -h -1 -Q " + query + "\"";

        DebugLogString(timestamp + " Overactive second stage: getIndividualRawVMDATriggersPerRegion(" + region_id + "): SQL cmd is " + cmd);

        var run = run_cmd_timeout(cmd, timeout);

        var runTrimmed = run.replace(/(\r\n|\n|\r)/gm, "");
        DebugLogString(timestamp + " Overactive second stage: getIndividualRawVMDATriggersPerRegion(" + region_id + "): SQL result is " + runTrimmed);

        if (runTrimmed.indexOf("|") == -1) {
            return;
        } else {
            return runTrimmed;
        }
    } else {
        DebugLogString(timestamp + " Overactive second stage: getIndividualRawVMDATriggersPerRegion(" + region_id + "): region is EMPTY!");
        return;
    }
};

function getIndividualRawSTTriggersPerRegion(region_id, tower) {
    if (!empty(region_id) && !empty(tower)) {
        DebugLogString(timestamp + " Overactive second stage: getIndividualRawSTTriggersPerRegion(" + region_id + "): getting number of all zone triggers for tower " + tower);

        var query = "\"SET NOCOUNT ON; SELECT c.Door_contact, c.Motion_Sensor, c.Vibration1, c.Vibration2, c.Vibration3 FROM (SELECT (SELECT TOP 1 region_id FROM dbo.OBJ_SIGNALTOWER WHERE id = [param0]) as region_id, count(case param1 WHEN ' (Zone 001)' Then 1 else NULL END) as Door_contact, count(case param1 WHEN ' (Zone 002)' Then 1 else NULL END) as Motion_Sensor, count(case param1 WHEN ' (Zone 003)' Then 1 else NULL END) as Vibration1, count(case param1 WHEN ' (Zone 004)' Then 1 else NULL END) as Vibration2, count(case param1 WHEN ' (Zone 005)' Then 1 else NULL END) as Vibration3 FROM " + dbName + ".[dbo].[PROTOCOL] WITH (NOLOCK,NOWAIT) WHERE objtype = 'MACRO' AND objid = '3000' AND action = 'RUN' AND (param2 = 'Burglary' OR param2 = 'Tamper' OR param2 = 'Sensor Tamper' OR param2 = 'Zone/Sensor Bypass') AND date >= DATEADD(hour, -3, GETDATE()) GROUP BY param0) c WHERE (Door_contact > 19 or Motion_Sensor > 19 or Vibration1 > 19 or Vibration2 > 19 or Vibration3 > 19) AND region_id = '" + region_id + "';";
        var cmd = "sqlcmd -U " + sqlUserName + " -P " + sqlPassword + " -S \"" + instanceName + "\" -d " + dbName + " -s \"|\" -W -h -1 -Q " + query + "\"";

        DebugLogString(timestamp + " Overactive second stage: getIndividualRawSTTriggersPerRegion(" + region_id + "): SQL cmd is " + cmd);

        var run = run_cmd_timeout(cmd, timeout);

        var runTrimmed = run.replace(/(\r\n|\n|\r)/gm, "");
        DebugLogString(timestamp + " Overactive second stage: getIndividualRawSTTriggersPerRegion(" + region_id + "): SQL result is " + runTrimmed);

        if (runTrimmed.indexOf("|") == -1) {
            return;
        } else {
            return runTrimmed;
        }
    } else {
        DebugLogString(timestamp + " Overactive second stage: getIndividualRawSTTriggersPerRegion(" + region_id + "): region is EMPTY!");
        return;
    }
};

function getOATowersFromSQL() {
    DebugLogString(timestamp + " Overactive second stage: getOATowersFromSQL(): getting towers which have overactive first stage in the last " + hoursBack + " hours from SQL " + instanceName);

    var query = "\"SET NOCOUNT ON; SET DATEFORMAT dmy; SELECT STRING_AGG(id, ',') + ',' as towers FROM " + dbName + ".dbo.OBJ_SIGNALTOWER WHERE (zone1state = '3' AND CAST(zone1timestamp as datetime) >= DATEADD(hour, -3, GETDATE())) OR (zone2state = '3' AND CAST(zone2timestamp as datetime) >= DATEADD(hour, -3, GETDATE())) or (zone3state = '3' AND CAST(zone3timestamp as datetime) >= DATEADD(hour, -3, GETDATE())) or (zone4state = '3' AND CAST(zone4timestamp as datetime) >= DATEADD(hour, -3, GETDATE())) or (zone5state = '3' AND CAST(zone5timestamp as datetime) >= DATEADD(hour, -3, GETDATE())) or (cc1state = '3' AND CAST(cc1timestamp as datetime) >= DATEADD(hour, -3, GETDATE())) or (cc2state = '3' AND CAST(cc2timestamp as datetime) >= DATEADD(hour, -3, GETDATE())) or (tc1state = '3' AND CAST(tc1timestamp as datetime) >= DATEADD(hour, -3, GETDATE())) or (tc2state = '3' AND CAST(tc2timestamp as datetime) >= DATEADD(hour, -3, GETDATE())) or (tc3state = '3' AND CAST(tc3timestamp as datetime) >= DATEADD(hour, -3, GETDATE()));";
    var cmd = "sqlcmd -U \"" + sqlUserName + "\" -P \"" + sqlPassword + "\" -S \"" + instanceName + "\" -s \"|\" -W -h -1 -Q " + query + ";\"";

    DebugLogString(timestamp + " Overactive second stage: getOATowersFromSQL(): SQL cmd is " + cmd);
    var run = run_cmd_timeout(cmd, 10000);

    var runTrimmed = run.replace(/(\r\n|\n|\r)/gm, "");
    DebugLogString(timestamp + " Overactive second stage: getOATowersFromSQL(): SQL result is " + runTrimmed);
    return runTrimmed;
};

function empty(str) {
    if (typeof str == 'undefined' || !str || str.length === 0 || str === "" || !/[^\s]/.test(str) || /^\s*$/.test(str) || str === "") { return true; }
    else { return false; }
};