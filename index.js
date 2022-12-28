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

app.get(["/hello", "/hello/:id"], (req, res) => {
    res.send({
        status: 200,
        message: `Hello, ${req.params.id || "Unspecified"}`,
    });
});

app.get("/search", (req, res) => {
    if (req.query.s) {
        res.send({ status: 200, message: "ok", data: `${req.query.s}` });
    } else {
        res.send({
            status: 500,
            error: true,
            message: "you have to provide a search",
        });
    }
});

app.get("/", (req, res) => {
    res.send("ok");
});

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
});
