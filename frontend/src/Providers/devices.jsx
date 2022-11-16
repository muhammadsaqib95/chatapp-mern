import { useEffect, createContext, useContext, useState } from "react";

const DeviceContext = createContext(null);

export function useDevice() {
  return useContext(DeviceContext);
}

export default function DeviceProvider({ children }) {
    const [device, setDevices] = useState({
        audio: false,
        video: false,
    });
  function updateDeviceList() {
    navigator.mediaDevices.enumerateDevices().then(function (devices) {
      var cam = devices.find(function (device) {
        return device.kind === "videoinput";
      });
      var mic = devices.find(function (device) {
        return device.kind === "audioinput";
      });
        setDevices({
            audio: mic ? true : false,
            video: cam ? true : false,
        });
    });
  }
  useEffect(() => {
    navigator.mediaDevices.ondevicechange = (event) => {
      updateDeviceList();
    };
    updateDeviceList();
  }, []);
  return (
    <DeviceContext.Provider value={{ device }}>
      {children}
    </DeviceContext.Provider>
  );
}
