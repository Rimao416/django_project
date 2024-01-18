import logo from "./logo.svg";
import "./App.css";
import axios from "axios";
import React, { useState, useEffect } from "react";
import "./App.css";

function App() {
  const [ipStats, setIpStats] = useState([]);
  const [protocolStats, setProtocolStats] = useState([]);

  const fetchData = () => {
    axios
      .get("http://127.0.0.1:5000/api/fetchData/")
      .then((response) => {
        console.log("Chargement");
        // Traite la réponse comme nécessaire
        console.log(response);

        // Extrait les adresses IP et compte le nombre d'occurrences
        const ipCounts = response.data.reduce((acc, item) => {
          const sourceIp = item.source_ip;
          acc[sourceIp] = (acc[sourceIp] || 0) + 1;
          return acc;
        }, {});

        // Transforme le résultat en tableau d'objets
        const ipStatsArray = Object.entries(ipCounts).map(([ip, count]) => ({
          ip,
          count,
        }));

        // Trie les adresses IP par fréquence décroissante
        const sortedIpStats = ipStatsArray.sort((a, b) => b.count - a.count);

        // Extrait les protocoles et compte le nombre d'occurrences
        const protocolCounts = response.data.reduce((acc, item) => {
          const protocol = item.protocol;
          acc[protocol] = (acc[protocol] || 0) + 1;
          return acc;
        }, {});

        // Transforme le résultat en tableau d'objets
        const protocolStatsArray = Object.entries(protocolCounts).map(
          ([protocol, count]) => ({
            protocol,
            count,
          })
        );

        // Trie les protocoles par fréquence décroissante
        const sortedProtocolStats = protocolStatsArray.sort(
          (a, b) => b.count - a.count
        );

        // Mise à jour du state avec les adresses IP et protocoles et leurs fréquences
        setIpStats(sortedIpStats);
        setProtocolStats(sortedProtocolStats);
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  };

  useEffect(() => {
    fetchData(); // Appelle fetchData au montage initial
    const intervalId = setInterval(() => {
      fetchData(); // Appelle fetchData toutes les 2 secondes
    }, 2000);

    // Nettoie l'intervalle lorsque le composant est démonté
    return () => clearInterval(intervalId);
  }, []); // Le tableau de dépendances est vide, donc cela s'exécutera uniquement au montage initial

  return (
    <div className="App">
      <h2>Adresses IP les plus fréquentes :</h2>
      <ul>
        {ipStats.map((ipStat) => (
          <li key={ipStat.ip}>
            {ipStat.ip} - {ipStat.count} fois
          </li>
        ))}
      </ul>
      <h2>Protocoles utilisés :</h2>
      <ul>
        {protocolStats.map((protocolStat) => (
          <li key={protocolStat.protocol}>
            {protocolStat.protocol} - {protocolStat.count} fois
            {protocolStat.protocol === "6" && " (TCP)"}
            {protocolStat.protocol === "17" && " (UDP)"}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;