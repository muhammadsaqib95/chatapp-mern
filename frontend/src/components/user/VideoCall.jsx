import { useEffect, useState, useRef } from "react";
import { useSocket } from "../../Providers/socket";
import { useNotification } from "../AppNotification/NotificationProvider";
import { usePeer } from "../../Providers/peer";

export default function VideoCall(props) {
  const notification = useNotification();
  const { socket } = useSocket();
  const { peer } = usePeer();
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [callSate, setCallState] = useState(null);
  const [remotePeerId, setRemotePeerId] = useState(null);
  const videoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  useEffect(() => {
    socket.emit("call-user", { to: props.otherUser._id, from: props.from });
    navigator.mediaDevices
      .getUserMedia({
        video: true,
        audio: true,
      })
      .then((stream) => {
        setLocalStream(stream);
        let video = videoRef.current;
        video.muted = true;
        video.srcObject = stream;
        video.play();
      })
      .catch((err) => {
        console.log(err);
      });
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
    socket.on("call-accepted", async(data) => {
      setRemotePeerId(data.peer);
      // console.log('remote',data.peer);
      // console.log('local',peer.id);
      navigator.mediaDevices
      .getUserMedia({
        video: true,
        audio: true,
      })
      .then((stream) => {
        setLocalStream(stream);

      var call =  peer.call(data.peer, stream);
      setCallState(call);
      })
      .catch((err) => {
        console.log(err);
      }
      );
      
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
  console.log("local", callSate);


  return (
    <>
      <div className="fixed top-0 left-0 z-50 h-screen w-screen bg-white block ">
        <div className={`absolute ${remoteStream ? 'right-8 bottom-8 ' :"top-0 left-0 w-full h-full"} `}>
          <video ref={videoRef} className={`${remoteStream ? 'w-36 h-48' :"w-full h-full"}`} />
        </div>
          <div className={`absolute top-0 left-0 w-full h-full ${remoteStream ? 'contents' : 'hidden'}`}>
            <video ref={remoteVideoRef} className="w-full h-full" />
          </div>
          {
            remoteStream ? <div className="absolute left-1/2 bottom-16 ">
              <button 
              className="bg-red-500 text-white px-4 py-2 rounded-full"
              onClick={() => {
                for (let conns in peer.connections) {
                  console.log('conns',conns);
                  peer.connections[conns].forEach((conn, index, array) => {
                    // console.log('conn',conn, index, array);
      
                      // Manually close the peerConnections b/c peerJs MediaConnect close not called bug: https://github.com/peers/peerjs/issues/636
                      if (conn.peer === remotePeerId) {
                          console.log(`closing ${conn.connectionId} peerConnection (${index + 1}/${array.length})`, conn.peerConnection);
                          conn.peerConnection.close();
      
                          // close it using peerjs methods
                          if (conn.close) {
                              conn.close();
                          }
                      }
                  });
              }
                // callSate.close();

                // let video = videoRef.current;
                // video.srcObject.getTracks().forEach((track) => {
                //   track.stop();
                // });
                // video.srcObject = null;
                // props.setVideoCall(null);
                // setLocalStream(null);
              }}>End Call</button>
            </div>
            :
        <div className="flex items-center justify-center h-full w-full relative bg-black bg-opacity-30">
          <div className="flex items-center justify-center flex-col gap-4 mt-[30%]">
            <h1 className="text-white">
              Calling to {props.otherUser.displayName}
            </h1>
            <div>
              <button
                className="bg-red-500 text-white px-4 py-2 rounded-full"
                onClick={() => {
                  let video = videoRef.current;
                  video.srcObject.getTracks().forEach((track) => {
                    track.stop();
                  });
                  video.srcObject = null;
                  props.setVideoCall(null);
                  setLocalStream(null);
                }}
              >
                End Call
              </button>
            </div>
          </div>
        </div>
}
      </div>
    </>
  );
}
