// In this script we initialize the computer value on the relevant HTML that was loaded.
// You can make use of this script to initialize other values as long as those values are known
if (Event.SourceType == "MACRO" && Event.SourceId == 786 && Event.Action == "RUN") {

    // All Computers that are currently making use of an HTML Header interface
    var computers = ["BTS01", "BTS02", "BTS03", "BTS04", "BTS05", "BTS06", "BTS07", "BTS08", "BTS09",
        "BTSWALL1", "BTS10", "BTS11", "MEYERM3", "MOJELAB", "SIMELANES2"]

    // Loop through the array to set the value on the HTML
    for (var i = 0; i < computers.length; i++) {
        var slaveId = computers[i]

        // Header HTML Interface ID for all stacks go here
        var headerOpcie = [];

        // Inside the switch we check which computer we're using then 
        // we put the IDs of the monitors and the HTMLs inside their respective arrays
        switch (slaveId) {
            case "BTS01":
                headerOpcie = [23, 24, 25, 26];
                not_found = false;
                break;
            case "BTS02":
                headerOpcie = [27, 28, 29];
                not_found = false;
                break;
            case "BTS03":
                headerOpcie = [30, 31, 32];
                not_found = false;
                break;
            case "BTS04":
                headerOpcie = [4, 34, 35];
                not_found = false;
                break;
            case "BTS05":
                headerOpcie = [3, 5, 6];
                not_found = false;
                break;
            case "BTS06":
                headerOpcie = [20, 38, 40];
                not_found = false;
                break;
            case "BTS07":
                headerOpcie = [41, 42, 46];
                not_found = false;
                break;
            case "BTS08":
                headerOpcie = [48, 49, 51];
                not_found = false;
                break;
            case "BTS09":
                headerOpcie = [1, 9, 10, 12, 13, 15];
                not_found = false;
                break;
            case "BTSWALL1":
                headerOpcie = [16, 18, 19, 37];
                not_found = false;
                break;
            case "BTS10":
                headerOpcie = [52, 54, 55, 57, 58];
                not_found = false;
                break;
            case "BTS11":
                headerOpcie = [60, 61, 64, 65, 66];
                not_found = false;
                break;
            case "MEYERM3":
                headerOpcie = [67, 68, 69];
                not_found = false;
                break;
            case "MOJELAB":
                headerOpcie = [70, 77, 78];
                not_found = false;
                break;
            case "SIMELANES2":
                headerOpcie = [74, 79, 80];
                not_found = false;
                break;
            default:
                not_found = true;
        }

        if (!not_found) {
            DebugLogString("When display is activated, show empty dialogs: Setting computer value on " + slaveId + " header HTML wit OPCIE ID: " + headerOpcie)
            for (var j = 0; j < headerOpcie.length; j++) {
                DoReactStr("OPCIE", headerOpcie[j], "FUNC", "func_name<setComputerValue>,computer<" + slaveId + ">");
            }
        }
    }
}