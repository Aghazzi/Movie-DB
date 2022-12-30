const express = require("express");

const mongoose = require("mongoose");
const movieSchema = new mongoose.Schema({
    title: String,
    year: Number,
    rating: Number,
});

const URI =
    "mongodb+srv://user:123456ag@cluster0.muots9r.mongodb.net/user?retryWrites=true&w=majority";

const Movie = mongoose.model("Movie", movieSchema);
mongoose.connect(URI, { useNewUrlParser: true }, (err) => {
    if (err) throw err;
    console.log("You've been connected successfully");
});

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

app.post("/movies/create", async (req, res) => {
    if (!req.query.title || !req.query.year) {
        res.send({
            status: 403,
            error: true,
            message:
                "you cannot create a movie without providing a title and a year",
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
            rating: `${req.query.rating || 4}`,
        };
        const amovie = new Movie(newMovie);
        const addedMovie = await amovie.save();
        res.send({ status: 201, message: "movie added", data: { addedMovie } });
    }
});

app.get("/movies/read", async (req, res) => {
    const movies = await Movie.find({});
    res.send({ status: 200, data: movies });
});

app.get("/movies/read/by-date", async (req, res) => {
    const movies = await Movie.find({});
    res.send({ status: 200, data: movies.sort((a, b) => b.year - a.year) });
});

app.get("/movies/read/by-rating", async (req, res) => {
    const movies = await Movie.find({});
    res.send({ status: 200, data: movies.sort((a, b) => b.rating - a.rating) });
});

app.get("/movies/read/by-title", async (req, res) => {
    const movies = await Movie.find({});
    res.send({
        status: 200,
        data: movies.sort((a, b) => a.title.localeCompare(b.title)),
    });
});

app.get("/movies/read/id/:id?", async (req, res) => {
    if (req.params.id) {
        const movies = await Movie.find({});
        if (Number(req.params.id) > 0 && req.params.id < movies.length + 1) {
            res.send({ status: 200, data: movies[req.params.id - 1] });
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

app.patch("/movies/update/:id?", async (req, res) => {
    if (req.params.id) {
        const filter = { _id: req.params.id };
        const { title, year, rating } = req.query;
        const update = {};
        if (title) update.title = title;
        if (year && year.toString().length === 4 && !isNaN(year))
            update.year = parseInt(year);
        if (rating && !isNaN(rating) && rating >= 0 && rating <= 10)
            update.rating = parseFloat(rating);
        else if (rating < 0 || rating > 10) {
            return res.status(400).send(`${rating} is not an accepted rating`);
        }
        try {
            const movie = await Movie.findOneAndUpdate(filter, update, {
                new: true,
            });
            if (!movie)
                return res.send({
                    status: 404,
                    error: true,
                    message: `ID:${req.params.id} does not exist`,
                });
            else return res.send({ status: 200, data: movie });
        } catch (err) {
            res.status(500).send(err.message);
        }
    } else {
        return res.send({
            status: 404,
            error: true,
            message: `Enter the id of the movie you'd like to update`,
        });
    }
});

app.delete(["/movies/delete/:id", "/movies/delete"], (req, res) => {
    if (req.params.id) {
        Movie.findOneAndDelete({ _id: req.params.id })
            .then((deletedMovie) => {
                if (!deletedMovie)
                    return res.send({
                        status: 404,
                        error: true,
                        message: `The movie ${req.params.id} does not exist`,
                    });
                Movie.find()
                    .then((movies) => {
                        res.send({ status: 200, data: movies });
                    })
                    .catch((err) => {
                        res.send(err.message);
                    });
            })
            .catch((err) => {
                res.send(err.message);
            });
    } else {
        res.send({
            status: 404,
            error: true,
            message: `Provide the movie ID you'd like to delete`,
        });
    }
});

app.get("/", (req, res) => {
    res.send("ok");
});

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
});
