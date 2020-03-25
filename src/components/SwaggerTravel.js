import React from "react";
import SwaggerUI from "swagger-ui-react";
import "swagger-ui-react/swagger-ui.css";

const SwaggerTravel = () => <SwaggerUI url="http://localhost:3000/api.json" />;

export default SwaggerTravel;
