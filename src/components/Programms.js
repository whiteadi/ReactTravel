import React, { useState } from "react";
import "./Programms.css";
import { useSession } from "../travel-context";
import Tours from "./Tours";

const Programms = () => {
  const [selectedProgramm, setSelectedProgramm] = useState(null);
  const programms = useSession();

  const renderProgrammsData = programms => {
    return programms.map((program, index) => {
      const { DESTINATION, TOUR_TYPE, NUM_DAYS, DESCRIPTION } = program;
      return (
        <tr key={index} onClick={() => setSelectedProgramm(DESTINATION)}>
          <td>{DESTINATION}</td>
          <td>{TOUR_TYPE}</td>
          <td>{NUM_DAYS}</td>
          <td>{DESCRIPTION}</td>
        </tr>
      );
    });
  };

  return (
    <div>
      <h1 id="title">Tour programms</h1>
      <table id="programms">
        <tbody>
          <tr>
            <th>Destination</th>
            <th>Tour Type</th>
            <th>Days</th>
            <th>Info</th>
          </tr>
        </tbody>
        <tbody>{renderProgrammsData(programms)}</tbody>
      </table>
      {selectedProgramm && <Tours destination={selectedProgramm} />}
    </div>
  );
};

export default Programms;
