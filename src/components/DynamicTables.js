import React, { useState } from "react";
import _ from "lodash";
import Tables from "./Tables";
import jsonData from "../tables.json";

const getPks = data => {
  const columnNames = Object.keys(data);
  const pks = columnNames.map(column => {
    if (data[column].PK === "Y") {
      return column;
    } else {
      return null;
    }
  });
  return _.filter(pks, function(o) {
    return o !== null;
  });
};

const getColumns = data => {
  const columnNames = Object.keys(data);
  const types = columnNames.map(column => {
    return {
      [column]: {
        TYPE: data[column].TYPE,
        FK: data[column].FK,
        MANDATORY: data[column].MANDATORY,
        INPUT_ALLOWED: data[column].INPUT_ALLOWED
      }
    };
  });
  return types;
};

const DynamicTables = () => {
  const [tableName, setTableName] = useState(null);
  const [tableColumns, setTableColumns] = useState([]);
  const [tablePK, setTablePK] = useState(null);

  const change = event => {
    if (event.target.value) {
      setTableName(event.target.value);
      setTableColumns(getColumns(jsonData[event.target.value]));
      setTablePK(getPks(jsonData[event.target.value]));
    }
  };

  return (
    <>
      {jsonData && Object.keys(jsonData).length > 0 && (
        <select id="tables" onChange={change}>
          <option value="">Select a table</option>
          {Object.keys(jsonData).map(tableName => (
            <option value={tableName}>{tableName}</option>
          ))}
        </select>
      )}
      {tableName && tableColumns && (
        <Tables tableName={tableName} columns={tableColumns} pks={tablePK} />
      )}
    </>
  );
};

export default DynamicTables;
