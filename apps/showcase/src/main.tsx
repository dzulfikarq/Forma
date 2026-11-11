import React from "react";
import ReactDOM from "react-dom/client";
import "@design-templates/tokens/styles.css";
import "@design-templates/ui/styles.css";
import "./showcase.css";
import { App } from "./showcase";

ReactDOM.createRoot(document.getElementById("root")!).render(<React.StrictMode><App /></React.StrictMode>);
