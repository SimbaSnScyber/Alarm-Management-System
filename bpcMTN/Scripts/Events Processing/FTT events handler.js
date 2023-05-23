// This script should provide FTT ("Failed To Test") events. Basically, if tower is "quiet" (did not sent any events for the last 24h), FTT events shall be generated
// This is needed for maintenance stack to track towers which sent nothing in the last 24h

var instanceName = "NLPAG71,1550";		// MTN SQL Core
var dbName = "PSIM";				// PSIM DB
var sqlUser = "SQL_Auth_Account_For_PSIM";	// auth
var sqlPass = "@F%L)Dfhq123asduiop#$577pMg_";

if (Event.SourceType == "MACRO" && Event.SourceId == 472 && Event.Action == "RUN") 		// MACRO 472 is triggered on timer every day

{
    DebugLogString("FTT script: deleting old FTT events...");
    DoReactStr("INC_SERVER", "1", "UPDATE_STATUS", "status<3>,objtypes<SIGNALTOWER>,actions<FTT>"); // Removing old FTT events. Status = 3 - closed

    DebugLogString("FTT script: getting the list of quiet towers from " + instanceName + " DB " + dbName + "...");
    var quietTowersList = getQuietTowersIds();							// getting the list of quiet towers from MTN SQL PSIM DB
    var towersSplit = quietTowersList.split(",");
    DebugLogString("FTT script: number of quiet towers detected: " + towersSplit.length + ".");

    if (towersSplit.length < 1000) {								// Sanity check. Do not push any events if there are more then 1000 towers (something went wrong?)

        DebugLogString("FTT Script: sanity check succesfull, pushing the FTT events...");

        for (i = 0; i < towersSplit.length - 1; i++) {

            if (!empty(towersSplit[i])) {

                DebugLogString("FTT Script: pushing SIGNALTOWER|" + towersSplit[i] + "|FTT event...");
                NotifyEventStr("SIGNALTOWER", towersSplit[i], "FTT", "");			// Generating the FTT events from the acquired list

            } else {
                DebugLogString("FTT Script: Warning! tower ID is empty " + towersSplit[i]);
            }
        }
    }
};

function getQuietTowersIds() {
    var sqlQuery = "SET DATEFORMAT dmy; SELECT STRING_AGG(id, ',') as quiet_towers FROM [dbo].[OBJ_SIGNALTOWER] WHERE intrusion = '1' AND CAST(last_timestamp as datetime) <= DATEADD(hour, -25, GETDATE())";
    var cmdQuery = "sqlcmd -U \"" + sqlUser + "\" -P \"" + sqlPass + "\" -S \"" + instanceName + "\" -d " + dbName + " -W -h -1 -Q \"SET NOCOUNT ON; " + sqlQuery + "\"";
    DebugLogString("FTT script: getQuietTowersId: the sqlcmd is : " + cmdQuery);
    var execute = run_cmd(cmdQuery);
    DebugLogString("FTT script: getQuietTowersId: the quiet towers result is: " + execute);
    return execute.replace(/(\r\n|\n|\r)/gm, "");
};

function empty(str) {
    if (typeof str == 'undefined' || !str || str.length === 0 || str === "" || !/[^\s]/.test(str) || /^\s*$/.test(str) || str === "") { return true; }
    else { return false; }
};