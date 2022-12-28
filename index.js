const express = require("express");
const app = express();
const port = 3000;
const movies = [
    { title: "Jaws", year: 1975, rating: 8 },
    { title: "Avatar", year: 2009, rating: 7.8 },
    { title: "Brazil", year: 1985, rating: 8 },
    { title: "الإرهاب والكباب", year: 1992, rating: 6.2 },
];

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

app.get("/movies/create", (req, res) => {
    if (!req.query.title) {
        if (!req.query.year) {
            res.send({
                status: 403,
                error: true,
                message:
                    "you cannot create a movie without providing a title and a year",
            });
        } else {
            res.send({
                status: 403,
                error: true,
                message: "you cannot create a movie without providing a title",
            });
        }
    } else if (!req.query.year) {
        res.send({
            status: 403,
            error: true,
            message: "you cannot create a movie without providing a year",
        });
    } else if (req.query.year.length != 4 || isNaN(req.query.year)) {
        if (isNaN(req.query.year)) {
            res.send({
                status: 403,
                error: true,
                message: "The year provided is not a number",
            });
        } else {
            res.send({
                status: 403,
                error: true,
                message: "The year provided is not of 4 digits",
            });
        }
    } else if (
        req.query.year > new Date().getFullYear() ||
        req.query.year < 1895
    ) {
        res.send({
            status: 403,
            error: true,
            message: "The year provided does not exist",
        });
    } else if (
        req.query.rating &&
        (req.query.rating > 10 || req.query.rating < 0)
    ) {
        res.send({
            status: 403,
            error: true,
            message: "The rating provided doesn't exist",
        });
    } else {
        let newMovie = {
            title: req.query.title,
            year: req.query.year,
            rating: req.query.rating,
        };
        movies.push(newMovie);
        res.send({ status: 200, data: movies });
    }
});

app.get("/movies/read", (req, res) => {
    res.send({ status: 200, data: movies });
});

app.get("/movies/read/by-date", (req, res) => {
    res.send({ status: 200, data: movies.sort((a, b) => b.year - a.year) });
});

app.get("/movies/read/by-rating", (req, res) => {
    res.send({ status: 200, data: movies.sort((a, b) => b.rating - a.rating) });
});

app.get("/movies/read/by-title", (req, res) => {
    res.send({
        status: 200,
        data: movies.sort((a, b) => a.title.localeCompare(b.title)),
    });
});

app.get(["/movies/read/id/:id", "/movies/read/id/"], (req, res) => {
    if (req.params.id) {
        if (Number(req.params.id) >= 0 && req.params.id < movies.length) {
            res.send({ status: 200, data: movies[req.params.id] });
        } else {
            res.send({
                status: 404,
                error: true,
                message: `The movie ${req.params.id} does not exist`,
            });
        }
    } else {
        res.send({
            status: 500,
            error: true,
            message: "Write down the ID of the movie please!",
        });
    }
});

app.get("/movies/update", (req, res) => {
    res.send();
});

app.get("/movies/delete", (req, res) => {
    res.send();
});

app.get("/", (req, res) => {
    res.send("ok");
});

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
});
