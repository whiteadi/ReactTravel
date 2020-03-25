import React from "react";
import "./Tours.css";
import { useTours } from "../travel-context";

const Tours = ({ destination }) => {
  const { tours, loading, error } = useTours(destination);

  const renderToursData = tours => {
    return tours.map((tour, index) => {
      const { START_DATE, RETURN_DATE, PLAN_DATE, PRICE, MAX_PART } = tour;
      return (
        <tr key={index}>
          <td>{START_DATE}</td>
          <td>{RETURN_DATE}</td>
          <td>{PLAN_DATE}</td>
          <td>{PRICE}</td>
          <td>{MAX_PART}</td>
        </tr>
      );
    });
  };

  return (
    <div>
      <h2 id="title">Tours in {destination}</h2>
      <table id="tours">
        <tbody>
          <tr>
            <th>Start date</th>
            <th>Return date</th>
            <th>Number of days</th>
            <th>Price</th>
            <th>Maximum number of people</th>
          </tr>
        </tbody>
        {!loading && !error && tours && <tbody>{renderToursData(tours)}</tbody>}
      </table>
    </div>
  );
};

export default Tours;
