import React, { useEffect, useState } from "react";
import axios from "axios";

export default function Zutaten() {
    const [zutaten, setZutaten] = useState([]);
    useEffect(() => {
      try {
        axios.get("http://localhost:5030/api/zutaten").then(response => setZutaten(response.data));
      } catch (err) {
        console.log(err);
      }
    }, []);
  
  
    return (
      <>
      {zutaten.map(zutat => (
        <div key={zutat.id}>
          <h2>{zutat.zutat}</h2>
          <p>{zutat.preis}</p>
          <p>{zutat.anzahl}</p>
        </div>
      ))}
      </>
    )
}
