const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
TOKEN_KEY = "killtareq";
const movieSchema = new mongoose.Schema({
    title: String,
    year: Number,
    rating: Number,
});
bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const users = [
    {
        username: "faten",
        password:
            "$2a$10$oTRh5oBwSyrnWs9OD0mPoujgqrMbyAeS5thIxYe6xR1LpM00YP6aW",
    },
    {
        username: "tareq",
        password:
            "$2a$10$RjXp.S0T3d0j51hklOo5p.eUJSVYac4pAjPTU91Ypk91M27oQyvWi",
    },
    {
        username: "ahmad",
        password:
            "isba$2a$10$DQ9XlKLoAPGMV1GPSo.uj.hg9WduAQUU893UIR8UtlLJBWYavzXHGtata",
    },
];

// Link in READMELINK
const URI =
    "mongodb+srv://user:123456ag@cluster0.muots9r.mongodb.net/user?retryWrites=true&w=majority";

const Movie = mongoose.model("Movie", movieSchema);
mongoose.connect(URI, { useNewUrlParser: true }, (err) => {
    if (err) throw err;
    console.log("You've been connected successfully");
});
const verifyToken = (req, res, next) => {
    let token;
    if (!token) {
        token = req.cookies["access-token"];
    }

    if (!token) {
        return res.status(403).send("A token is required for authentication");
    }

    try {
        const decoded = jwt.verify(token, TOKEN_KEY);
        req.user = decoded;
    } catch (err) {
        return res.status(401).send("Invalid Token");
    }

    return next();
};
const app = express();
const port = 3000;

app.use(express.json());
app.use(cookieParser());

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

app.post("/movies/create", verifyToken, async (req, res) => {
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

app.patch("/movies/update/:id?", verifyToken, async (req, res) => {
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

app.delete(
    ["/movies/delete/:id", "/movies/delete"],
    verifyToken,
    (req, res) => {
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
    }
);

app.get("/users/read", (req, res) => {
    res.status(200).send({
        status: 200,
        data: users.map((user) => {
            return user.username;
        }),
    });
});

app.post("/users/create", async (req, res) => {
    if (!req.query.username) {
        if (!req.query.password) {
            res.status(403).send({
                status: 403,
                error: true,
                message:
                    "You can't create a new user without entering a username and a password",
            });
        } else {
            res.status(403).send({
                status: 403,
                error: true,
                message:
                    "You can't create a new user without entering a username",
            });
        }
    } else if (!req.query.password) {
        res.status(403).send({
            status: 403,
            error: true,
            message: "You can't create a new user without entering a password",
        });
    } else if (
        users.map((user) => user.username).includes(req.query.username)
    ) {
        res.status(403).send({
            status: 403,
            error: true,
            message: "The username already exists",
        });
    } else {
        let password = req.query.password;
        let encryptedPassword = await bcrypt.hash(password, 10);
        let user = {
            username: req.query.username,
            password: encryptedPassword,
        };

        users.push(user);

        res.status(200).send({
            status: 200,
            data: users.map((user) => {
                return user;
            }),
        });
    }
});

app.delete(
    ["/users/delete/:username/:password", "/users/delete"],
    (req, res) => {
        if (req.params.username && req.params.password) {
            let nbOfUsers = users.length;
            users.map((user, index) => {
                if (user.username === req.params.username) {
                    if (user.password === req.params.password) {
                        users.splice(index, 1);
                        res.status(200).send({
                            status: 200,
                            data: users.map((user) => {
                                return user.username;
                            }),
                        });
                    } else {
                        res.status(404).send({
                            status: 404,
                            error: true,
                            message: `username and password do not match`,
                        });
                        nbOfUsers--;
                    }
                }
            });
            if (nbOfUsers === users.length) {
                res.status(404).send({
                    status: 404,
                    error: true,
                    message: `The user doesn't exist`,
                });
            }
        } else {
            res.status(404).send({
                status: 404,
                error: true,
                message: `Enter the username and the password of the user you want to delete`,
            });
        }
    }
);

app.put(
    [
        "/users/update",
        "/users/update/:username",
        "/users/update/:password",
        "/users/update/:username/:password",
    ],
    (req, res) => {
        if (req.params.username && req.params.password) {
            if (!req.query.newusername && !req.query.newpassword) {
                res.status(404).send({
                    status: 404,
                    error: true,
                    message: `Enter the new data you want to update`,
                });
            } else {
                let newUser = {
                    username: `${req.query.newusername || req.params.username}`,
                    password: `${req.query.newpassword || req.params.password}`,
                };

                let changed = false;

                users.map((user, index) => {
                    if (user.username === req.params.username) {
                        if (user.password === req.params.password) {
                            users.splice(index, 1, newUser);
                            res.status(200).send({
                                status: 200,
                                data: newUser,
                            });
                            changed = true;
                        } else {
                            res.status(404).send({
                                status: 404,
                                error: true,
                                message: `username and password do not match`,
                            });
                        }
                    }
                });
                if (!changed) {
                    res.status(404).send({
                        status: 404,
                        error: true,
                        message: `can not find the username`,
                    });
                }
            }
        } else {
            res.status(404).send({
                status: 404,
                error: true,
                message: `Enter the username and password of the user you want to update`,
            });
        }
    }
);

app.post("/users/login", async (req, res) => {
    const { username, password } = req.body;
    if (username && password) {
        let user = users.find((u) => u.username == username);
        if (user && (await bcrypt.compare(password, user.password))) {
            const token = jwt.sign({ user_id: user.username }, TOKEN_KEY, {
                expiresIn: "2h",
            });
            user.token = token;
            res.cookie("access-token", token, {
                maxAge: 2 * 60 * 60 * 1000,
                httpOnly: true,
            });
            res.send({ status: 200, message: "logged in", data: user });
        } else {
            res.send("please check your info");
        }
    } else {
        res.send("please provide both username and password");
    }
});

app.get("/", (req, res) => {
    res.send("ok");
});

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
});
