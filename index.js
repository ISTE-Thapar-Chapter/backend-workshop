import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";

const app = express();

app.use(express.json());
app.use(cors({
    origin: process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : ["*"],
}))

export class ApiResponse {
    statusCode; message; data;
    constructor({ statusCode = 200, message = "Success", data = null } = {}) {
        this.statusCode = statusCode;
        this.message = message;
        this.data = data;
    }
}

// MAIN PAGE
app.get("/", (req, res) => {
    return res.status(200).json(new ApiResponse({ message: "Welcome to the backend workshop!" }));
});

import tasksRouter from "./tasks.js";

// TASKS PAGE
app.use('/tasks', tasksRouter);

/* Start the server */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});