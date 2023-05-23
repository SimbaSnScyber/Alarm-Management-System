
var instanceNameNL01 = "NLPAG71,1550";		// MTN SQL core - some of the data is being gathered from there
var sqlUserNL01 = "SQL_Auth_Account_For_PSIM";
var sqlPassNL01 = "@F%L)Dfhq123asduiop#$577pMg_";
var dbNameNL01PSIM = "PSIM" // DB name where

var instanceNameFL01 = "10.245.39.101\\SQLEXPRESS2014";		// IP address of FL01\Instance name of the DB
var sqlUserFL01 = "PSIM";
var sqlPassFL01 = "\"YSPW7509-sywj!#O%&\"";
var dbNameFL01Dataservice = "dataservice" // DB name where

if (Event.SourceType == "TIMER" && Event.SourceId == "11" && Event.Action == "TRIGGER") {
    var eventGuidArray = getEventGuidOlderThan12Hours()
    for (let i = 0; i < eventGuidArray.length; i++) {
        var eventGuid = eventGuidArray[i];
        var operatorInfo = getOperatorInfoFromGuid(eventGuid);
        var userID = operatorInfo[0];
        var userName = getUserNameFromID(userID);
        var computerID = operatorInfo[1];
        var siteID = operatorInfo[2];
        var dispatchTime = operatorInfo[3].substr(0, 15);

        var message = userName + " (UserID: " + userID + ") on " + computerID + " did not close the R24 dispatch for Site: " + siteID;
        var computerDM = "BTS10"; // The ID of the Duty Manager's PC is BTS10 at the time of writing this script

        if (!empty(Itv_var("T" + siteID + "_r24_openDispatch"))) {
            DoReactStr("MACRO", 1002, "RUN", "number<" + siteID + ">,computer<" + computerID + ">");
            messageAction(message, computerDM);
        }
    }
};

function empty(str) {
    if (typeof str == 'undefined' || !str || str.length === 0 || str === "" || !/[^\s]/.test(str) || /^\s*$/.test(str) || str === "") { return true; }
    else { return false; }
};

function messageAction(msg, slave) {
    var cmd = "mshta \"javascript:var sh=new ActiveXObject( 'WScript.Shell' ); sh.Popup( '" + msg + "', 10, 'Warning', 64 );close()\"";
    DoReactStr("SLAVE", slave, "CREATE_PROCESS", "command_line<" + cmd + ">");
}

// Get events older than 12 hours within the week that have had an R24 dispatch
function getEventGuidOlderThan12Hours() {
    var cmd = "sqlcmd  -U \"" + sqlUserFL01 + "\" -P \"" + sqlPassFL01 + "\" -S \"" + instanceNameFL01 + "\" -d " + dbNameFL01Dataservice + " -W -h -1 -s \" \" -Q \"SET NOCOUNT ON;";
    var sqlQuery = "SELECT distinct event_guid FROM [dbo].[operator_action] WHERE parent_control_id = 'r24_dispatch' and ack_timestamp >= DATEADD(hour, -12, GETDATE()) and ack_timestamp >= DATEADD(day, -7, GETDATE())";
    var execution = cmd + " " + sqlQuery;
    DebugLogString("R24 Autoclose Dispatch: getEventGuidFrom24Hours: the cmd for event_guids from past 24 hours: " + execution);
    var run = run_cmd_timeout(execution, 11000);
    DebugLogString("R24 Autoclose Dispatch: getEventGuidFrom24Hours: the result for event_guids from past 24 hours: " + run);
    run.replace(/(\r\n|\n|\r)/gm, " ");
    return run.split(" ");
};

// Get the userID, slaveID (Computer Name, eg. BTS09) and siteID
function getOperatorInfoFromGuid(guid) {
    var cmd = "sqlcmd  -U \"" + sqlUserFL01 + "\" -P \"" + sqlPassFL01 + "\" -S \"" + instanceNameFL01 + "\" -d " + dbNameFL01Dataservice + " -W -h -1 -s \" \" -Q \"SET NOCOUNT ON;";
    var sqlQuery = "SELECT TOP(1) userid, slave_id, siteID, ack_timestamp FROM [dbo].[operator_action] WHERE event_guid = '" + guid + "'";
    var execution = cmd + " " + sqlQuery;
    DebugLogString("R24 Autoclose Dispatch: getSiteIdFromGuid: the cmd for siteID : " + execution);
    var run = run_cmd_timeout(execution, 11000);
    DebugLogString("R24 Autoclose Dispatch: getSiteIdFromGuid: the result for siteID: " + run);
    run.replace(/(\r\n|\n|\r)/gm, " ");
    return run.split(" ")
};

// Get the name of the operator from the user ID
function getUserNameFromID(userID) {
    var cmd = "sqlcmd  -U \"" + sqlUserNL01 + "\" -P \"" + sqlPassNL01 + "\" -S \"" + instanceNameNL01 + "\" -d " + dbNameNL01PSIM + " -W -h -1 -s \" \" -Q \"SET NOCOUNT ON;";
    var sqlQuery = "select CONCAT([dbo].[OBJ_PERSON].[surname], ' ',  [dbo].[OBJ_PERSON].[name]) FROM [dbo].[OBJ_PERSON] where id ='" + userID + "'";
    var execution = cmd + " " + sqlQuery;
    DebugLogString("R24 Autoclose Dispatch: getUserNameFromID: the cmd for userInfo : " + execution);
    var run = run_cmd_timeout(execution, 11000);
    DebugLogString("R24 Autoclose Dispatch: getUserNameFromID: the result for userInfo: " + run);
    return run.replace(/(\r\n|\n|\r)/gm, "");
};