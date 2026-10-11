import { Router } from 'express';
import { ApiResponse } from './index.js';

const app = Router();

const tasks = new Map();

/* ---- CREATE A TASK -------- */
app.post('/', (req, res) => {
    try {
        const { id, title, description } = req.body;
        if (!id || !title || !description) {
            return res.status(400).json(new ApiResponse({ statusCode: 400, message: "Bad Request", data: "Missing required fields" }));
        }

        if (tasks.has(id)) {
            return res.status(409).json(new ApiResponse({ statusCode: 409, message: "Conflict", data: "Task with this ID already exists" }));
        }

        const task = { id, title, description };
        tasks.set(id, task);

        return res.status(201).json(new ApiResponse({ statusCode: 201, message: "Task created successfully", data: task }));
    } catch (error) {
        return res.status(500).json(new ApiResponse({ statusCode: 500, message: "Internal Server Error", data: error.message }));
    }
})

/* ---- GET ALL TASKS -------- */
app.get('/', (req, res) => {
    try {
        const allTasks = Array.from(tasks.values());
        return res.status(200).json(new ApiResponse({ statusCode: 200, message: "Tasks retrieved successfully", data: allTasks }));
    } catch (error) {
        return res.status(500).json(new ApiResponse({ statusCode: 500, message: "Internal Server Error", data: error.message }));
    }
})

/* ---- GET A TASK BY ID -------- */
app.get('/:id', (req, res) => {
    try {
        const { id } = req.params;
        if (!tasks.has(id)) {
            return res.status(404).json(new ApiResponse({ statusCode: 404, message: "Not Found", data: "Task not found" }));
        }
        const task = tasks.get(id);
        return res.status(200).json(new ApiResponse({ statusCode: 200, message: "Task retrieved successfully", data: task }));
    } catch (error) {
        return res.status(500).json(new ApiResponse({ statusCode: 500, message: "Internal Server Error", data: error.message }));
    }
});

/* ---- Replace A TASK BY ID -------- */
app.put('/:id', (req, res) => {
    try {
        const { id } = req.params;
        const { title, description } = req.body;
        if (!tasks.has(id)) {
            return res.status(404).json(new ApiResponse({ statusCode: 404, message: "Not Found", data: "Task not found" }));
        }
        const task = tasks.get(id);
        task.title = title;
        task.description = description;
        tasks.set(id, task);
        return res.status(200).json(new ApiResponse({ statusCode: 200, message: "Task updated successfully", data: task }));
    } catch (error) {
        return res.status(500).json(new ApiResponse({ statusCode: 500, message: "Internal Server Error", data: error.message }));
    }
});

/* ---- UPDATE A TASK BY ID -------- */
app.patch('/:id', (req, res) => {
    try {
        const { id } = req.params;
        const { title, description } = req.body;
        if (!tasks.has(id)) {
            return res.status(404).json(new ApiResponse({ statusCode: 404, message: "Not Found", data: "Task not found" }));
        }
        const task = tasks.get(id);
        if (title) {
            task.title = title;
        }
        if (description) {
            task.description = description;
        }
        tasks.set(id, task);
        return res.status(200).json(new ApiResponse({ statusCode: 200, message: "Task updated successfully", data: task }));
    } catch (error) {
        return res.status(500).json(new ApiResponse({ statusCode: 500, message: "Internal Server Error", data: error.message }));
    }
});

/* ---- DELETE A TASK BY ID -------- */
app.delete('/:id', (req, res) => {
    try {
        const { id } = req.params;
        if (!tasks.has(id)) {
            return res.status(404).json(new ApiResponse({ statusCode: 404, message: "Not Found", data: "Task not found" }));
        }
        tasks.delete(id);
        return res.status(200).json(new ApiResponse({ statusCode: 200, message: "Task deleted successfully" }));
    } catch (error) {
        return res.status(500).json(new ApiResponse({ statusCode: 500, message: "Internal Server Error", data: error.message }));
    }
});

export default app;