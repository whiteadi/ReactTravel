import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useMemo,
  useCallback
} from "react";
import { API_URL, API_USERNAME, API_PASSWORD } from "./constants";

let headers = new Headers();
headers.set(
  "Authorization",
  "Basic " + btoa(API_USERNAME + ":" + API_PASSWORD)
);

let initValue = [];
const Context = createContext(initValue);

let globalSetSession = () => {
  throw new Error(
    "Provider for session service is not mounted. Did you forget to wrap you app in session Provider?"
  );
};

export const Provider = ({ children }) => {
  const [session, setSession] = useState(initValue);
  const [hasConsumer, setHasConsumer] = useState(false);
  globalSetSession = setSession;

  useEffect(() => {
    if (hasConsumer) {
      headers.set("Accept", "application/json");
      fetch(`${API_URL}/programms`, {
        method: "GET",
        headers: headers
      })
        .then(response => {
          if (!response.ok) {
            setSession(response.statusText);
          }

          return response;
        })
        .then(response => response.json())
        .then(programms => setSession(programms));
    }
  }, [hasConsumer]);

  const value = useMemo(() => {
    return [session, hasConsumer ? () => {} : setHasConsumer];
  }, [session, hasConsumer]);

  return <Context.Provider value={value}>{children}</Context.Provider>;
};

export const useSession = () => {
  const [value, setHasConsumer] = useContext(Context);
  useEffect(() => setHasConsumer(true), [setHasConsumer]);
  return value;
};

export const useTours = destination => {
  const [tours, setTours] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  useEffect(() => {
    const fetchData = async () => {
      setIsError(false);
      setIsLoading(true);
      try {
        const urlString = `${API_URL}/toursbydestination/${destination}`;
        const url = new URL(urlString);
        headers.set("Accept", "application/json");
        let response = await fetch(url, {
          method: "GET",
          headers: headers
        });
        let data = await response.json();
        setTours(data);
      } catch (error) {
        setIsError(true);
      }
      setIsLoading(false);
    };
    fetchData();
  }, [destination]);

  return { tours, isLoading, isError };
};

export const useTables = tableName => {
  const [data, setTableData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);

  const addRow = useCallback(async (row, tableName) => {
    try {
      const urlString = `${API_URL}Tables/travel/${tableName}`;
      const url = new URL(urlString);
      const rowData = row.reduce((columns, pair) => {
        return columns.concat(
          Object.keys(pair)[0],
          '="',
          Object.values(pair)[0],
          '" '
        );
      }, "");
      const newRow = `<${tableName} ${rowData} />`;
      headers.set("Content-Type", "text/xml");
      headers.set("Accept", "application/xml");
      let response = await fetch(url, {
        method: "POST",
        headers: headers,
        body: newRow
      });
      if (response.status !== 201) {
        const body = await response.text();
        alert(body);
        return false;
      }
      return true;
    } catch (error) {
      alert(error);
      return false;
    }
  });

  const deleteRow = useCallback(async (tableName, pks) => {
    try {
      const urlString = `${API_URL}Tables/travel/${tableName}${pks}`;
      const url = new URL(urlString);
      let response = await fetch(url, {
        method: "DELETE",
        headers: headers
      });
      if (response.status === 409) {
        const body = await response.text();
        alert(body);
        return false;
      }
      return true;
    } catch (error) {
      alert(error);
      return false;
    }
  });

  const updateRow = useCallback(async (pks, column, value, tableName) => {
    try {
      const urlString = `${API_URL}Tables/travel/${tableName}${pks}`;
      const url = new URL(urlString);
      const update = `<${tableName} ${column}="${value}"/>`;
      headers.set("Content-Type", "text/xml");
      let response = await fetch(url, {
        method: "PUT",
        headers: headers,
        body: update
      });
      if (response.status !== 200) {
        const body = await response.text();
        alert(body);
        return false;
      }
      return true;
    } catch (error) {
      alert(error);
      return false;
    }
  });

  useEffect(() => {
    const fetchData = async () => {
      setIsError(false);
      setIsLoading(true);
      try {
        const urlString = `${API_URL}Tables/travel/${tableName}`;
        const url = new URL(urlString);
        headers.set("Accept", "application/json");
        let response = await fetch(url, {
          method: "GET",
          headers: headers
        });
        let data = await safeParseJSON(response);
        setTableData(data[tableName]);
      } catch (error) {
        setIsError(true);
      }
      setIsLoading(false);
    };
    fetchData();
  }, [tableName, updateRow, deleteRow, addRow]);

  return { data, isLoading, isError, updateRow, deleteRow, addRow };
};

const safeParseJSON = async response => {
  const body = await response.text();
  try {
    return JSON.parse(body);
  } catch (err) {
    console.error("Error:", err);
    console.error("Response body:", body);
    // throw err;
    return err.message;
  }
};
