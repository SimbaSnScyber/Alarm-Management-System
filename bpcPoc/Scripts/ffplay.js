if (Event.SourceType == "MACRO" && Event.Action == "RUN" && Event.SourceId == 504) {

    //var computer = Event.GetParam("computer");
    //var cmd = "\"C:\\Program Files (x86)\\VideoLAN\\VLC\\vlc.exe\" --rate=-1.0 --start-time=36000000 \"rtsp://BPCAdmin:Bidvest%40123@10.192.170.38:554/vod/D6A1FBEC-360A-4148-A229-69E8B4721BF7\"";
    //DebugLogString("Starting VLC playback on computer "+computer+": "+cmd);

    //DoReactStr("SLAVE",computer,"CREATE_PROCESS","command_line<"+cmd+">");

    var computer = Event.GetParam("computer");
    var zoneId = Event.GetParam("towerId").split("-");
    var received_time = Event.GetParam("received_time");
    DebugLogString(received_time);
    var utc_iso_timestamp = parse_time(received_time);

    var cmd = "ffplay.exe -x 800 -y 600 -left 600 -top 200 -loglevel panic -i \"rtsp://root:root@172.24.0.228:554/archive/hosts/BTSGJ2/DeviceIpint." + zoneId[1] + "/SourceEndpoint.video:0:0/" + utc_iso_timestamp + "?speed=1\"";

    DebugLogString("ffplay cmd is: " + cmd);
    DoReactStr("SLAVE", computer, "CREATE_PROCESS", "command_line<" + cmd + ">");
};

function parse_time(timestring) {
    var white_space_split = timestring.split(" ");
    var date = white_space_split[0];
    var time = white_space_split[1];
    var date_split = date.split("-");
    var new_date = "20" + date_split[2] + "" + date_split[1] + "" + date_split[0];

    var ms = time.split(".");
    var time_split = ms[0].split(":");
    var utc_hours = time_split[0] - 2;
    if (utc_hours < 10) {
        utc_hours = "0" + utc_hours;
    }
    var new_time = utc_hours + "" + time_split[1] + "" + time_split[2];
    var iso = new_date + "T" + new_time;
    DebugLogString(iso);
    return iso;
};