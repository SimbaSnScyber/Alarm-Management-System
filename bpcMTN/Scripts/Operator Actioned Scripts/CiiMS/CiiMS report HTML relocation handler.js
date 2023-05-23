if (Event.SourceType == "MACRO" && Event.SourceId == 721 && Event.Action == "RUN") {

    var slave = Event.GetParam("slave_id");
    var split = slave.split(".");

    if (!empty(split[1])) {
        if (Event.GetParam("action") == "expand") {
            DebugLogString("Expanding CiiMS HTML window with id " + split[1]);
            NotifyEventStr("CORE", "", "UPDATE_OBJECT", "objtype<OPCIE>,objid<" + split[1] + ">,y<0>,x<0>,w<100>,h<100>");
        }
        if (Event.GetParam("action") == "minimize") {
            DebugLogString("Minimizing CiiMS HTML window with id " + split[1]);
            NotifyEventStr("CORE", "", "UPDATE_OBJECT", "objtype<OPCIE>,objid<" + split[1] + ">,y<0>,x<60>,w<28>,h<3>");
        }
    }
};

function empty(str) {
    if (typeof str == 'undefined' || !str || str.length === 0 || str === "" || !/[^\s]/.test(str) || /^\s*$/.test(str) || str.replace(/\s/g, "") === "") { return true; }
    else { return false; }
};