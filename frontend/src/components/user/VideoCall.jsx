import { useEffect, useState, useRef } from "react";

export default function VideoCall(props) {
    const [localStream, setLocalStream] = useState(null);
    const [remoteStream, setRemoteStream] = useState(null);
    const videoRef = useRef(null);

    useEffect(() => {
        navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true,
        }).then((stream) => {
            setLocalStream(stream);
            let video = videoRef.current;
            video.muted = true;
            video.srcObject = stream;
            video.play();
        }
        ).catch((err) => {
            console.log(err);
        }
        );
    }, []);
    console.log(localStream);
    return (
        <>
            <div className="fixed top-0 left-0 z-50 h-screen w-screen bg-white ">
                <div className="absolute top-0 left-0 w-full h-full">
                    <video ref={videoRef} className="w-full h-full" />
                </div>
                <div className="flex items-center justify-center h-full w-full relative bg-black bg-opacity-30">
                    <div className="flex items-center justify-center flex-col gap-4 mt-[30%]">
                        <h1 className="text-white">
                            Calling to {props.otherUser.displayName}
                        </h1>
                        <div>
                            <button className="bg-red-500 text-white px-4 py-2 rounded-full"
                                onClick={() => {
                                    // props.socket.emit("end-call", {
                                    //     to: props.otherUser.socketId,
                                    // });
                                    let video = videoRef.current;
                                    // video.srcObject.getTracks().forEach((track) => {
                                    //     track.stop();
                                    // }
                                    // );
                                    // video.srcObject = null;
                                    video.pause();
                                    video.src = "";
                                    // props.setVideoCall(null);
                                    setLocalStream(null);
                                }
                                }
                            >
                                End Call
                            </button>

                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}
