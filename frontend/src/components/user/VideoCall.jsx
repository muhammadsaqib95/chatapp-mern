import { useEffect, useState, useRef } from "react";
import { useSocket } from "../../Providers/socket";
import { useNotification } from "../AppNotification/NotificationProvider";
import { usePeer } from "../../Providers/peer";
import MuteIcon from "../../assets/svg/MuteIcon";
import AudioIcon from "../../assets/svg/AudioIcon";
import VideoIcon from "../../assets/svg/VideoIcon";
import MuteVideoIcon from "../../assets/svg/MuteVideoIcon";
import { useDevice } from "../../Providers/devices";

export default function VideoCall(props) {
  const { device } = useDevice();
  const notification = useNotification();
  const { socket } = useSocket();
  const { peer } = usePeer();
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [callSate, setCallState] = useState(null);
  const [remotePeerId, setRemotePeerId] = useState(null);
  const videoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isVideoMuted, setIsVideoMuted] = useState(false);

  navigator.permissions.query({ name: "camera" }).then(function (result) {
    console.log(result);
    if (result.state == "prompt") {
      console.log("prompt");
    }
  });

  useEffect(() => {
    socket.emit("call-user", { to: props.otherUser._id, from: props.from });
    navigator.mediaDevices
      .getUserMedia(device)
      .then((stream) => {
        setLocalStream(stream);
        setIsAudioMuted(stream.getAudioTracks()[0].enabled);
        setIsVideoMuted(stream.getVideoTracks()[0].enabled);
        let video = videoRef.current;
        video.muted = true;
        video.srcObject = stream;
        video.play();
      })
      .catch((err) => {
        if (err.name === "NotAllowedError") {
          notification({
            type: "Error",
            message: "Please allow camera and microphone access",
          });
        }
        console.log(err);
      });
    if (!device.video || !device.audio) {
      notification({
        type: "Error",
        message: `Please allow access to ${
          !device.video ? "camera" : "microphone"
        }`,
      });
    }
  }, []);
  useEffect(() => {
    socket.on("call-declined", () => {
      notification({ type: "Error", message: "Call declined" });
      let video = videoRef.current;
      video.srcObject.getTracks().forEach((track) => {
        track.stop();
      });
      video.srcObject = null;
      props.setVideoCall(null);
      setLocalStream(null);
    });
    socket.on("call-accepted", async (data) => {
      setRemotePeerId(data.peer);
      navigator.mediaDevices
        .getUserMedia({...device, video: device.video ? {
          width: {min: 640, ideal: 1280, max: 1920},
          height: {min: 480, ideal: 720, max: 1080},
        } : false})
        .then((stream) => {
          setLocalStream(stream);
          let video = videoRef.current;
        video.muted = true;
        video.srcObject = stream;
        video.play();
          var call = peer.call(data.peer, stream);
          setCallState(call);
        })
        .catch((err) => {
          console.log(err);
        });
    });

    return () => {
      socket.off("call-declined");
      socket.off("call-accepted");
    };
  }, [socket]);

  useEffect(() => {
    if (callSate) {
      callSate?.on("stream", (stream) => {
        setRemoteStream(stream);
        let video = remoteVideoRef.current;
        video.srcObject = stream;
        video.muted = true;
        video.play();
      });
      callSate.on("close", () => {
        let video = videoRef.current;
        video.srcObject.getTracks().forEach((track) => {
          track.stop();
        });
        video.srcObject = null;
        props.setVideoCall(null);
        setLocalStream(null);
      });
      // peer.peerConnection.onconnectionstatechange = function (event) {
      //   if (event.currentTarget.connectionState === 'disconnected') {
      //   peer.close();
      //   }
      // };
    }
  }, [callSate]);
  // console.log("local", videoRef.current?.getTracks()?.find((track) => track.kind === "audio"));

  return (
    <>
      <div className="fixed top-0 left-0 z-50 h-screen w-screen bg-white block ">
        <div
          className={`absolute ${
            remoteStream
              ? "right-8 bottom-8  z-[2]"
              : "top-0 left-0 w-full h-full"
          } `}
        >
          <video
            ref={videoRef}
            className={`rotate-y-180 ${
              remoteStream ? "w-64 h-48" : "w-full h-full"
            }`}
          />
        </div>
        <div
          className={`absolute top-0 left-0 w-full h-full ${
            remoteStream ? "contents" : "hidden"
          }`}
        >
          <video ref={remoteVideoRef} className=" rotate-y-180 w-full h-full" />
        </div>
        {remoteStream ? (
          <div className="absolute left-1/2 bottom-16 flex items-center gap-3">
            <button
              className="bg-[#F7F3F3] text-white h-7 w-7 flex items-center justify-center rounded-full"
              onClick={() => {
                try {
                  videoRef.current.srcObject.getTracks().forEach((track) => {
                    if (track.kind === "video") {
                      track.enabled = !track.enabled;
                      setIsVideoMuted(!track.enabled);
                    }
                  });
                } catch (error) {}
              }}
            >
              {isVideoMuted ? <MuteVideoIcon /> : <VideoIcon />}
            </button>
            <button
              className="bg-[#F7F3F3] text-white h-7 w-7 flex items-center justify-center rounded-full"
              onClick={() => {
                try {
                  videoRef.current.srcObject.getTracks().forEach((track) => {
                    if (track.kind === "audio") {
                      track.enabled = !track.enabled;
                      setIsAudioMuted(!track.enabled);
                    }
                  });
                } catch (error) {}
              }}
            >
              {isAudioMuted ? <MuteIcon /> : <AudioIcon />}
            </button>
            <button
              className="bg-red-500 text-white h-7 w-7 flex items-center justify-center rounded-full"
              onClick={() => {
                for (let conns in peer.connections) {
                  console.log("conns", conns);
                  peer.connections[conns].forEach((conn, index, array) => {
                    // Manually close the peerConnections b/c peerJs MediaConnect close not called bug: https://github.com/peers/peerjs/issues/636
                    if (conn.peer === remotePeerId) {
                      console.log(
                        `closing ${conn.connectionId} peerConnection (${
                          index + 1
                        }/${array.length})`,
                        conn.peerConnection
                      );
                      conn.peerConnection.close();

                      if (conn.close) {
                        conn.close();
                      }
                    }
                  });
                }
              }}
            >
              <svg
                width="12"
                height="13"
                viewBox="0 0 12 13"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M11.4766 1.90051L9.87913 0.304501C9.68413 0.1095 9.42313 0 9.14713 0C8.87113 0 8.61013 0.108 8.41513 0.304501L6.69462 2.02201C6.49962 2.21701 6.39012 2.47951 6.39012 2.75551C6.39012 3.03301 6.49812 3.29251 6.69462 3.48901L8.03863 4.83452C7.73245 5.5479 7.29253 6.19607 6.74262 6.74403C6.19212 7.29753 5.54861 7.73403 4.83461 8.04303L3.49061 6.69753C3.29561 6.50253 3.0346 6.39303 2.7586 6.39303C2.62247 6.39252 2.4876 6.4192 2.3619 6.47148C2.23621 6.52377 2.12221 6.60062 2.0266 6.69753L0.304593 8.41504C0.109592 8.61004 9.15527e-05 8.87254 9.15527e-05 9.14854C9.15527e-05 9.42604 0.108092 9.68554 0.304593 9.88204L1.9006 11.478C2.2336 11.811 2.6926 12.0016 3.1636 12.0016C3.26111 12.0016 3.35561 11.9941 3.45161 11.9776C5.43761 11.6505 7.40862 10.593 9.00013 9.00304C10.5901 7.41003 11.6461 5.43902 11.9761 3.45151C12.0706 2.88751 11.8816 2.30701 11.4766 1.90051ZM10.9126 3.27301C10.6201 5.04152 9.66913 6.80553 8.23663 8.23804C6.80412 9.67054 5.04161 10.6215 3.27311 10.914C3.0511 10.9515 2.8231 10.8765 2.6611 10.716L1.0936 9.14854L2.7556 7.48503L4.55261 9.28504L4.56611 9.29854L4.89011 9.17854C5.87251 8.81735 6.76462 8.24685 7.50461 7.5066C8.2446 6.76635 8.81478 5.87404 9.17563 4.89152L9.29563 4.56752L7.48362 2.75701L9.14563 1.0935L10.7131 2.66101C10.8751 2.82301 10.9501 3.05101 10.9126 3.27301Z"
                  fill="white"
                />
              </svg>
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full w-full relative bg-black bg-opacity-30">
            <div className="flex items-center justify-center flex-col gap-4 mt-[30%]">
              <h1 className="text-white">
                Calling to {props.otherUser.displayName}
              </h1>
              <div>
                <button
                  className="bg-red-500 text-white px-4 py-2 rounded-full"
                  onClick={() => {
                    try {
                      let video = videoRef.current;
                      video.srcObject.getTracks().forEach((track) => {
                        track.stop();
                      });
                      video.srcObject = null;
                    } catch (error) {}
                    props.setVideoCall(null);
                    setLocalStream(null);
                  }}
                >
                  End Call
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
