import logo from "./logo.svg";
import "./App.css";
import axios from "axios";
import React, { useState, useEffect } from "react";
import "./App.css";
function App() {
  const [packetInfo, setPacketInfo] = useState([]);
  console.log(window.location.host)

  useEffect(() => {
    // const socket = new WebSocket('ws://' + window.location.host + '/ws/packet_info/');;
    const socket = new WebSocket('ws://' + 'localhost:8000' + '/ws/packet_info/');

    socket.onmessage = function (event) {
      const receivedPacketInfo = JSON.parse(event.data)['packet_info'];
      setPacketInfo(prevPacketInfo => [...prevPacketInfo, receivedPacketInfo]);
    };

    return () => {
      socket.close();
    };
  }, []);

  return (
    <div>
      <h1>Packet Information</h1>
      <ul>
        {packetInfo.map((info, index) => (
          <li key={index}>{info}</li>
        ))}
      </ul>
    </div>
  );
};


export default App;
