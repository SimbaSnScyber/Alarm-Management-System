var endpoint = "https://soab2besf.mtn.co.za:20260/event-management/enterprise/proxy/api/v1/event";
var timeout = 23000;
var headers = "-H \"Content-type: application/json\"";
var auth = "--user SVC_PSIM_B2BOSB_INVOKE:JvcF9ZNy9BnKyamq";
var executionServer = "Newlands";

if (Event.SourceType == "MACRO" && Event.Action == "RUN" && Event.SourceId == 1002) {
    var referenceId = Itv_var("T" + Event.GetParam("number") + "_r24_key");
    var computer = Event.GetParam("computer");

    DebugLogString("R24 close: starting cancel (close) dispatch action for site " + Event.GetParam("number") + " with reference ID " + referenceId + " by " + computer + "...");

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

    if (!empty(Event.GetParam("number")) && (!not_found) && (!empty(referenceId) && ((Itv_var("Failover_flag") == "False")) || (empty(Itv_var("Failover_flag"))))) {
        var transaction_id = Event.GetParam("guid_pk").replace(/[{}]/g, ""); 	// Event UUID
        messageAction(executionServer + ": finalize R24 dispatch request for site \"" + Event.GetParam("number") + "\" has been sent.\\r\\nReference ID used is " + referenceId + "", computer);

        var cmd2 = "curl " + headers + " " + auth + " --url \"" + endpoint + "?sourceIdentifier=PSIM&transactionId=" + transaction_id + "&referenceId=" + referenceId + "\" -X DELETE";
        DebugLogString("R24 close: cmd for execution is: " + cmd2);
        var run2 = run_cmd_timeout(cmd2, timeout);
        DebugLogString("R24 close: execution result is: " + run2);

        var json2 = JSON.parse(run2);
        if (!empty(computer) && (json2.statusCode != 0)) {
            messageAction(executionServer + ": R24 closure info:\\r\\nReceived status code: " + json2.statusCode + "\\r\\nReceived status message: " + json2.statusMessage + "\\r\\nReceived support message: " + json2.supportMessage + "\\r\\nUsed unique reference Key: " + referenceId + ".", computer);
        }
        //if (json2.statusCode = 0) {	// clear the dispatch flags/parameters only if correct status code received from MTN SOA

        SetObjectParam("SIGNALTOWER", "T" + Event.GetParam("number"), "r24", ""); // Setting the ST parameter to empty
        Itv_var("T" + Event.GetParam("number") + "_r24_dispatchTime") = "";
        Itv_var("T" + Event.GetParam("number") + "_r24_dispatchFullTime") = "";
        Itv_var("T" + Event.GetParam("number") + "_r24_key") = ""; // clearing global variables of the dispatch

        NotifyEventStr("SIGNALTOWER", "T" + Event.GetParam("number"), "R24_CLOSE", ""); // producing ST dispatch closure event
        //		} else {
        //	messageAction("Status code is not 0, meaning error message received from MTN SOA and/or R24 platform!",Event.GetParam("slave_id"));
        //	}
        DoReactStr("OPCIE", opcieId, "FUNC", "func_name<clearDispatchTimes>,dispatchTime<>");
        DoReactStr("OPCIE", opcieId, "FUNC", "func_name<setState>,state<Moved to history>");	// sending the closed state to HTML page
    }
};

function messageAction(msg, slave) {
    var cmd = "mshta \"javascript:var sh=new ActiveXObject( 'WScript.Shell' ); sh.Popup( '" + msg + "', 60, 'R24 Closure', 4096 );close()\"";
    DoReactStr("SLAVE", slave, "CREATE_PROCESS", "command_line<" + cmd + ">");
};

function empty(str) {
    if (typeof str == 'undefined' || !str || str.length === 0 || str === "" || !/[^\s]/.test(str) || /^\s*$/.test(str) || str.replace(/\s/g, "") === "") { return true; }
    else { return false; }
};