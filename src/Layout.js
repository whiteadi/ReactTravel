import React from "react";
import { Switch, Route } from "react-router-dom";
import Programms from "./components/Programms";
import SwaggerTravel from "./components/SwaggerTravel";
import DynamicTables from "./components/DynamicTables";
import Menu from "./components/Menu";

export default function Layout() {
  return (
    <div className="app">
      <div className="app__sidebar">
        <Menu />
      </div>
      <main className="app__content">
        <Switch>
          <Route path="/dynamic" component={DynamicTables} />
          <Route path="/api" component={SwaggerTravel} />
          <Route path="/" component={Programms} />
        </Switch>
      </main>
    </div>
  );
}
