import React, { useState } from "react";
import ContentEditable from "react-contenteditable";
import { confirmAlert } from "react-confirm-alert";
import "react-confirm-alert/src/react-confirm-alert.css";
import _ from "lodash";

import "./Tables.css";
import { useTables } from "../travel-context";

const disableNewlines = event => {
  const keyCode = event.keyCode || event.which;

  if (keyCode === 13) {
    event.returnValue = false;
    if (event.preventDefault) event.preventDefault();
  }
};

const validateNumber = event => {
  const keyCode = event.keyCode || event.which;
  const string = String.fromCharCode(keyCode);
  const regex = /[0-9,]|\./;

  if (!regex.test(string)) {
    event.returnValue = false;
    if (event.preventDefault) event.preventDefault();
  }
};

const pasteAsPlainText = event => {
  event.preventDefault();

  const text = event.clipboardData.getData("text/plain");
  document.execCommand("insertHTML", false, text);
};

const highlightAll = () => {
  setTimeout(() => {
    document.execCommand("selectAll", false, null);
  }, 0);
};

const Tables = ({ tableName, columns, pks }) => {
  const { data, loading, error, updateRow, deleteRow, addRow } = useTables(
    tableName
  );
  const [newRow, setNewRow] = useState([]);
  const [updatedRow, setUpdateRow] = useState({});

  const columnNames = columns.map(col => Object.keys(col)[0]);

  const getType = value =>
    Object.values(columns.find(obj => Object.keys(obj)[0] === value))[0].TYPE;

  const isMandatory = value =>
    Object.values(columns.find(obj => Object.keys(obj)[0] === value))[0]
      .MANDATORY === "Y";

  const isInputAllowed = value =>
    Object.values(columns.find(obj => Object.keys(obj)[0] === value))[0]
      .INPUT_ALLOWED === "Y";

  const mandatoryColumns = _.filter(columnNames, column => isMandatory(column));

  const deleteARow = pkValues => {
    confirmAlert({
      title: "Confirm to delete",
      message: `Delete ${pkValues}?`,
      buttons: [
        {
          label: "Yes",
          onClick: () => deleteRow(tableName, pkValues)
        },
        {
          label: "No",
          onClick: () => {}
        }
      ]
    });
  };

  const addARow = () => {
    const trimSpaces = string => {
      return string
        .replace(/&nbsp;/g, "")
        .replace(/&amp;/g, "&")
        .replace(/&gt;/g, ">")
        .replace(/&lt;/g, "<");
    };
    const trimmedRow = newRow.map(row => {
      const columnName = Object.keys(row)[0];
      const value = trimSpaces(Object.values(row)[0]);
      if (isInputAllowed(columnName)) {
        return { [columnName]: value };
      } else {
        return null;
      }
    });

    const allMandatoryFields = _.filter(mandatoryColumns, column =>
      _.isNil(_.find(newRow, row => !_.isNil(row[column])))
    );

    if (allMandatoryFields.length > 0) {
      const columnsNull = _.join(allMandatoryFields, ", ");
      alert(`You must provide value(s) for mandatory field(s): ${columnsNull}`);
    } else {
      addRow(_.compact(trimmedRow), tableName);
    }
  };

  const handleContentEditableUpdate = event => {
    const {
      currentTarget: {
        dataset: { row, column }
      },
      target: { value }
    } = event;

    const existing = _.find(
      updatedRow[row],
      rowPair => Object.keys(rowPair)[0] === column
    );

    let tempRow = [];

    if (existing) {
      tempRow = updatedRow[row].map(pair => {
        if (Object.keys(pair)[0] === column) {
          return { [column]: value };
        } else {
          return pair;
        }
      });
    } else {
      const existingValues = updatedRow[row] || [];
      tempRow = existingValues.concat({ [column]: value });
    }

    setUpdateRow({ [row]: tempRow });
  };

  const updateARow = pkValues => {
    if (updatedRow[pkValues] && updatedRow[pkValues].length > 0) {
      updateRow(pkValues, updatedRow[pkValues], tableName);
    } else {
      alert("No values changed for this row!");
    }
  };

  const handleContentEditable = event => {
    const {
      currentTarget: {
        dataset: { column }
      },
      target: { value }
    } = event;

    const existing = _.find(
      newRow,
      rowPair => Object.keys(rowPair)[0] === column
    );

    let row = [];

    if (existing) {
      row = newRow.map(pair => {
        if (Object.keys(pair)[0] === column) {
          return { [column]: value };
        } else {
          return pair;
        }
      });
    } else {
      row = newRow.concat({ [column]: value });
    }

    setNewRow(row);
  };

  const getMePKValues = (row, pks) => {
    return Object.keys(row).reduce((values, column) => {
      if (pks.includes(column)) {
        return values.concat(";", column, "=", row[column]);
      } else {
        return values;
      }
    }, "");
  };

  const renderTableData = data => {
    const numTypes = ["NUMBER", "INTEGER"];
    return data.map((row, index) => {
      const pkValues = getMePKValues(row, pks);
      return (
        <tr key={index}>
          {columnNames.map((value, i) => (
            <ContentEditable
              html={
                updatedRow[pkValues] &&
                updatedRow[pkValues].length > 0 &&
                _.find(updatedRow[pkValues], pair => {
                  return Object.keys(pair)[0] === value;
                })
                  ? Object.values(
                      _.find(updatedRow[pkValues], pair => {
                        return Object.keys(pair)[0] === value;
                      }) || { x: "" }
                    )[0]
                  : (row[value] || "").toString()
              }
              data-column={value}
              data-row={pkValues}
              disabled={pks && pks.includes(value)}
              className="content-editable"
              key={i}
              tagName="td"
              onKeyPress={
                numTypes.includes(getType(value))
                  ? validateNumber
                  : disableNewlines
              }
              onPaste={pasteAsPlainText}
              onFocus={highlightAll}
              onChange={handleContentEditableUpdate}
            />
          ))}
          <td>
            <button onClick={() => updateARow(pkValues)}>Update row</button>
          </td>
          <td>
            <button onClick={() => deleteARow(pkValues)}>Delete</button>
          </td>
        </tr>
      );
    });
  };

  const renderColumnsName = columns =>
    columns.map(columnName => <th key={columnName}>{columnName}</th>);

  const renderAdd = () => {
    const numTypes = ["NUMBER", "INTEGER"];
    const pkValues = getMePKValues(data[0], pks);
    return (
      <tr>
        {columnNames.map((value, i) => (
          <ContentEditable
            html={
              newRow && newRow.length > 0
                ? Object.values(
                    _.find(newRow, pair => {
                      return Object.keys(pair)[0] === value;
                    }) || { x: "" }
                  )[0]
                : ""
            }
            data-column={value}
            data-row={pkValues}
            disabled={!isInputAllowed(value)}
            className="content-editable"
            key={i}
            tagName="td"
            onKeyPress={
              numTypes.includes(getType(value))
                ? validateNumber
                : disableNewlines
            }
            onPaste={pasteAsPlainText}
            onFocus={highlightAll}
            onChange={handleContentEditable}
          />
        ))}
        <td>
          <button onClick={() => addARow()}>Add</button>
        </td>
      </tr>
    );
  };

  return (
    <div>
      <h2 id="title">Data from {tableName}</h2>
      <table id="tables">
        {typeof loading !== undefined &&
          !loading &&
          typeof error !== undefined &&
          !error &&
          !!columns && (
            <tbody>
              <tr>{renderColumnsName(columnNames)}</tr>
            </tbody>
          )}
        {typeof loading !== undefined &&
          !loading &&
          typeof error !== undefined &&
          !error &&
          data &&
          typeof data !== undefined &&
          Object.keys(data).length !== 0 && (
            <tbody>{renderTableData(data)}</tbody>
          )}
        {typeof loading !== undefined &&
          !loading &&
          typeof error !== undefined &&
          !error &&
          data &&
          typeof data !== undefined &&
          Object.keys(data).length !== 0 && <tbody>{renderAdd()}</tbody>}
      </table>
    </div>
  );
};

export default Tables;
