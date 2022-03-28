import * as React from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import { CSVLink } from "react-csv";
import { exampleData } from "./ExampleData.js";

export default function InfoText() {
    const [open, setOpen] = React.useState(false);
    const [scroll, setScroll] = React.useState("paper");

    const handleClickOpen = (scrollType) => () => {
        setOpen(true);
        setScroll(scrollType);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const descriptionElementRef = React.useRef(null);
    React.useEffect(() => {
        if (open) {
            const { current: descriptionElement } = descriptionElementRef;
            if (descriptionElement !== null) {
                descriptionElement.focus();
            }
        }
    }, [open]);

    return (
        <div>
            <Button onClick={handleClickOpen("body")}>Instruktioner</Button>
            <Dialog
                open={open}
                onClose={handleClose}
                scroll={scroll}
                aria-labelledby="scroll-dialog-title"
                aria-describedby="scroll-dialog-description"
            >
                <DialogTitle id="scroll-dialog-title">
                    Instruktioner
                </DialogTitle>
                <DialogContent dividers={scroll === "body"}>
                    <DialogContentText
                        id="scroll-dialog-description"
                        ref={descriptionElementRef}
                        tabIndex={-1}
                    >
                        På den här hemsidan kan du ladda upp anmälningar till
                        eran cykelfest och få ut matchningar.
                    </DialogContentText>
                    <br />
                    <DialogContentText
                        id="scroll-dialog-description"
                        ref={descriptionElementRef}
                        tabIndex={-1}
                    >
                        Det är väldigt viktigt att er CSV-fil är strukturerad
                        korrekt för att algoritmen ska fungera. Algoritmen är
                        inställd att hantera svar ifrån formulär som är
                        strukturerade på ett visst sätt:
                    </DialogContentText>
                    <a
                        href="https://bit.ly/3DirxF6"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        Se detta formulär
                    </a>
                    <br />
                    <br />
                    <DialogContentText
                        id="scroll-dialog-description"
                        ref={descriptionElementRef}
                        tabIndex={-1}
                    >
                        Här kan du ladda ner en fil med exempel data man kan
                        använda som input:
                    </DialogContentText>
                    <CSVLink
                        data={exampleData}
                        filename={"input.csv"}
                        className="downloadButtons"
                    >
                        Example CSV file
                    </CSVLink>
                    <DialogContentText>
                        Kan vara värt att nämna att algoritmen sätter tre
                        grupper ihop för varje måltid. Så en grupp hostar två
                        andra. Om antalet totala grupper inte är jämnt delbara
                        med tre så kommer en eller två grupper aldrig hosta utan
                        bara besöka andra
                    </DialogContentText>
                    <DialogContentText
                        id="scroll-dialog-description"
                        ref={descriptionElementRef}
                        tabIndex={-1}
                    >
                        //Nils
                    </DialogContentText>
                </DialogContent>
            </Dialog>
        </div>
    );
}
