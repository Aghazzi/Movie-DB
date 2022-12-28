const express = require("express");
const app = express();
const port = 3000;

app.get("/test", (req, res) => {
    res.send({ status: 200, message: "ok" });
});

app.get("/time", (req, res) => {
    let date = new Date();
    res.send({
        status: 200,
        message: `${date.getHours()}:${date.getMinutes()}`,
    });
});

app.get("/", (req, res) => {
    res.send("ok");
});

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
});
