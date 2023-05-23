// This script checks for recent events of the same SignalTower but different zones. if they are present, the new Multi-zone trigger will be generated.
// Last edited 26-04-2022 by Anton

// MTN SQL PSIM DB endpoins (Prod):
var instanceName = "NLPAG71,1550";
var dbName = "PSIM";
var sqlUser = "SQL_Auth_Account_For_PSIM";
var sqlPass = "@F%L)Dfhq123asduiop#$577pMg_";

// Local DB endpoints (for debugging):
//var instanceName = ".\\SQLEXPRESS2014";
//var dbName = "intellect3";
//var sqlUser = "sa";
//var sqlPass = "Intellect_default_DB_4";

var timeToLookBack = "-30"; // time in seconds on how far back to look for events from the same tower but different zone
var timerForSQLQuery = 5000; // timeout in milliseconds for SQL query. If exceeded, the query will not be completed (hint: check SQL performance)

// triggering on "Burglary" events of all 5 zones:
if (Event.SourceType == "SIGNALTOWER" && (Event.Action == "U_DOOR_CONTACT" || Event.Action == "U_MOTION_SENSOR" || Event.Action == "U_VIBRATION_SENSOR_F" || Event.Action == "U_VIBRATION_SENSOR_S" || Event.Action == "U_VIBRATION_SENSOR_T")) {

    var towerState = GetObjectState("SIGNALTOWER", Event.SourceId);

    var cmdToExecute = "sqlcmd -U \"" + sqlUser + "\" -P \"" + sqlPass + "\" -S \"" + instanceName + "\" -d " + dbName + " -W -h -1 -Q \"SET NOCOUNT ON; SELECT count([param1]) FROM [dbo].[PROTOCOL] WITH (NOLOCK,NOWAIT) WHERE [objtype] = 'SIGNALTOWER' AND [objid] = '" + Event.SourceId + "' AND ([action] = 'U_MOTION_SENSOR' OR [action] = 'U_DOOR_CONTACT' OR [action] = 'U_VIBRATION_SENSOR_F' OR [action] = 'U_VIBRATION_SENSOR_S' OR [action] = 'U_VIBRATION_SENSOR_T')  AND [param1] != '" + Event.GetParam("param1") + "' AND [date] > DATEADD(second, " + timeToLookBack + ",  GETDATE());\"";
    //DebugLogString(cmdToExecute);
    var executing = run_cmd_timeout(cmdToExecute, timerForSQLQuery); // executing sqlcmd to get count of events of all zones EXCEPT the triggered one
    var trimmedOut = executing.replace(/(\r\n|\n|\r)/gm, "");	// replacing /r/n symbols from the sqlcmd outptut
    DebugLogString("Multi-Zone trigger script: tower " + Event.SourceId + " has this number of events in last 35 seconds: " + trimmedOut + ". The state of tower is " + towerState);
    var triggersCountInt = parseInt(trimmedOut); // paring Int from string

    if ((triggersCountInt > 0) && (towerState == "" || towerState == "NORMAL")) { // if tower state is normal or empty AND number of events is 1 or more, generate a Multi-Zone tower event
        DebugLogString("Multi-Zone trigger script: generating event of Multi-Zone trgger on site " + Event.SourceId);
        NotifyEventStr("SIGNALTOWER", Event.SourceId, "MULTI_ZONE", "siteId<" + Event.SourceId + ">,param1<" + Event.GetParam("param1") + ">,param3<" + Event.GetParam("param3") + ">,region_id<" + GetObjectParam("SIGNALTOWER", Event.SourceId, "region_id") + ">,tier<" + GetObjectParam("SIGNALTOWER", Event.SourceId, "tier") + ">"); // generating MultiZone event here
    }
};