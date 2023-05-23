/*
Zone states description:
normal - 0
bypass - 1
tamper - 2
overactive 1st stage - 3
overactive 2nd stage - 4
*/


var events_db = "PSIM";				// Intellect main DB
var sqlInstance = "NLPAG71,1550"; 	// SQL instance with operators action table
var sqlUserName = "SQL_Auth_Account_For_PSIM";
var sqlPassword = "\"@F%L)Dfhq123asduiop#$577pMg_\"";

var threshold = "3"; 					// number of false alarms classifications to process the OA script further
var hoursBack = "-3"; 					// for this amount of time to look back when doing the SQL query
var timeout = 60000;

if (Event.SourceType == "MACRO" && Event.Action == "RUN" && Event.SourceId == 482) {
    var timestamp = Event.GetParam("date") + " " + Event.GetParam("time");
    var towerId = Event.GetParam("tower");

    if (!empty(towerId)) {

        DebugLogString("Overactive first stage: The tower is: " + towerId)
        var tower_region = GetObjectParam("SIGNALTOWER", towerId, "region_id");

        if (!empty(tower_region)) {

            var zone_triggers = getIndividualZoneTriggersPerRegion(tower_region, towerId);	// getting the zone triggers per tower
            if (!empty(zone_triggers)) {

                DebugLogString(timestamp + " Overactive first stage: tower: " + towerId + ": assigning new overactrive states for zones...");
                assignNewOveractiveStatesPerZone(towerId, zone_triggers);
            }
        }
    }
};

function getIndividualZoneTriggersPerRegion(region_id, tower) {
    if (!empty(region_id) && !empty(tower)) {
        DebugLogString(timestamp + " Overactive first stage: getIndividualZoneTriggersPerRegion(" + region_id + "): getting number of all zone triggers for tower " + tower);

        var query = "\"SET NOCOUNT ON; SELECT c.CC1, c.CC2, c.TC1, c.TC2, c.TC3, c.Door_contact, c.Motion_sensor, c.Vibration1, c.Vibration2, c.Vibration3 from (Select region_id, count(case WHEN param0 LIKE '%CC1%' Then 1 else NULL END) as CC1, count(case WHEN param0 LIKE '%CC2%' Then 1 else NULL END) as CC2, count(case WHEN param0 LIKE '%TC1%' Then 1 else NULL END) as TC1, count(case WHEN param0 LIKE '%TC2%' Then 1 else NULL END) as TC2, count(case WHEN param0 LIKE '%TC3%' Then 1 else NULL END) as TC3, count(case param1 WHEN ' (Zone 001)' Then 1 else NULL END) as Door_contact, count(case param1 WHEN ' (Zone 002)' Then 1 else NULL END) as Motion_Sensor, count(case param1 WHEN ' (Zone 003)' Then 1 else NULL END) as Vibration1, count(case param1 WHEN ' (Zone 004)' Then 1 else NULL END) as Vibration2, count(case param1 WHEN ' (Zone 005)' Then 1 else NULL END) as Vibration3 FROM " + events_db + ".[dbo].[PROTOCOL] WITH (NOLOCK,NOWAIT) where ((objtype = 'CAM_VMDA_DETECTOR' and action = 'ALARM') OR (objtype = 'SIGNALTOWER')) and date >= DATEADD(hour, " + hoursBack + ", GETDATE()) AND region_id = '" + region_id + "' GROUP BY region_id) c where (CC1 > 1 or CC2 > 1 or TC1 > 1 or TC2 > 1 or TC3 > 1 OR Door_contact > 1 OR Motion_Sensor > 1 OR Vibration1 > 1 OR Vibration2 > 1 OR Vibration3 > 1);";
        var cmd = "sqlcmd -U " + sqlUserName + " -P " + sqlPassword + " -S \"" + sqlInstance + "\" -s \"|\" -W -h -1 -Q " + query + "\"";

        DebugLogString(timestamp + " Overactive first stage: getIndividualZoneTriggersPerRegion(" + region_id + "): SQL cmd is " + cmd);

        var run = run_cmd_timeout(cmd, timeout);

        var runTrimmed = run.replace(/(\r\n|\n|\r)/gm, "");
        DebugLogString(timestamp + " Overactive first stage: getIndividualZoneTriggersPerRegion(" + region_id + "): SQL result is " + runTrimmed);

        if (runTrimmed.indexOf("|") == -1) {
            return;
        } else {
            return runTrimmed;
        }
    } else {
        DebugLogString(timestamp + " Overactive first stage: getIndividualZoneTriggersPerRegion(" + region_id + "): region is EMPTY!");
        return;
    }
};

function assignNewOveractiveStatesPerZone(tower, zone_triggers) {
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
                case 5:
                    zone_name = "zone1";
                    break;
                case 6:
                    zone_name = "zone2";
                    break;
                case 7:
                    zone_name = "zone3";
                    break;
                case 8:
                    zone_name = "zone4";
                    break;
                case 9:
                    zone_name = "zone5";
                    break;
                default:
                    zone_name = "";
                    break;
            }

            DebugLogString(timestamp + " Overactive first stage: assignNewOveractiveStatesPerZone(): tower: " + tower + ": DETECTED zone " + zone_name + " triggered " + zone_triggers_splitted[k] + " times");
            changeZoneState(tower, zone_name, "3");
            produceOAEvent(tower, zone_name);
        }
    }
};

function changeZoneState(towerId, zoneId, state) {
    if (!empty(towerId) && !empty(zoneId) && !empty(state)) {
        DebugLogString(timestamp + " Overactive first stage: changeZoneState(" + towerId + "): changing tower ID \"" + towerId + "\" zone \"" + zoneId + "state\" to the state " + state);
        SetObjectParam("SIGNALTOWER", towerId, zoneId + "state", state);		// Setting the zone state here
        SetObjectParam("SIGNALTOWER", towerId, zoneId + "timestamp", timestamp);	// Setting the zone state timestamp here
    }
};

function produceOAEvent(towerId, zoneId) {
    zoneCapitalized = zoneId.toUpperCase();
    DebugLogString(timestamp + " Overactive first stage: produceOAEvent(" + towerId + "," + zoneId + "): generating event: SIGNALTOWER|" + towerId + "|OVERACTIVE_" + zoneCapitalized + "|");
    NotifyEventStr("SIGNALTOWER", towerId, "OVERACTIVE_" + zoneCapitalized, "");
    NotifyEventStr("SIGNALTOWER", towerId, "OVERACTIVE_" + zoneCapitalized, "");
};

function empty(str) {
    if (typeof str == 'undefined' || !str || str.length === 0 || str === "" || !/[^\s]/.test(str) || /^\s*$/.test(str) || str === "") { return true; }
    else { return false; }
};