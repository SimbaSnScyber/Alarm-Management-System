if (Event.SourceType == "MACRO" && Event.Action == "RUN" && Event.SourceId == 503) {

    //var computer = Event.GetParam("computer");
    //var cmd = "\"C:\\Program Files (x86)\\VideoLAN\\VLC\\vlc.exe\" --rate=-1.0 --start-time=36000000 \"rtsp://BPCAdmin:Bidvest%40123@10.192.170.38:554/vod/D6A1FBEC-360A-4148-A229-69E8B4721BF7\"";
    //DebugLogString("Starting VLC playback on computer "+computer+": "+cmd);

    //DoReactStr("SLAVE",computer,"CREATE_PROCESS","command_line<"+cmd+">");

    var siteId = Event.GetParam("towerId");

    DoReactStr("SLAVE", "AXXONDEMO1", "CREATE_PROCESS", "command_line<\"http://172.24.0.228:80/\">");

};
