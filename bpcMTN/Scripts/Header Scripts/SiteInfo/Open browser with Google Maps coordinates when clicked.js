if (Event.SourceType == "MACRO" && Event.Action == "RUN" && Event.SourceId == 500) {
    if (!empty(Event.GetParam("number"))) {
        DebugLogString("Opening Google Maps with Coordinates: " + Event.GetParam("number") + " on computer: " + Event.GetParam("computer"))
        var coord = Event.GetParam("number").split(",");
        DoReactStr("SLAVE", Event.GetParam("computer"), "CREATE_PROCESS", "command_line<\"https://www.google.com/maps?q=" + coord[0] + "," + coord[1] + "\">");
    }
}

function empty(str) {
    if (typeof str == 'undefined' || !str || str.length === 0 || str === "" || !/[^\s]/.test(str) || /^\s*$/.test(str) || str === "") { return true; }
    else { return false; }
}