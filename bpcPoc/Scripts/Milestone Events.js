if (Event.SourceType == "MACRO" && Event.Action == "RUN" && Event.SourceId == "3050") {
    var timestamp = Event.GetParam("date") + " " + Event.GetParam("time");
    DebugLogString(timestamp + " Milestone Events processing: received a new event!");

    var camera_id = Event.GetParam("param0").toUpperCase();
    var milestone_event_id = Event.GetParam("param1");
    var milestone_message = Event.GetParam("param2");
    var milestone_name = Event.GetParam("param3");
    var milestone_priority = Event.GetParam("priority");
    var milestone_source_name = Event.GetParam("sourcename");
    var milestone_timestamp = Event.GetParam("milestone_timestamp");

    switch (milestone_message) {
        case "Tripwire":
            event_type = "MILESTONE_TRIPWIRE";
            break;
        case "External Event":
            event_type = "MILESTONE_VAULT_ALARM";
            break;
        case "IntrusionStart":
            event_type = "MILESTONE_INTRUSION";
            break;
        default:
            event_type = "MILESTONE_UNKNOWN";
            break;
    }

    switch (camera_id) {
        case "3E624C49-1C26-45DB-A866-367240763AC2":
            cam = "15";
            break;
        case "0B12EE11-C226-47CC-8E84-76A90FE29B4E":
            cam = "10";
            break;
        case "DA4C93AE-A4B2-475C-AC6E-FB16C6F1A175":
            cam = "18";
            break;
        case "4C615B22-B9C9-448E-AE0A-E46401E9919C":
            cam = "16";
            break;
        case "3744A9FE-E348-470C-95F7-2FE8AEB0F427":
            cam = "12";
            break;
        case "9E7C6BDF-0B15-4BDD-81D7-5723B8F9ACBA":
            cam = "17";
            break;
        case "3D06673E-1625-4307-8FAC-19452E1249CF":
            cam = "13";
            break;
        case "1F2D1367-6351-4CDE-820F-D6950641F9D2":
            cam = "11";
            break;
        case "84501228-552F-49A3-A123-798AD9766E78":
            cam = "24";
            break;
        case "0393746F-FCE2-48A9-B4A4-16B5FB804EA9":
            cam = "20";
            break;
        case "66ACF50E-483E-4667-BECD-DDCE4F3865F3":
            cam = "23";
            break;
        case "50F4EFD7-547B-496B-B145-9D1DF2544A08":
            cam = "21";
            break;
        case "5699A40B-1830-4117-B049-DE4E4EB52955":
            cam = "22";
            break;
        case "73C75A53-9571-4D6F-888A-64B526ACCB8C":
            cam = "32";
            break;
        case "907EC64D-DAEA-459C-B449-D6E20ECD2460":
            cam = "19";
            break;
        case "15D3C652-7C46-42E4-BBA1-BA6E96159786":
            cam = "27";
            break;
        case "1F2A5069-306C-478D-BF14-ADB1763B0189":
            cam = "28";
            break;
        case "83CB40EC-6072-4703-9EC9-E52E3AB0354A":
            cam = "14";
            break;
        case "3AA1F688-A235-4584-80A6-C7099A60AB3E":
            cam = "29";
            break;
        case "6B29DE0B-1A97-4480-96DE-BBC56F0102EC":
            cam = "30";
            break;
        case "8C99A12A-111A-4016-BCF7-E44747CDEAA0":
            cam = "34";
            break;
        default:
            cam = "500";
            break;
    }

    DebugLogString(timestamp + " Milestone Events processing: milestone message is " + milestone_message + "; event type is " + event_type);

    if (!empty(event_type) && !empty(camera_id)) {
        generate_event(event_type);
        generate_camera_event(event_type, cam);
    }
};

function generate_event(type) {
    DebugLogString(timestamp + " Milestone Events processing: generate_event(" + type + "): generating this: NotifyEventStr(\"SIGNALTOWER\",\"999\"," + type + ",\"milestone_event_id<" + milestone_event_id + ">,milestone_name<" + milestone_name + ">,milestone_priority<" + milestone_priority + ">,milestone_source_name<" + milestone_source_name + ">,milestone_timestamp<" + milestone_timestamp + ">\"");
    NotifyEventStr("SIGNALTOWER", "999", type, "milestone_event_id<" + milestone_event_id + ">,milestone_name<" + milestone_name + ">,milestone_priority<" + milestone_priority + ">,milestone_source_name<" + milestone_source_name + ">,milestone_timestamp<" + milestone_timestamp + ">");
};

function generate_camera_event(type, cam_id) {
    DebugLogString(timestamp + " Milestone Events processing: generate_event(" + type + "): generating this: NotifyEventStr(\"CAM\"," + cam_id + "," + type + ",\"milestone_event_id<" + milestone_event_id + ">,milestone_name<" + milestone_name + ">,milestone_priority<" + milestone_priority + ">,milestone_source_name<" + milestone_source_name + ">,milestone_timestamp<" + milestone_timestamp + ">\"");
    NotifyEventStr("CAM", cam_id, type, "milestone_event_id<" + milestone_event_id + ">,milestone_name<" + milestone_name + ">,milestone_priority<" + milestone_priority + ">,milestone_source_name<" + milestone_source_name + ">,milestone_timestamp<" + milestone_timestamp + ">");
};

function empty(str) {
    if (typeof str == 'undefined' || !str || str.length === 0 || str === "" || !/[^\s]/.test(str) || /^\s*$/.test(str) || str === "") { return true; }
    else { return false; }
};