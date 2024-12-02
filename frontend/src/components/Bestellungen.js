import React, { useEffect, useState } from "react";
import axios from "axios";

export default function Bestellungen() {
    const [bestellungen, setBestellungen] = useState([]);
    useEffect(() => {
      try {
        axios.get("http://localhost:5030/api/bestellungen").then(response => setBestellungen(response.data));
      } catch (err) {
        console.log(err);
      }
    }, []);
  
  
    return (
      <>
      {bestellungen.map(bestellung => (
        <div key={bestellung.id}>
          <h2>{bestellung.bestellung}</h2>
          <p>{bestellung.gesamtpreis}</p>
          <p>{bestellung.bestellt_am}</p>
        </div>

      ))}
      </>
    )
}
