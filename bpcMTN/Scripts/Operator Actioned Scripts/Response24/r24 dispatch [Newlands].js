//var endpoint = "https://soab2bqaesf.mtn.co.za:20260/event-management/enterprise/proxy/api/v1/event"; // QA endpoint
var endpoint = "https://soab2besf.mtn.co.za:20260/event-management/enterprise/proxy/api/v1/event";	// PROD endpoint
var timeout = 23000; // timeout before cURL query execution termination
var headers = "-H \"Content-type: application/json\"";
var auth = "--user SVC_PSIM_B2BOSB_INVOKE:JvcF9ZNy9BnKyamq";		// PROD endoint authorization
var executionServer = "Newlands";

if (Event.SourceType == "MACRO" && Event.Action == "RUN" && Event.SourceId == 1001) {
    var computer = Event.GetParam("computer");
    var towerId = Event.GetParam("number");
    DebugLogString("R24 dispatch: starting R24 dispatch action for site " + towerId + " by computer " + computer + ". Failover flag is " + Itv_var("Failover_flag") + "...");

    var opcieId = []
    switch (computer) {
        case "BTS01":
            opcieId = [23, 24, 25, 26];
            break;
        case "BTS02":
            opcieId = [27, 28, 29];
            break;
        case "BTS03":
            opcieId = [30, 31, 32];
            break;
        case "BTS04":
            opcieId = [4, 34, 35];
            break;
        case "BTS05":
            opcieId = [3, 5, 6];
            break;
        case "BTS06":
            opcieId = [20, 38, 40];
            break;
        case "BTS07":
            opcieId = [41, 42, 46];
            break;
        case "BTS08":
            opcieId = [48, 49, 51];
            break;
        case "BTS09":
            opcieId = [1, 9, 10, 12, 13, 15];
            break;
        case "BTS10":
            opcieId = [52, 54, 55, 57, 58];
            break;
        case "BTSWALL1":
            opcieId = [16, 18, 19, 37];
            break;
        case "BTS11":
            opcieId = [60, 61, 64, 65, 66];
            break;
        case "BTS12":
            opcieId = ["824"];
            break;
        default:
            opcieId = ["999"];
    }

    if (!empty(towerId) && (!empty(computer)) && ((Itv_var("Failover_flag") == "False") || (empty(Itv_var("Failover_flag"))))) {

        messageAction(executionServer + ": dispatch request for the site \"" + towerId + "\" has been sent!", computer); // confirmation pop-up message

        var transaction_id = Event.GetParam("guid_pk").replace(/[{}]/g, ""); 	// Event UUID
        DebugLogString("R24 dispatch: transactionID is: " + transaction_id);

        var cmd = "curl " + headers + " " + auth + " --url \"" + endpoint + "\" --data \"{\\\"transactionId\\\":\\\"" + transaction_id + "\\\",\\\"sourceIdentifier\\\":\\\"PSIM\\\",\\\"siteId\\\":\\\"T123456\\\"}\" 2>1";
        // var cmd = "curl " + headers + " " + auth + " --url \"" + endpoint + "\" --data \"{\\\"transactionId\\\":\\\"" + transaction_id + "\\\",\\\"sourceIdentifier\\\":\\\"PSIM\\\",\\\"siteId\\\":\\\"" + "T" + towerId + "\\\"}\" 2>1";

        DebugLogString("R24 dispatch: the cmd for the dispatch is: " + cmd);
        var run = run_cmd_timeout(cmd, timeout);	// doing the cURL call with cmd data
        DebugLogString("R24 dispatch: the execution outcome is: " + run);
        var json = JSON.parse(run);			// parsing the response

        if (json.statusCode != 0) {
            messageAction(executionServer + ": R24 dispatch info:\\r\\nReceived status code: " + json.statusCode + "\\r\\nReceived status message: " + json.statusMessage + "\\r\\nReceived support message: " + json.supportMessage + "\\r\\nReceived unique reference Key: " + json.referenceId + "", computer);
        }
        DebugLogString("R24 dispatch: the reference for dispatch is: " + json.referenceId);

        if (json.referenceId === undefined || json.referenceId === null) {
            messageAction(executionServer + ": dispatch request for site \"" + Event.GetParam("number") + "\" was unsuccessful, retrying...", computer);
            var run = run_cmd_timeout(cmd, timeout);
            var json = JSON.parse(run);
            if (json.statusCode != 0) {
                messageAction(executionServer + ": R24 dispatch info:\\r\\nReceived status code: " + json.statusCode + "\\r\\nReceived status message: " + json.statusMessage + "\\r\\nReceived support message: " + json.supportMessage + "\\r\\nReceived unique reference Key: " + json.referenceId + "", computer);
            }
            DebugLogString("R24 dispatch: the reference for 2nd dispatch is: " + json.referenceId);
        }

        NotifyEventStr("SIGNALTOWER", "T" + Event.GetParam("number"), "R24_DISPATCH", "param0<" + json.referenceId + ">"); // producing ST event for R24 dispatch (can be quered from PROTOCOL)

        var cmd2 = "curl " + headers + " " + auth + " --url \"" + endpoint + "?sourceIdentifier=PSIM&transactionId=5&referenceId=" + json.referenceId + "\"";

        Itv_var("T" + Event.GetParam("number") + "_r24_key") = json.referenceId;

        var run2 = run_cmd_timeout(cmd2, timeout); // getting updates for our unique key dispatch
        DebugLogString("R24 dispatch: the execution outcome for update call is: " + run2);
        var json2 = JSON.parse(run2);
        DebugLogString("R24 dispatch: the current state of the dispatch is: \"" + json2.data[0].state + "\"");	// Current state of the dispatch

        SetObjectParam("SIGNALTOWER", "T" + Event.GetParam("number"), "r24", "" + json2.data[0].state + "");	// Setting ST parameter with the current state of dispatch

        if (empty(Itv_var("T" + Event.GetParam("number") + "_r24_dispatchTime"))) {
            Itv_var("T" + Event.GetParam("number") + "_r24_dispatchTime") = Event.GetParam("time");
            Itv_var("T" + Event.GetParam("number") + "_r24_dispatchFullTime") = Event.GetParam("date") + " " + Event.GetParam("time");
        }

        DebugLogString("R24 dispatch: the full timestamp of R24 dispatch is " + Itv_var("T" + Event.GetParam("number") + "_r24_dispatchFullTime"));
        NotifyEventStr("SIGNALTOWER", "T" + Event.GetParam("number"), "R24_INFO", "param0<" + json.referenceId + ">,param1<" + json2.data[0].state + ">"); // ST event producing (can be quered from PROTOCOL)

        for (i = 0; i < opcieId.length; i++) {
            DoReactStr("OPCIE", opcieId[i], "FUNC", "func_name<setDispatchTime>,dispatchTime<" + Itv_var("T" + Event.GetParam("number") + "_r24_dispatchTime") + ">,fullTimestamp<" + Itv_var("T" + Event.GetParam("number") + "_r24_dispatchFullTime") + ">");
            DoReactStr("OPCIE", opcieId[i], "FUNC", "func_name<setState>,state<" + json2.data[0].state + ">,referenceId<" + json.referenceId + ">");
            DebugLogString("R24 dispatch: starting autoUpdate with: " + json2.data[0].state + " and " + json2.referenceId);
            DoReactStr("OPCIE", opcieId[i], "FUNC", "func_name<autoUpdate>,state<" + json2.data[0].state + ">,key<" + json2.referenceId + ">,computer<" + computer + ">");
        }

        DebugLogString("R24 dispatch: setting r24 state setting " + json2.data[0].state + " for tower T" + Event.GetParam("number") + ". The r24 param is " + GetObjectParam("SIGNALTOWER", "T" + Event.GetParam("number"), "r24"));
    }
};

function messageAction(msg, slave) {
    var cmd = "mshta \"javascript:var sh=new ActiveXObject( 'WScript.Shell' ); sh.Popup( '" + msg + "', 60, 'R24 dispatch', 4096 );close()\"";
    DoReactStr("SLAVE", slave, "CREATE_PROCESS", "command_line<" + cmd + ">");
};

function empty(str) {
    if (typeof str == 'undefined' || !str || str.length === 0 || str === "" || !/[^\s]/.test(str) || /^\s*$/.test(str) || str.replace(/\s/g, "") === "") { return true; }
    else { return false; }
};