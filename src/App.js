import React from "react";
import CsvReader from "./CsvReader";
import "./App.css";

const App = () => {
    return (
        <div className="app">
            <h1>Cykelfest</h1>
            <CsvReader />
        </div>
    );
};

export default App;
