const express = require("express");
const path = require("path");

const app = express();
const PORT = 5121;
const CORE_FOLDER = "core";

app.use("/static", express.static(path.resolve(__dirname, CORE_FOLDER, "static")));
app.get("/*", (req, res) => {
    res.sendFile(path.resolve(CORE_FOLDER, "index.html"));
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));