import express from "express";
import fs from "fs";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json({ limit: "5mb" }));

// Hent CSV
app.get("/books", (req, res) => {
    const csv = fs.readFileSync("books.csv", "utf8");
    res.type("text/csv").send(csv);
});

// Lagre CSV
app.post("/books", (req, res) => {
    const csv = req.body.csv;
    fs.writeFileSync("books.csv", csv, "utf8");
    res.send({ ok: true });
});

// Render krever dette
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log("Server kjører på port " + PORT));
