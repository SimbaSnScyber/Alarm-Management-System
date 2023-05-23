// This script is to handle the AccessRef button. When it's pressed, we shall give a pop-up notification with the details about the iCrypto Ref

var instanceName = "NLPAG71,1550";
var dbName = "PSIM";
var sqlUser = "SQL_Auth_Account_For_PSIM";
var sqlPass = "@F%L)Dfhq123asduiop#$577pMg_";

if (Event.SourceType == "MACRO" && Event.SourceId == "501" && Event.Action == "RUN") {
    var accessRef = Event.GetParam("number");				// Grabbing the data
    var slaveId = Event.GetParam("computer");
    var siteId = Event.GetParam("site_id");

    if (isNumber(siteId)) {
        var siteId = "T" + siteId;
    }

    DebugLogString("iCrypto AccessRef hanlder: Showing iCrypto AccessRef " + accessRef + " on computer " + slaveId + " for site " + siteId + "...");

    if (accessRef != "None") {

        var message = "iCrypto Ref parameters:\\n\\n Phone: +" + Itv_var(siteId + "msisdn") + "\\n Location: " + Itv_var(siteId + "loc") + "\\n Valid for site ID: " + Itv_var(siteId + "area") + ".\\n\\n";
        var header = "iCrypto Ref " + accessRef + " details";
        DebugLogString("iCrypto AccessRef hanlder: showing this message: " + message);

        // Database vars grab:

        var userId = getUserId(Itv_var(siteId + "uid"));
        var userName = GetObjectParam("PERSON", userId, "surname");
        if (empty(userName)) {
            var userName = "Not present in the database yet";
        }
        message += "Information from Database:\\n\\n Name: " + userName + "\\n";

        var userSurname = GetObjectParam("PERSON", userId, "name");
        if (empty(userSurname)) {
            var userSurname = "Not present in the database yet";
        }

        message += " Surname: " + userSurname + "\\n";

        //var userDocument = GetObjectParam("PERSON",userId,"visit_document");
        //if (empty(userDocument)) {
        //	var userDocument = "Not present in the database yet";
        //}
        //
        //message += " Document: "+userDocument+"\\n";

        var userPhone = GetObjectParam("PERSON", userId, "phone");
        if (empty(userPhone)) {
            var userPhone = "Not present in the database yet";
        }

        message += " Phone: " + userPhone + "\\n"

        var userCompany = GetObjectParam("PERSON", userId, "patronymic");
        if (empty(userCompany)) {
            var userCompany = "Not present in the database yet";
        }

        message += " Company: " + userCompany + "\\n";

        var userSubContractorParentId = GetObjectParentId("PERSON", userId, "DEPARTMENT");
        if (empty(userSubContractorParentId)) {
            var userSubContractorName = "Not present in the database yet";
        } else {
            var userSubContractorName = GetObjectName("DEPARTMENT", userSubContractorParentId);
        }


        message += " Subcontractor: " + userSubContractorName + ".";

        messageAction(message, header, slaveId);

    } else {
        messageAction("Nothing to show", "iCrypto Ref details", slaveId);
    }
};

function messageAction(msg, header, slave) {
    var cmd = "mshta \"javascript:var sh=new ActiveXObject( 'WScript.Shell' ); sh.Popup( '" + msg + "', 120, '" + header + "', 64 );close()\"";
    DoReactStr("SLAVE", slave, "CREATE_PROCESS", "command_line<" + cmd + ">");
};

function isNumber(n) { return !isNaN(parseFloat(n)) && !isNaN(n - 0) }

function getUserId(guid) {
    var cmd = "sqlcmd -U \"" + sqlUser + "\" -P \"" + sqlPass + "\" -S \"" + instanceName + "\" -d " + dbName + " -W -h -1 -Q \"SET NOCOUNT ON; SELECT TOP 1 [id] FROM [dbo].[OBJ_PERSON] WHERE [OBJ_PERSON].[guid] = '" + guid + "';\"";
    var result = run_cmd_timeout(cmd, 7000).replace(/(\r\n|\n|\r)/gm, "");
    DebugLogString("iCrypto AccessRef hanlder: getUserId: found User id \"" + result + "\" for guid \"" + guid + "\"");
    return result;
};

function empty(str) {
    if (typeof str == 'undefined' || !str || str.length === 0 || str === "" || !/[^\s]/.test(str) || /^\s*$/.test(str) || str.replace(/\s/g, "") === "") { return true; }
    else { return false; }
};