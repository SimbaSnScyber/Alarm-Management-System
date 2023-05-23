// This script shows the Custom CiiMS webpage

var instanceName = "NLPAG71,1550";		// MTN SQL core - some of the data is being gathered from there
var dbName = "PSIM";				// 
var sqlUser = "SQL_Auth_Account_For_PSIM";
var sqlPass = "@F%L)Dfhq123asduiop#$577pMg_";
var CiiMS_operator_step = "report_review";	// name of IM workflow step which will trigger the script execution
var CiiMS_operator_step_final = "final_report_review";	// name of IM workflow step which will trigger the script execution

// Catching the MACRO|2201 events:
if (Event.SourceType == "MACRO" && Event.Action == "RUN" && Event.SourceId == "2201") {

    var slave = Event.GetParam("computer");
    var full_event = Event.GetParam("full_event");

    switch (slave) {
        case "BTS01":
            opcieId = [43];
            not_found = false;
            break;
        case "BTS02":
            opcieId = [44];
            not_found = false;
            break;
        case "BTS03":
            opcieId = [47];
            not_found = false;
            break;
        case "BTS04":
            opcieId = [50];
            not_found = false;
            break;
        case "BTS05":
            opcieId = [53];
            not_found = false;
            break;
        case "BTS06":
            opcieId = [56];
            not_found = false;
            break;
        case "BTS07":
            opcieId = [59];
            not_found = false;
            break;
        case "BTS08":
            opcieId = [62];
            not_found = false;
            break;
        case "BTS09":
            opcieId = [7, 97, 115];
            not_found = false;
            break;
        case "BTS10":
            opcieId = [69];
            not_found = false;
            break;
        case "BTS11":
            opcieId = [74, 75, 76, 77, 78];
            not_found = false;
            break;
        case "BTS12":
            opcieId = [79, 80, 81, 82];
            not_found = false;
            break;
        case "BTSWALL1":
            opcieId = [45];
            not_found = false;
            break;
        default:
            opcieId = [9998];
            not_found = true;
            break;
    }

    if (!not_found) {		// if interface has been found
        DebugLogString("CiiMS custom page script: computer " + slave + ": displaying CiiMS custom HTML page...");


        var json = JSON.parse(full_event);	// parsing JSON from the previous variable

        var region_id = json.rows[0].Region.Id;
        var siteId = GetObjectIdByParam("SIGNALTOWER", "region_id", region_id);	// siteID

        var source_event = json.rows[0].SourceMsgBase64;
        var SourceMsgBase64_b64_decoded = Base64Decode(source_event, 0);
        var SourceMsgSplit = SourceMsgBase64_b64_decoded.split("|");
        var objectType = SourceMsgSplit[0];		// src_objtype
        var objectId = SourceMsgSplit[1];		// src_objid
        var eventType = SourceMsgSplit[2];		// src_action

        var event_uuid = getGuidOfSourceEvent(SourceMsgBase64_b64_decoded).replace(/[{}]/g, ""); // event_guid

        var eventFullTimestamp = getSourceAlertTimestamp(SourceMsgBase64_b64_decoded); // alert_timestamp
        var timestampSplit = eventFullTimestamp.split(" ");
        var eventDate = timestampSplit[0];					// eventDate
        var eventTime = timestampSplit[1];					// eventTime

        switch (objectType) {
            case "SIGNALTOWER":
                var rootCause = "SIGNAL TOWER – UNAUTHORIZED INTRUSION";
                break;
            case "CAM_VMDA_DETECTOR":
                var eventType = "VVS";
                var rootCause = "VVS - MOTION";						// rootCause
                break;
            default:
                var eventType = "unknown";
                var rootCause = "unknown";
        }

        var sitePriority = GetObjectParam("SIGNALTOWER", siteId, "tier");	// sitePriority
        var siteState = GetObjectState("SIGNALTOWER", siteId);		// siteState

        if (empty(siteState)) {
            siteState = "NORMAL";
        }

        var popTime = GetObjectParam("SIGNALTOWER", siteId, "response_time");		// POP time
        var siteRegionName = GetObjectName("REGION", region_id);				// regionName
        var siteiCryptoRef = GetObjectParam("SIGNALTOWER", siteId, "icrypto");		// siteiCryptoRef
        var transmitter = GetObjectParam("SIGNALTOWER", siteId, "transmitter");
        var siteR24ManualDispatchTime = getR24ManualTimeStamp(siteId); //Manual R24 Timestamp

        if (empty(siteiCryptoRef)) {
            siteiCryptoRef = "None";
        }

        var siteiCryptoPhone = Itv_var(siteId + "msisdn");			// siteiCryptoPhone

        if (empty(siteiCryptoPhone)) {
            siteiCryptoPhone = "None";
        }
        if (Itv_var("T" + siteId + "_r24_manual") == "1") {
            //Manual dispatch was chosen in IM!
            var siteR24DispatchTime = siteR24ManualDispatchTime;
            var siteR24Updates = getManualDispatchOutcome(siteId);
        } else {
            //R24 dispatch was chosen in IM!
            var siteR24DispatchTime = getR24DispatchTimestamp(siteId);
            DebugLogString("Site " + siteId + " dispatch time: " + siteR24DispatchTime);

            if (empty(siteR24DispatchTime)) {
                siteR24DispatchTime = siteR24ManualDispatchTime;
            }
            var siteR24Updates = getR24DispatchUpdates(siteId);

            if (empty(siteR24Updates)) {
                siteR24Updates = "R24 dispatched by operator:" + siteR24ManualDispatchTime;
            }
        }

        var siteCameras = getCamerasFromRegion(region_id);			// siteCameras
        var userId = json.rows[0].Assignee.Id;						// userId
        var userName = GetObjectName("PERSON", userId);				// userName
        DebugLogString("CiiMS custom page script: username " + userName);

        var processedTime = Event.GetParam("time");				// processedTime
        var processedDate = Event.GetParam("date");				// processedDate

        var refNo = getResponseReferenceNumber(siteId, event_uuid);
        if (empty(refNo)) {
            refNo = "Not applicable";
        }
        DebugLogString("CiiMS custom page script: Reference Number " + refNo);                       //responseReferenceNumber

        var investigatorsRequired = getInvestigatorsRequired(siteId);
        DebugLogString("CiiMS custom page script: Investigators Required: " + investigatorsRequired);              //investigators Required

        var investigators = getInvestigators(siteId);
        DebugLogString("CiiMS custom page script: Investigators: " + investigators);              //investigators

        var category = getDataFromStepName("finalize7", siteId); 	// category
        DebugLogString("CiiMS custom page script: Is category empty? " + empty(category));
        if (empty(category)) {
            category = getDataFromStepName("manual_finalize7", siteId);
        }
        DebugLogString("CiiMS custom page script: Category is " + category);

        var acknowledge_timestamp = getAcknowledgeTimestamp(event_uuid);		// acknowledge timestamp

        var subcontractors = getSubcontractors(siteId);			// subcontractors
        DebugLogString("CiiMS custom page script: Subcotractors are " + subcontractors);

        if (Itv_var("T" + siteId + "_r24_manual") == "1") {
            //Manual dispatch was chosen in IM!
            var arrivalTime = getArrirvalDateTime(siteId);
        } else {
            //R24 dispatch was chosen in IM!
            var siteR24ArrivalTime = getR24DispatchArrival(siteId);
            DebugLogString("CiiMS custom page script: Site " + siteId + " dispatch arrival time: " + siteR24ArrivalTime);
            var arrivalTime = siteR24ArrivalTime;

            if (empty(siteR24ArrivalTime)) {
                arrivalTime = "R24 Responder did not arrive!";
            }
        }
        DebugLogString("CiiMS custom page script: Arrival Time: " + arrivalTime);

        var operatorActions = getOperatorActions2(event_uuid);               //operator actions
        DebugLogString("CiiMS custom page script: Operator Actions: " + operatorActions);

        var operatorActionsToCiims = getOperatorActionsToSendToCiims(event_uuid);
        DebugLogString("CiiMS custom page script: Operator Actions to CiiMs: " + operatorActionsToCiims);

        for (k = 0; k < opcieId.length; k++) {				// sending the captured data to the CiiMS page by calling OPCIE|FUNC with function inside the page to display the data
            DoReactStr("OPCIE", opcieId[k], "FUNC", "func_name<setAllInfo>,eventUuid<" + event_uuid + ">,eventFullTimestamp<" + eventFullTimestamp + ">,eventDate<" + eventDate + ">,eventTime<" + eventTime + ">,eventType<" + eventType + ">,siteId<" + siteId + ">,sitePriority<" + sitePriority + ">,siteState<" + siteState + ">,regionName<" + siteRegionName + ">,siteiCryptoRef<" + siteiCryptoRef + ">,siteiCryptoPhone<" + siteiCryptoPhone + ">,siteR24Timestamp<" + siteR24DispatchTime + ">,siteR24Outcome<" + siteR24Updates + ">,responseReferenceNumber<" + refNo + ">,siteCameras<" + siteCameras + ">,interfaceName<" + slave + " Live>,computerName<" + slave + ">,userId<" + userId + ">,userName<" + userName + ">,investigator<" + investigators + ">,processedTime<" + processedTime + ">,processedDate<" + processedDate + ">,arrirvalDateTime<" + arrivalTime + ">,category<" + category + ">,subcontractorDispatched<" + subcontractors + ">,transmitterId<" + transmitter + ">,operatorActions<" + operatorActionsToCiims + ">");
            DebugLogString("CiiMS custom page script: sending data to " + opcieId[k]);
            DebugLogString("CiiMS custom page script: DoReactStr(\"OPCIE\"," + opcieId[k] + ",\"FUNC\",\"func_name<setAllInfo>,eventUuid<" + event_uuid + ">,eventFullTimestamp<" + eventFullTimestamp + ">,eventDate<" + eventDate + ">,eventTime<" + eventTime + ">,eventType<" + eventType + ">,siteId<" + siteId + ">,sitePriority<" + sitePriority + ">,siteState<" + siteState + ">,regionName<" + siteRegionName + ">,siteiCryptoRef<" + siteiCryptoRef + ">,siteiCryptoPhone<" + siteiCryptoPhone + ">,siteR24Timestamp<" + siteR24DispatchTime + ">,siteR24Outcome<" + siteR24Updates + ">,responseReferenceNumber<" + refNo + ">,siteCameras<" + siteCameras + ">,interfaceName<" + slave + " Live>,computerName<" + slave + ">,userId<" + userId + ">,userName<" + userName + ">,investigator<" + investigators + ">,processedTime<" + processedTime + ">,processedDate<" + processedDate + ">,arrirvalDateTime<" + arrivalTime + ">,category<" + category + ">,subcontractorDispatched<" + subcontractors + ">,transmitterId<" + transmitter + ">,operatorActions<" + operatorActionsToCiims + ">)");
        }
        // Inserting the captured data both to BPC database and to MTN databases:
        doInsertCiiMStoBPCDatabase(event_uuid, eventFullTimestamp, siteId, popTime, "1", eventType, transmitter, acknowledge_timestamp, subcontractors, refNo, siteR24DispatchTime, arrivalTime, category, rootCause, investigators, operatorActions, siteR24Updates, "");
        doInsertCiiMStoMTNDatabase(event_uuid, eventFullTimestamp, siteId, popTime, "1", eventType, transmitter, acknowledge_timestamp, subcontractors, refNo, siteR24DispatchTime, arrivalTime, category, rootCause, investigators, operatorActions, siteR24Updates, "");
    }
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

function getControlTypeFromStep(step_string) {
    var message_split = step_string.split("control_type<");
    var control_type = message_split[1].split(">,");
    return control_type[0];
};

function getTimestampFromStep(step_string) {
    var message_split = step_string.split("timestamp<");
    var step_timestamp = message_split[1].split(">,");
    return step_timestamp[0];
};

function getGuidOfSourceEvent(step_string) {
    var message_split = step_string.split("guid_pk<");
    var guid = message_split[1].split(">,");
    return guid[0];
};

function getSourceAlertTimestamp(step_string) {
    var message_split1 = step_string.split("date<");
    var dateSplit = message_split1[1].split(">,");
    var date = dateSplit[0];
    var split = date.split("-");
    var newDate = "20" + split[2] + "-" + split[1] + "-" + split[0];
    var newDate2 = newDate.replace(/[<>]/g, "")
    var message_split2 = step_string.split(",time<");
    var timeSplit = message_split2[1].split(">,");
    var time = timeSplit[0];
    return newDate2 + " " + time
};

function getCommentTextFromOperatorStep(step_string) {
    var message_split = step_string.split("edit_text<");
    var text = message_split[1].split(">,");
    return text[0].replace(/[<>]/g, "");
};

function getR24DispatchUpdates(tower) {
    var cmd = "sqlcmd -U \"" + sqlUser + "\" -P \"" + sqlPass + "\" -S \"" + instanceName + "\" -W -h -1 -s \"; \" -Q \"SET NOCOUNT ON;";
    var sqlQuery = "SELECT CONCAT(date, ';' ,param1, ';' ,param2) + '|' FROM (SELECT date,param1,param2 FROM " + dbName + ".[dbo].[PROTOCOL] WHERE objtype = 'SIGNALTOWER' AND objid = '" + tower + "' AND action = 'R24_INFO' AND date >= DATEADD(hour, -3, GETDATE()) AND param1 != '' ) h order by date ASC\"";
    var execution = cmd + " " + sqlQuery;
    DebugLogString("CiiMS custom page script: getR24DispatchUpdates: the cmd for R24 updates gathering: " + execution);
    var run = run_cmd_timeout(execution, 11000);
    DebugLogString("CiiMS custom page script: getR24DispatchUpdates: the result of R24 updates gathering: " + run);
    return run.replace(/(\r\n|\n|\r)/gm, "");
};

function getR24DispatchTimestamp(tower) {
    var cmd = "sqlcmd -U \"" + sqlUser + "\" -P \"" + sqlPass + "\" -S \"" + instanceName + "\" -W -h -1 -s \"|\" -Q \"SET NOCOUNT ON;";
    var sqlQuery = "SELECT TOP 1 date FROM " + dbName + ".[dbo].[PROTOCOL] WHERE objtype = 'SIGNALTOWER' AND objid = '" + tower + "' AND date >= DATEADD(hour, -3, GETDATE()) AND action = 'R24_DISPATCH' order by date DESC\"";
    var execution = cmd + " " + sqlQuery;
    DebugLogString("CiiMS custom page script: getR24DispatchTimestamp: the cmd for R24 dispatch time gathering: " + execution);
    var run = run_cmd_timeout(execution, 11000);
    DebugLogString("CiiMS custom page script: getR24DispatchTimestamp: the result of R24 dispatch time gathering: " + run);
    return run.replace(/(\r\n|\n|\r)/gm, "");
};

function getR24DispatchArrival(tower) {
    var cmd = "sqlcmd -U \"" + sqlUser + "\" -P \"" + sqlPass + "\" -S \"" + instanceName + "\" -W -h -1 -s \"; \" -Q \"SET NOCOUNT ON;";
    var sqlQuery = "SELECT TOP 1 date FROM " + dbName + ".[dbo].[PROTOCOL] WHERE objtype = 'SIGNALTOWER' AND objid = '" + tower + "' AND action = 'R24_INFO' AND date >= DATEADD(hour, -3, GETDATE()) AND param1 = 'responderOnSite' ORDER BY date DESC\"";
    var execution = cmd + " " + sqlQuery;
    DebugLogString("CiiMS custom page script: getR24DispatchArrival: the cmd for R24 arrival gathering: " + execution);
    var run = run_cmd_timeout(execution, 11000);
    DebugLogString("CiiMS custom page script: getR24DispatchArrival: the result of R24 arrival gathering: " + run);
    return run.replace(/(\r\n|\n|\r)/gm, "");
};

function getR24ManualTimeStamp(tower) {
    var cmd = "sqlcmd -U \"PSIM\" -P \"YSPW7509-sywj!#O%&\" -S \"10.245.39.101\\SQLEXPRESS2014\" -W -h -1 -s \"|\" -Q \"SET NOCOUNT ON;";
    var sqlQuery = "SELECT Top 1 dateadd(HOUR, 2, ack_timestamp) as ack_timestamp FROM [dataservice].[dbo].[operator_action] WHERE siteID = '" + tower + "' AND parent_control_id = 'r24_choice' order by ack_timestamp desc\"";
    var execution = cmd + " " + sqlQuery;
    DebugLogString("CiiMS custom page script: getManualR24TimeStamp: The cmd is: " + execution);
    var run = run_cmd_timeout(execution, 11000);
    DebugLogString("CiiMS custom page script: getManualR24TimeStamp The result is: " + run);
    return run.replace(/(\r\n|\n|\r)/gm, "");
};

/*
function displayHTMLpage(opcie) {
DoReactStr("OPCIE",opcie,"ENABLE","");
var htmlPage = GetObjectChildIds("OPCIE",opcie,"OPCIEPAGE");
DoReactStr("OPCIEPAGE",htmlPage,"ENABLE","");
DebugLogString("CiiMS custom page script: CiiMS custom page script: enabling opcie object "+opcie+"...");
};
*/
/*
function displayHTMLpage2(opcie) {
DebugLogString("CiiMS report HTML page script: displayHTMLpage2: enabling opcie object "+opcie+" via CORE|UPDATE_OBJECT...");
NotifyEventStr("CORE","","UPDATE_OBJECT","objtype<OPCIE>,objid<"+opcie+">,y<0>,x<0>,w<100>,h<100>,monitor<1>,topmost<1>");
};
*/
function getResponseReferenceNumber(tower, uuid) {
    var cmd = "sqlcmd -U \"PSIM\" -P \"YSPW7509-sywj!#O%&\" -S \"10.245.39.101\\SQLEXPRESS2014\" -W -h -1 -s \"|\" -Q \"SET NOCOUNT ON;";
    var sqlQuery = "SELECT Top 1 edit_text FROM [dataservice].[dbo].[operator_action] WHERE siteID = '" + tower + "' AND event_guid = '" + uuid + "' AND (parent_control_id = 'finalize4' OR parent_control_id = 'manual_finalize4') order by ack_timestamp desc\"";
    var execution = cmd + " " + sqlQuery;
    DebugLogString("CiiMS custom page script: getResponseReferenceNumber: The cmd is: " + execution);
    var run = run_cmd_timeout(execution, 11000);
    DebugLogString("CiiMS custom page script: getResponseReferenceNumber The result is: " + run);
    return run.replace(/(\r\n|\n|\r)/gm, "");
};

function getArrirvalDateTime(tower) {
    var cmd = "sqlcmd -U \"PSIM\" -P \"YSPW7509-sywj!#O%&\" -S \"10.245.39.101\\SQLEXPRESS2014\" -W -h -1 -s \"|\" -Q \"SET NOCOUNT ON;";
    var sqlQuery = "SELECT Top 1 edit_text FROM [dataservice].[dbo].[operator_action] WHERE siteID = '" + tower + "' AND parent_control_id = 'finalize6' order by ack_timestamp desc\"";
    var execution = cmd + " " + sqlQuery;
    DebugLogString("CiiMS custom page script: The cmd for Operators Action: " + execution);
    var run = run_cmd_timeout(execution, 11000);
    DebugLogString("CiiMS custom page script: The result of Operators Action: " + run);
    return run.replace(/(\r\n|\n|\r)/gm, "");
};

function getManualDispatchOutcome(tower) {
    var cmd = "sqlcmd -U \"PSIM\" -P \"YSPW7509-sywj!#O%&\" -S \"10.245.39.101\\SQLEXPRESS2014\" -W -h -1 -s \"|\" -Q \"SET NOCOUNT ON;";
    var sqlQuery = "SELECT Top 1 edit_text FROM [dataservice].[dbo].[operator_action] WHERE siteID = '" + tower + "' AND parent_control_id = 'dispatch_outcome' order by ack_timestamp desc\"";
    var execution = cmd + " " + sqlQuery;
    DebugLogString("CiiMS custom page script: getManualDispatchOutcome: The cmd for Manual Dispatch Outcome is: " + execution);
    var run = run_cmd_timeout(execution, 11000);
    DebugLogString("CiiMS custom page script: getManualDispatchOutcome: The result Manual Dispatch Outcome is: " + run);
    return run.replace(/(\r\n|\n|\r)/gm, "");
};

function getInvestigators(tower) {
    var cmd = "sqlcmd  -U \"PSIM\" -P \"YSPW7509-sywj!#O%&\" -S \"10.245.39.101\\SQLEXPRESS2014\" -d dataservice -W -h -1 -s \"|\" -Q \"SET NOCOUNT ON;";
    var sqlQuery = "declare @Investigator int; SET @Investigator = (SELECT TOP 1 child_control_id_0 FROM operator_action WHERE siteId = '" + tower + "' AND parent_control_id = 'investigators' AND ack_timestamp >= DATEADD(hour, -5, GETDATE()) ORDER by ack_timestamp DESC); SELECT g.content_value FROM (SELECT ROW_NUMBER() OVER (ORDER BY (SELECT 1)) AS rownumber, right(value,len(value)-1) as content_value FROM STRING_SPLIT((SELECT SUBSTRING(h.content0, 0, CHARINDEX('>,', h.content0)) as content FROM (SELECT TOP 1 (SUBSTRING(control_descr, CHARINDEX('combo.content.0', control_descr) + 17, LEN(convert(varchar(MAX), control_descr)))) as content0 FROM [psim].[dbo].[OBJ_INC_SERVER_PROCESSOR_CTRLS] WHERE control_id = 'investigators') h), '\\')) g WHERE rownumber = @Investigator\"";
    var execution = cmd + " " + sqlQuery;
    DebugLogString("CiiMS custom page script: The cmd for Investigator: " + execution);
    var run = run_cmd_timeout(execution, 11000);
    DebugLogString("CiiMS custom page script: The result of Investigators: " + run);
    if (empty(run)) {
        return "Not applicable";
    } else {
        return run.replace(/(\r\n|\n|\r)/gm, "");
    }
};

function getInvestigatorsRequired(tower) {
    var cmd = "sqlcmd  -U \"PSIM\" -P \"YSPW7509-sywj!#O%&\" -S \"10.245.39.101\\SQLEXPRESS2014\" -d dataservice -W -h -1 -s \"|\" -Q \"SET NOCOUNT ON;";
    var sqlQuery = "declare @Investigator int; SET @Investigator = (SELECT TOP 1 child_control_id_0 FROM operator_action WHERE siteId = '" + tower + "' AND parent_control_id = 'investigators' AND ack_timestamp >= DATEADD(hour, -5, GETDATE()) ORDER by ack_timestamp DESC); SELECT g.content_value FROM (SELECT ROW_NUMBER() OVER (ORDER BY (SELECT 1)) AS rownumber, right(value,len(value)-1) as content_value FROM STRING_SPLIT((SELECT SUBSTRING(h.content0, 0, CHARINDEX('>,', h.content0)) as content FROM (SELECT TOP 1 (SUBSTRING(control_descr, CHARINDEX('combo.content.0', control_descr) + 17, LEN(convert(varchar(MAX), control_descr)))) as content0 FROM [psim].[dbo].[OBJ_INC_SERVER_PROCESSOR_CTRLS] WHERE control_id = 'investigators') h), '\\')) g WHERE rownumber = @Investigator\"";
    var execution = cmd + " " + sqlQuery;
    DebugLogString("CiiMS custom page script: The cmd for Investigator: " + execution);
    var run = run_cmd_timeout(execution, 11000);
    DebugLogString("CiiMS custom page script: The result of Investigators: " + run);
    if (empty(run)) {
        return "No";
    } else {
        return "Yes";
    }
};


/*
function getOperatorActions(user){
    var cmd = "sqlcmd  -U \"sa\" -P \"Intellect_default_DB_4\" -S \"10.245.39.101\\SQLEXPRESS2014\" -d dataservice -W -h -1 -s \"|\" -Q \"SET NOCOUNT ON;";
    var sqlQuery = "declare @Operator uniqueidentifier; SET @Operator = (select top 1 id from incidents where user_id = '"+user+"' ORDER by timestamp DESC); select  line_descr, line_action, line_timestamp from incident_handling where incident_id = @Operator order by line_timestamp ASC\"";
    var execution = cmd+" "+sqlQuery;
    DebugLogString("The cmd for Operator Actions: "+execution);
    var run = run_cmd_timeout(execution, 7000);
    DebugLogString("The result of Operator Actions: "+run);
    return run.replace(/(\r\n|\n|\r)/gm, "");
    
    }
*/

function getOperatorActions2(uuid) {
    var cmd = "sqlcmd  -U \"PSIM\" -P \"YSPW7509-sywj!#O%&\" -S \"10.245.39.101\\SQLEXPRESS2014\" -d dataservice -W -h -1 -s \" \" -Q \"SET NOCOUNT ON;";
    var sqlQuery = "SELECT dateadd(HOUR, 2, ack_timestamp) as ack_timestamp, parent_control_id, child_control_id, edit_text FROM [dbo].[operator_action] WHERE event_guid = '" + uuid + "' order by ack_timestamp ASC\"";
    var execution = cmd + " " + sqlQuery;
    DebugLogString("CiiMS custom page script: getOperatorActions2: the cmd for Operator Actions: " + execution);
    var run = run_cmd_timeout(execution, 11000);
    DebugLogString("CiiMS custom page script: getOperatorActions2: the result of Operator Actions: " + run);
    return run.replace(/(\r\n|\n|\r)/gm, "");

};

// This function differs from getOperatorActions2 by adding a delimiter between each action and 
// combining the step name and the value chosen for that step
function getOperatorActionsToSendToCiims(uuid) {
    var cmd = "sqlcmd  -U \"PSIM\" -P \"YSPW7509-sywj!#O%&\" -S \"10.245.39.101\\SQLEXPRESS2014\" -d dataservice -W -h -1 -s \" \" -Q \"SET NOCOUNT ON;";
    var sqlQuery = "SELECT CONCAT(dateadd(HOUR, 2, ack_timestamp), ';', CONCAT(parent_control_id, '*', child_control_id), ';', edit_text) FROM [dbo].[operator_action] WHERE event_guid = '" + uuid + "' order by ack_timestamp ASC\"";
    var execution = cmd + " " + sqlQuery;
    DebugLogString("CiiMS custom page script: getOperatorActionsToSendToCiims: the cmd for Operator Actions to CiiMs: " + execution);
    var run = run_cmd_timeout(execution, 11000);
    DebugLogString("CiiMS custom page script: getOperatorActionsToSendToCiims: the result of Operator Actions to CiiMs: " + run);
    return run.replace(/(\r\n|\n|\r)/gm, "|");
};

function getDataFromStepName(step_name, tower) {
    var cmd = "sqlcmd  -U \"PSIM\" -P \"YSPW7509-sywj!#O%&\" -S \"10.245.39.101\\SQLEXPRESS2014\" -d dataservice -W -h -1 -s \"|\" -Q \"SET NOCOUNT ON;";
    var sqlQuery = "declare @Investigator int; SET @Investigator = (SELECT TOP 1 child_control_id_0 FROM operator_action WHERE siteId = '" + tower + "' AND parent_control_id = '" + step_name + "' AND ack_timestamp >= DATEADD(hour, -5, GETDATE()) ORDER by ack_timestamp DESC); SELECT g.content_value FROM (SELECT ROW_NUMBER() OVER (ORDER BY (SELECT 1)) AS rownumber, right(value,len(value)-1) as content_value FROM STRING_SPLIT((SELECT SUBSTRING(h.content0, 0, CHARINDEX('>,', h.content0)) as content FROM (SELECT TOP 1 (SUBSTRING(control_descr, CHARINDEX('combo.content.0', control_descr) + 17, LEN(convert(varchar(MAX), control_descr)))) as content0 FROM [psim].[dbo].[OBJ_INC_SERVER_PROCESSOR_CTRLS] WHERE control_id = '" + step_name + "' and main_id = '1') h), '\\')) g WHERE rownumber = @Investigator+1\"";
    var execution = cmd + " " + sqlQuery;
    DebugLogString("CiiMS custom page script: getDataFromStepName: The cmd for " + step_name + " is: " + execution);
    var run = run_cmd_timeout(execution, 11000);
    DebugLogString("CiiMS custom page script: getDataFromStepName: The result of " + step_name + " is: " + run);
    return run.replace(/(\r\n|\n|\r)/gm, "");

};

function getSubcontractors(tower) {
    var cmd = "sqlcmd -U \"PSIM\" -P \"YSPW7509-sywj!#O%&\" -S \"10.245.39.101\\SQLEXPRESS2014\" -d dataservice -W -h -1 -s \"|\" -Q \"SET NOCOUNT ON;";
    var sqlQuery = "declare @id int; declare @zone_name varchar(30); SET @id = (SELECT TOP 1 child_control_id_0 FROM operator_action WHERE siteId = '" + tower + "' AND parent_control_id LIKE '%sub%' AND ack_timestamp >= DATEADD(hour, -5, GETDATE()) ORDER by ack_timestamp DESC); SET @zone_name = (SELECT TOP 1 parent_control_id FROM operator_action WHERE siteId = '" + tower + "' AND parent_control_id LIKE '%sub%' AND ack_timestamp >= DATEADD(hour, -5, GETDATE()) ORDER by ack_timestamp DESC)SELECT g.content_value FROM (SELECT ROW_NUMBER() OVER (ORDER BY (SELECT 1)) AS rownumber, right(value,len(value)-1) as content_value FROM STRING_SPLIT((SELECT SUBSTRING(h.content0, 0, CHARINDEX('>,', h.content0)) as content FROM (SELECT TOP 1 (SUBSTRING(control_descr, CHARINDEX('combo.content.0', control_descr) + 17, LEN(convert(varchar(MAX), control_descr)))) as content0 FROM [psim].[dbo].[OBJ_INC_SERVER_PROCESSOR_CTRLS] WHERE control_id = @zone_name) h), '\\')) g WHERE rownumber = @id\"";
    var execution = cmd + " " + sqlQuery;
    DebugLogString("CiiMS custom page script: getSubcontractors: the cmd for subcontractors is: " + execution);
    var run = run_cmd_timeout(execution, 11000);
    DebugLogString("CiiMS custom page script: getSubcontractors: the result of subcontractors is: " + run);
    return run.replace(/(\r\n|\n|\r)/gm, "");

};

function getAcknowledgeTimestamp(event) {
    var cmd = "sqlcmd -U \"PSIM\" -P \"YSPW7509-sywj!#O%&\" -S \"10.245.39.101\\SQLEXPRESS2014\" -d dataservice -W -h -1 -s \"|\" -Q \"SET NOCOUNT ON;";
    var sqlQuery = "SELECT TOP 1 ack_timestamp FROM [dbo].[operator_action] WHERE event_guid = '" + event + "' ORDER by alert_timestamp DESC;\"";
    var execution = cmd + " " + sqlQuery;
    DebugLogString("CiiMS custom page script: getAcknowledgeTimestamp: the cmd for is: " + execution);
    var run = run_cmd_timeout(execution, 11000);
    DebugLogString("CiiMS custom page script: getAcknowledgeTimestamp: the result of execution is: " + run);
    return run.replace(/(\r\n|\n|\r)/gm, "");
};

function getTimestampFromEventGUID(guid) {
    var cmd = "sqlcmd -U \"" + sqlUser + "\" -P \"" + sqlPass + "\" -S \"" + instanceName + "\" -W -h -1 -s \"|\" -Q \"SET NOCOUNT ON; SELECT TOP 1 [date] FROM [psim].[dbo].[PROTOCOL] WHERE [pk] = '" + guid + "'\"";
    DebugLogstring("getTimestampFromEventGUID: cmd is " + cmd);
    var run = run_cmd_timeout(cmd, 9000);
    DebugLogString("CiiMS custom page script: getTimestampFromEventGUID: First check: found timestamp \"" + run + "\" for event " + guid);
    if (empty(run)) {
        var cmd2 = "sqlcmd -U \"PSIM\" -P \"YSPW7509-sywj!#O%&\" -S \"10.245.39.101\\SQLEXPRESS2014\" -W -h -1 -s \"|\" -Q \"SET NOCOUNT ON; SELECT TOP 1 alert_timestamp FROM dataservice.[dbo].[operator_action] WHERE event_guid = '" + guid + "'\"";
        DebugLogstring("getTimestampFromEventGUID: second cmd is " + cmd2);
        var run2 = run_cmd_timeout(cmd2, 9000);
        DebugLogString("getTimestampFromEventGUID: Second check: found timestamp \"" + run2 + "\" for event " + guid);
        return run2.replace(/(\r\n|\n|\r)/gm, "")
    } else {
        return run.replace(/(\r\n|\n|\r)/gm, "");
    }
};

function getCamerasFromRegion(reg) {
    var cmdCams = "sqlcmd -U \"" + sqlUser + "\" -P \"" + sqlPass + "\" -S \"" + instanceName + "\" -d " + dbName + " -W -h -1 -Q \"SET NOCOUNT ON; SELECT STRING_AGG([id], ',') FROM [dbo].[OBJ_CAM] where [region_id] = '" + reg.replace(/(\r\n|\n|\r)/gm, "") + "';\"";
    var cmd = run_cmd_timeout(cmdCams, 11000);
    DebugLogString("CiiMS custom page script: CiiMS cameras SQL query: " + cmdCams + "; result is :" + cmd);
    return cmd.replace(/(\r\n|\n|\r)/gm, "");
};

function empty(str) {
    if (typeof str == 'undefined' || !str || str.length === 0 || str === "" || !/[^\s]/.test(str) || /^\s*$/.test(str) || str.replace(/\s/g, "") === "") { return true; }
    else { return false; }
};

function doSendCiiMSReport(data) {
    var execution_string = "curl " + JSON_header + " " + APIKey + " " + deviceType + " " + endpoint + " " + user + " --data \"" + data + "\"";
    DebugLogString("CiiMS custom page script: doSendCiiMSReport: the commandline is " + execution_string);
    var run = run_cmd_timeout(execution_string, 23000);
    DebugLogString("CiiMS custom page script: doSendCiiMSReport: the execution of CiiMS sending is " + run);
    run2 = run.replace(/(\r\n|\n|\r)/gm, "")
    return run2.replace(/[|&;$%@"<>()+,]/g, "");
};

function doInsertCiiMStoBPCDatabase(event_uui, event_time, site, pop, zone, event_typ, transmitter, ack_tim, subcontract, respRef, disp_time, arr_time, cate, root, inv, reactions, r24_mes, soa) {
    var sqlQuery = "INSERT INTO ciims_messages VALUES (CURRENT_TIMESTAMP,'" + event_uui + "','" + event_time + "','" + site + "','" + pop + "','" + zone + "','" + event_typ + "','" + transmitter + "','" + ack_tim + "','Yes','" + subcontract + "','Yes','" + respRef + "','" + disp_time + "','" + arr_time + "','" + cate + "','ALARM','PSIM ALARM','" + root + "','" + investigatorsRequired + "','" + inv + "','" + reactions + "','" + r24_mes + "','" + soa + "');";

    var cmdTwo = "sqlcmd -U \"PSIM\" -P \"Intellect_default_DB_4\" -S \"10.80.50.132\\PSIM_VDB,1550\" -d custom_db -Q \"" + sqlQuery + "\"";
    var runTwo = run_cmd_timeout(cmdTwo, 14000);
    DebugLogString("CiiMS custom page script: doInsertCiiMStoBPCDatabase cmdTwo is: " + cmdTwo);
    DebugLogString("CiiMS custom page script: doInsertCiiMStoBPCDatabase execution result for runTwo is: " + runTwo);
};

function doInsertCiiMStoMTNDatabase(event_uui, event_time, site, pop, zone, event_typ, transmitter, ack_tim, subcontract, respRef, disp_time, arr_time, cate, root, inv, reactions, r24_mes, soa) {
    var sqlQuery = "INSERT INTO ciims_messages VALUES (CURRENT_TIMESTAMP,'" + event_uui + "','" + event_time + "','" + site + "','" + pop + "','" + zone + "','" + event_typ + "','" + transmitter + "','" + ack_tim + "','Yes','" + subcontract + "','Yes','" + respRef + "','" + disp_time + "','" + arr_time + "','" + cate + "','ALARM','PSIM ALARM','" + root + "','" + investigatorsRequired + "','" + inv + "','" + reactions + "','" + r24_mes + "','" + soa + "');";
    var cmd = "sqlcmd -U \"" + sqlUser + "\" -P \"" + sqlPass + "\" -S \"" + instanceName + "\" -d " + dbName + " -Q \"" + sqlQuery + "\"";
    DebugLogString("CiiMS custom page script: doInsertCiiMStoMTNDatabase cmd is: " + cmd);
    var run = run_cmd_timeout(cmd, 14000);
    DebugLogString("CiiMS custom page script: doInsertCiiMStoMTNDatabase execution result is: " + run);
};