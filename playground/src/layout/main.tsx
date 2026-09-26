import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import "../../../src/styles/index.css";
import "../playground.css";
import "./layout.css";

import { LayoutDemo } from "./LayoutDemo";

const root = document.getElementById("root");
if (!root) throw new Error("Brak elementu #root w layout.html");

createRoot(root).render(
    <StrictMode>
        <LayoutDemo />
    </StrictMode>,
);
