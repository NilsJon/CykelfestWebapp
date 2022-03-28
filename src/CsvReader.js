import { useState } from "react";
import { CSVLink, CSVDownload } from "react-csv";
import Generator from "./Generator.js";

export default function CsvReader() {
    const [csvFile, setCsvFile] = useState();
    const [isFile, setIsFile] = useState(false);
    const [fileContents, setFileContents] = useState([]);
    const [appetizersData, setAppetizersData] = useState(null);

    const processCSV = (str, delim = ",") => {
        const headers = str.slice(0, str.indexOf("\n")).split(delim);
        const rows = str.slice(str.indexOf("\n") + 1).split("\n");
        let result = [];
        for (var i = 0; i < rows.length; i++) {
            let split = rows[i].match(/(".*?"|[^",]+)(?=\s*,|\s*$)/g);
            if (split != null) {
                result.push(split);
            }
        }
        setFileContents(result);
        setIsFile(true);
    };

    const submit = () => {
        const file = csvFile;
        const reader = new FileReader();

        reader.onload = function (e) {
            const text = e.target.result;
            //console.log(text);
            processCSV(text);
        };

        reader.readAsText(file);
    };

    const download = () => {
        if (isFile) {
            const our_result = Generator(fileContents);
            console.log(our_result[0]);
            setAppetizersData(our_result[0]);
        }
    };

    return (
        <form id="csv-form">
            <input
                type="file"
                accept=".csv"
                id="csvFile"
                onChange={(e) => {
                    setCsvFile(e.target.files[0]);
                }}
            ></input>
            <br />
            <button
                onClick={(e) => {
                    e.preventDefault();
                    console.log("Submitted");
                    if (csvFile) submit();
                }}
            >
                Submit
            </button>
            <button
                onClick={(e) => {
                    e.preventDefault();
                    download();
                }}
            >
                Create Downloads
            </button>
            {appetizersData ? (
                <CSVLink data={appetizersData}>Download me</CSVLink>
            ) : null}

            <br />
            <br />
        </form>
    );
}
