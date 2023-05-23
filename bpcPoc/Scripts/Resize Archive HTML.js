if (Event.SourceType == "MACRO" && Event.SourceId == 723 && Event.Action == "RUN") {

    var slave = Event.GetParam("slave_id");
    var split = slave.split(".");

    if (!empty(split[1])) {
        if (Event.GetParam("action") == "expand") {
            DebugLogString("Expanding Archive HTML window with id " + split[1]);
            NotifyEventStr("CORE", "", "UPDATE_OBJECT", "objtype<OPCIE>,objid<" + split[1] + ">,y<0>,x<21>,w<35>,h<55>");
        }
        if (Event.GetParam("action") == "minimize") {
            DebugLogString("Minimizing Archive HTML window with id " + split[1]);
            NotifyEventStr("CORE", "", "UPDATE_OBJECT", "objtype<OPCIE>,objid<" + split[1] + ">,y<0>,x<21>,w<20>,h<3>");
        }
    }
};

function empty(str) {
    if (typeof str == 'undefined' || !str || str.length === 0 || str === "" || !/[^\s]/.test(str) || /^\s*$/.test(str) || str.replace(/\s/g, "") === "") { return true; }
    else { return false; }
};