if (Event.SourceType == "MACRO" && Event.SourceId == 3050 && Event.Action == "RUN") {

eventType = Event.GetParam("param0");
cameraId = Event.GetParam("param1");

switch(eventType) {

	case "lineCrossing":
	event = "LINE";
	break;

	case "loitering":
	event = "LOITERING";
	break;

	case "visitorEntrance":
	event = "VENTER";
	break;

	case "visitorExit":
	event = "VEXIT";
	break;

	case "faceDetection":
	event = "FD";
	break;

	case "stopInArea":
	event = "STOPAREA";
	break;

	case "VTANPR":
	event = "LPR";
	break;

	default:
	event = "UNKNOWN";

	}

    switch(cameraId) {

    case "1":
    camera = "6";
    break;
    
    case "10":
    camera = "9";
    break;
    
    case "11":
    camera = "10";
    break;
    
    case "12.0":
    camera = "13";
    break;
    
    case "3":
    camera = "7";
    break;
    
    case "4":
    camera = "8";
    break;
    
    case "5.2":
    camera = "11";
    break;

    case "6.0":
    camera = "12";
    break;
    
    default:
    camera = "UNKNOWN";
    
    }

//if (cameraId.indexOf(".") > -1) {
//	var regionId = cameraId;
//} else {
//	var regionId = cameraId+".0";
//}

DebugLogString("Sending this reaction: CAM|" + cameraId + "|" + event);

NotifyEventStr("CAM",cameraId,event,"date<"+Event.GetParam("date")+">,time<"+Event.GetParam("time")+">");
};