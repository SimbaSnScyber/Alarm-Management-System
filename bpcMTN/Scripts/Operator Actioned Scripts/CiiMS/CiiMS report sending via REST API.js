// This script is used to send the previously captured and shown to operator data to CiiMS database

// Complete CiiMS payload 15.02.2022:
//{
//  "transactionId": "12095",
//  "sourceIdentifier": "PSIM",
//  "eventDetails": {
//    "uuid": "5D2FD5A2-7578-EC11-8901-F8F21EACDD71",
//   "eventFullTimestamp": "",
//    "siteId": "T2842",
//    "zoneId": "1",
//    "eventType": "U_MOTION_SENSOR",
//    "transmitterId": "6728",
//    "responseDispatched": "2022-01-18 17:45:50.710",
//    "subcontractorDispatched": "MONITOR NET",
//    "responseReferenceNumberReceived": "Yes",
//    "responseReferenceNumber": "222",
//    "acknowledgeDateTime": "",
//    "dispatchDateTime": "",
//    "arrivalDateTime": "444",
//    "category": "NO ACCESS ROAD CONDITION",
//    "discoveryMethod": "ALARM",
//    "reportedBy": "PSIM ALARM",
//    "rootCause": "U_MOTION_SENSOR",
//    "investigatorRequired": "Yes",
//   "investigator": "KAREL BUITENDAG",
//    "reactions": "2022-01-18 17:45:36.000 1.start 0 2022-01-18 17:45:38.000 2.verify 0 2022-01-18 17:45:40.000 3.1.comment_un 0 1232022-01-18 17:45:41.000 4.dispatch_choice_un 0 2022-01-18 17:45:42.000 r24_choice 0 2022-01-18 17:45:43.000 r24_dispatch 0 2022-01-18 17:46:03.000 r24_feedback 0 2022-01-18 17:46:04.000 r24_feedback 1 2022-01-18 17:46:05.000 r24_update 0 2022-01-18 17:46:12.000 r24_update 0 2022-01-18 17:46:20.000 r24_feedback 0 2022-01-18 17:46:21.000 r24_finalize 0 2022-01-18 17:46:23.000 finalize1 0 2022-01-18 17:46:25.000 zone_selection 0 2022-01-18 17:46:27.000 zone_jhb 0 2022-01-18 17:46:28.000 finalize3 0 2022-01-18 17:46:31.000 finalize4 0 2222022-01-18 17:46:38.000 finalize5 0 3332022-01-18 17:46:40.000 finalize6 0 4442022-01-18 17:46:42.000 finalize7 0 2022-01-18 17:46:44.000 investigator_required 0 2022-01-18 17:46:45.000 investigators 0 2022-01-18 17:46:47.000 report_review 0 2022-01-18 17:51:05.000 report_review 0 2022-01-18 17:55:02.000 report_review 0 2022-01-18 17:58:45.000 report_review 0 ",
//    "response24": " Timestamp: Jan 18 2022  5:46PM; State: open; Message: New Request initiated by 123456789 - PSIM - Test Site Timestamp: Jan 18 2022  5:46PM; State: open; Message: New Request initiated by 123456789 - PSIM - Test Site"
//  }
//}

// Variables:
var instanceName = "NLPAG71,1550";
var dbName = "PSIM";
var sqlUser = "SQL_Auth_Account_For_PSIM";
var sqlPass = "@F%L)Dfhq123asduiop#$577pMg_";
var JSON_header = "-H \"Content-type: application/json\"";
var APIKey = "-H \"APIKey: Jjfa6YcRmYbcsqdvrFdTqx3nBiAvFw2pRsC2lz4bi9Ua4wyTxdxarLsenltExpxzmwa1LcItlcifxRmxitFzbmosp5z5kdgvCeMyoSangJntxYcxuqGbpmgofrzSE3Ry\"";
var deviceType = "-H \"DeviceType: AxxonPSIM\"";
var handler = "-H \"Handler: za.co.onlineintelligence.applications.ob.signaltower.webservice.SignalTowerRestServiceRequest\""
var iCryptoEndpoint = "--url \"http://10.80.50.130:8080/CiiMS/web/OAFRestService\""
var endpoint = "--url \"https://soab2besf.mtn.co.za:20260/event-management/enterprise/proxy/api/v1/processed-event\"";
var user = "--user SVC_PSIM_B2BOSB_INVOKE:JvcF9ZNy9BnKyamq";
var environment = "Newlands";

// catching MACRO|2200 events:
if (Event.SourceType == "MACRO" && Event.Action == "RUN" && Event.SourceId == "2200") {

    var slave_id = Event.GetParam("computer");
    var event_uuid = Event.GetParam("event_uuid");

    if (!empty(slave_id) && !empty(event_uuid)) {

        var transaction_id = Event.GetParam("guid_pk").replace(/[{}]/g, "");
        DebugLogString("Sending CiiMS Payload script: catched the IM closure event on workstation " + slave_id + "!");

        var CiiMSDataRaw = getAllDataFromVM(event_uuid);

        var CiiMSDataSplitted = CiiMSDataRaw.split("|");

        var CiiMSPayload = "{\\\"transactionId\\\":\\\"" + transaction_id + "\\\",\\\"sourceIdentifier\\\":\\\"PSIM\\\",\\\"eventDetails\\\":{\\\"uuid\\\":\\\"" + CiiMSDataSplitted[1] + "\\\",\\\"eventFullTimestamp\\\":\\\"" + CiiMSDataSplitted[2] + "\\\",\\\"siteId\\\":\\\"" + CiiMSDataSplitted[3] + "\\\",\\\"zoneId\\\":\\\"" + CiiMSDataSplitted[5] + "\\\",\\\"eventType\\\":\\\"Burglary\\\",\\\"transmitterId\\\":\\\"" + CiiMSDataSplitted[7] + "\\\",\\\"responseDispatched\\\":\\\"" + CiiMSDataSplitted[13] + "\\\",\\\"subcontractorDispatched\\\":\\\"" + CiiMSDataSplitted[10] + "\\\",\\\"responseReferenceNumberReceived\\\":\\\"" + CiiMSDataSplitted[11] + "\\\",\\\"responseReferenceNumber\\\":\\\"" + CiiMSDataSplitted[12] + "\\\",\\\"acknowledgeDateTime\\\":\\\"" + CiiMSDataSplitted[8] + "\\\",\\\"dispatchDateTime\\\":\\\"" + CiiMSDataSplitted[13] + "\\\",\\\"arrivalDateTime\\\":\\\"" + CiiMSDataSplitted[14] + "\\\",\\\"category\\\":\\\"" + CiiMSDataSplitted[15] + "\\\",\\\"discoveryMethod\\\":\\\"" + CiiMSDataSplitted[16] + "\\\",\\\"reportedBy\\\":\\\"" + CiiMSDataSplitted[17] + "\\\",\\\"rootCause\\\":\\\"" + CiiMSDataSplitted[18] + "\\\",\\\"investigatorRequired\\\":\\\"" + CiiMSDataSplitted[19] + "\\\",\\\"investigator\\\":\\\"" + CiiMSDataSplitted[20] + "\\\",\\\"reactions\\\":\\\"" + CiiMSDataSplitted[21] + "\\\",\\\"response24\\\":\\\"" + CiiMSDataSplitted[22] + "\\\"}}";
        DebugLogString("Sending CiiMS Payload script: CiiMS Payload is " + CiiMSPayload);
        var sending = doSendCiiMSReport(CiiMSPayload); // sending the data via cURL here

        if (!empty(sending)) {
            var json = JSON.parse(sending);			// parsing the response
            DebugLogString("Sending CiiMS Payload script: sending a confirmation message to " + slave_id + "; json is: Received status message: " + json.statusMessage + "; Received support message: " + json.supportMessage + ". Sending to " + slave_id);
            if (json.statusCode != 0 && json.statusCode != 102) {			// if there are errors, show a popup
                messageAction("CiiMS notification result of site " + CiiMSDataSplitted[3] + ":\\r\\nReceived status code from MTN SOA: " + json.statusCode + "\\r\\nReceived status message: " + json.statusMessage + "\\r\\nReceived support message: " + json.supportMessage + "", slave_id);
            }
        } else {
            messageAction("CiiMS notification result of site " + CiiMSDataSplitted[3] + ":\\r\\n Message was not sent!\\r\\n Technical data: variable is \"" + sending + "\"", slave_id);
        }
    }
};

function doSendCiiMSReport(data) {
    var execution_string = "curl " + JSON_header + " " + APIKey + " " + handler + " " + deviceType + " " + endpoint + " " + user + " --data \"" + data + "\"";
    DebugLogString("Sending CiiMS Payload script::doSendCiiMSReport: the commandline is: " + execution_string);
    var run = run_cmd_timeout(execution_string, 23000);
    DebugLogString("Sending CiiMS Payload script::doSendCiiMSReport: the execution of CiiMS sending is: " + run);
    run2 = run.replace(/(\r\n|\n|\r)/gm, "")
    return run2;
    //return run2.replace(/[|&;$%@"<>()+,]/g, "");
};

function getAllDataFromSQLCore(event_uuid) {
    var cmd = "sqlcmd -U \"" + sqlUser + "\" -P \"" + sqlPass + "\" -S \"" + instanceName + "\" -d " + dbName + " -W -h -1 -s \"|\" -Q \"SET NOCOUNT ON;";
    var sqlQuery = "SELECT TOP 1 * FROM [dbo].[ciims_messages] WHERE uuid = '" + event_uuid + "' ORDER by sent_timestamp DESC;\"";
    var execution = cmd + " " + sqlQuery;
    DebugLogString("Sending CiiMS Payload script::getAllDataFromSQLCore: the cmd is: " + execution);
    var run = run_cmd_timeout(execution, 12000);
    DebugLogString("Sending CiiMS Payload script::getAllDataFromSQLCore: the execution result is: " + run);
    return run.replace(/(\r\n|\n|\r)/gm, "");
};

function getAllDataFromVM(event_uuid) {
    var sqlQuery = "SELECT TOP 1 * FROM [dbo].[ciims_messages] WHERE uuid = '" + event_uuid + "' ORDER by sent_timestamp DESC;\"";
    var cmd = "sqlcmd -U \"PSIM\" -P \"Intellect_default_DB_4\" -S \"10.80.50.132\\PSIM_VDB,1550\" -d custom_db -W -h -1 -s \"|\" -Q \"SET NOCOUNT ON;";
    var executionTwo = cmd + " " + sqlQuery;
    DebugLogString("Sending CiiMS Payload script::getAllDataFromVM: the cmd is: " + executionTwo);
    var run = run_cmd_timeout(executionTwo, 12000);
    DebugLogString("Sending CiiMS Payload script::getAllDataFromVM: the execution result is: " + run);
    return run.replace(/(\r\n|\n|\r)/gm, "");
};

function messageAction(msg, slave) {
    var cmd = "mshta \"javascript:var sh=new ActiveXObject( 'WScript.Shell' ); sh.Popup( '" + msg + "', 60, 'CiiMS notification', 4096 );close()\"";
    DoReactStr("SLAVE", slave, "CREATE_PROCESS", "command_line<" + cmd + ">");
};

function getHostNameFromOperatorSteps(step_string) {
    var message_split = step_string.split("slave_id<");
    var slave = message_split[1].split(">,");
    return slave[0];
};

function getStepName(step_string) {
    var message_split = step_string.split("control_id<");
    var step_name = message_split[1].split(">,");
    return step_name[0];
};

function getGuidOfSourceEvent(step_string) {
    var message_split = step_string.split("guid_pk<");
    var guid = message_split[1].split(">,");
    return guid[0];
};

function empty(str) {
    if (typeof str == 'undefined' || !str || str.length === 0 || str === "" || !/[^\s]/.test(str) || /^\s*$/.test(str) || str.replace(/\s/g, "") === "") { return true; }
    else { return false; }
};