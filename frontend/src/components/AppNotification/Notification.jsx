import { useState, useEffect } from "react";
import SuccessIcon from "../Icons/SuccessIcon";
import ErrorIcon from "../Icons/ErrorIcon";
import CrossIcon from "../Icons/CrossIcon";

export default function Notification(props) {
  const [exit, setExit] = useState(false);
  const [width, setWidth] = useState(0);
  const [intervalID, setIntervalID] = useState(null);

  const handleStartTimer = () => {
    const id = setInterval(() => {
      setWidth((prev) => {
        if (prev < 100) {
          return prev + 0.5;
        }

        clearInterval(id);
        return prev;
      });
    }, 30);

    setIntervalID(id);
  };

  const handlePauseTimer = () => {
    clearInterval(intervalID);
  };

  const handleCloseNotification = () => {
    handlePauseTimer();
    setExit(true);
    setTimeout(() => {
      props.dispatch({
        type: "REMOVE_NOTIFICATION",
        id: props.id,
      });
    }, 400);
  };

  useEffect(() => {
    if (width === 100) {
      handleCloseNotification();
    }
  }, [width]);

  useEffect(() => {
    handleStartTimer();
  }, []);
  return (
    <>
      <div
        onMouseEnter={handlePauseTimer}
        onMouseLeave={handleStartTimer}
        className={`notification ${exit ? "hidden" : "open"}`}
      >
        <div className="flex items-center gap-2">
          <div
            className="notification-icon"
            style={{
              background: props.type !== "SUCCESS" ? "#F12424" : "#00D263",
            }}
          >
            {props.type !== "SUCCESS" ? <ErrorIcon /> : <SuccessIcon />}
          </div>
          <h1 className=" capitalize text-[13px] font-bold text-[#1d2327]">
            {props.message}
          </h1>
        </div>

        <CrossIcon
          className="w-4 h-4 cursor-pointer mr-1 ml-2"
          fill="#4C5866"
          onClick={handleCloseNotification}
        />
      </div>
    </>
  );
}
