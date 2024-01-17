import logo from "./logo.svg";
import "./App.css";
import axios from "axios";
import React, { useState, useEffect } from "react";
import "./App.css";
function App() {
  const [message, setMessage] = useState("");

  useEffect(() => {
    axios
      // .get("http://127.0.0.1:8000/api/bonjour/")
      .get("http://127.0.0.1:8000/api/capture_packets/")
      .then((response) => {
        console.log("Chargement")
        // Traite la réponse comme nécessaire
        console.log(response);
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  }, []);

  return (
    <div className="App">
      <p>Bonjour je suis l'application React</p>
    </div>
  );
}

export default App;
