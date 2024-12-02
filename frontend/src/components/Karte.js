import React, { useEffect, useState } from "react";
import axios from "axios";

export default function Karte() {
  const [pizzas, setPizzas] = useState([]);
  useEffect(() => {
    try {
      axios.get("http://localhost:5030/api/karte").then(response => setPizzas(response.data));
    } catch (err) {
      console.log(err);
    }
  }, []);


  return (
    <>
    {pizzas.map(pizza => (
      <div key={pizza.id}>
        <h2>{pizza.pizza}</h2>
        <p>{pizza.preis}</p>
      </div>
    ))}
    </>
  )
}
