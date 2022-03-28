import { useEffect, useState } from "react";
import { CSVLink } from "react-csv";
import Generator from "./components/Generator.js";
import Button from "@mui/material/Button";
import "./App.css";
import { CircularProgress } from "@mui/material";
import InfoText from "./components/InfoText.js";

export default function CsvReader() {
    const [csvFile, setCsvFile] = useState();
    const [isFile, setIsFile] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [fileContents, setFileContents] = useState([]);
    const [csvData, setCsvData] = useState(null);

    useEffect(() => {
        download();
    }, [isFile]);

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
        setIsSubmitted(true);
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
            console.log("Finished generating");
            setCsvData(our_result);
            setIsSubmitted(true);
        }
    };

    return (
        <div className="appBody">
            <InfoText />
            <div className="container">
                <h2>Ladda upp din CSV-fil här så generar vi ett resultat</h2>
                <form id="csv-form" className="cykelForm">
                    <label className="custom-file-upload">
                        <input
                            type="file"
                            accept=".csv"
                            id="csvFile"
                            onChange={(e) => {
                                console.log("setting stuff");
                                setCsvFile(e.target.files[0]);
                            }}
                        />
                        Ladda upp
                    </label>
                    {isSubmitted ? (
                        <div>
                            {csvData ? (
                                <div>
                                    <p>
                                        Här är dina genererade filer. Klicka för
                                        att ladda ner
                                    </p>
                                    <CSVLink
                                        data={csvData[0]}
                                        filename={"appetizer.csv"}
                                        className="downloadButtons"
                                    >
                                        Appetizers.csv
                                    </CSVLink>
                                    <CSVLink
                                        data={csvData[1]}
                                        filename={"maincourse.csv"}
                                        className="downloadButtons"
                                    >
                                        MainCourses.csv
                                    </CSVLink>
                                    <CSVLink
                                        data={csvData[2]}
                                        filename={"dessert.csv"}
                                        className="downloadButtons"
                                    >
                                        Desserts.csv
                                    </CSVLink>
                                </div>
                            ) : (
                                <div>
                                    Laddar...
                                    <CircularProgress />
                                </div>
                            )}
                        </div>
                    ) : (
                        <Button
                            variant="contained"
                            onClick={(e) => {
                                e.preventDefault();
                                if (csvFile) {
                                    submit();
                                }
                            }}
                        >
                            Submit
                        </Button>
                    )}
                </form>
            </div>
        </div>
    );
}
