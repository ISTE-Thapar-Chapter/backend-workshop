import { Router } from 'express';
import { ApiResponse } from './index.js';
import Database from 'better-sqlite3';
import path from "node:path";
import { fileURLToPath } from "node:url";

const app = Router();

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const db = new Database(path.join(currentDir, "tasks.db"));

db.exec(`
    CREATE TABLE IF NOT EXISTS tasks (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT NOT NULL
        )
`);

/* ---- CREATE A TASK -------- */
app.post('/', (req, res) => {
    try {
        const { id, title, description } = req.body;
        if (typeof id !== "string" || !id.trim() || typeof title !== "string" || !title.trim() || typeof description !== "string" || !description.trim()) {
            return res.status(400).json(new ApiResponse({ statusCode: 400, message: "Bad Request", data: "Missing required fields" }));
        }

        const existing = db.prepare("SELECT id FROM tasks WHERE id = ?").get(id.trim());

        if (existing) {
            return res.status(409).json(
                new ApiResponse({
                    statusCode: 409,
                    message: "Conflict",
                    data: "Task with this ID already exists."
                })
            )
        }

        const task = { id: id.trim(), title: title.trim(), description: description.trim() };
        db.prepare(`
            INSERT INTO tasks (id, title, description)
            VALUES (?, ?, ?)
            `).run(task.id, task.title, task.description);

        return res.status(201).json(new ApiResponse({ statusCode: 201, message: "Task created successfully", data: task }));
    } catch (error) {
        if (error.code === "SQLITE_CONSTRAINT_PRIMARYKEY") {
            return res.status(409).json(new ApiResponse({ statusCode: 409, message: "Conflict", data: "Task with this ID already exists" }));
        }
        return res.status(500).json(new ApiResponse({ statusCode: 500, message: "Internal Server Error", data: "Could not create task" }));
    }
})

/* ---- GET ALL TASKS -------- */
app.get('/', (req, res) => {
    try {
        const allTasks = db.prepare("SELECT id, title, description FROM tasks ORDER BY rowid").all();
        return res.status(200).json(new ApiResponse({ statusCode: 200, message: "Tasks retrieved successfully", data: allTasks }));
    } catch (error) {
        console.error(error);
        return res.status(500).json(new ApiResponse({ statusCode: 500, message: "Internal Server Error", data: "Could not retrieve tasks" }));
    }
})

/* ---- GET A TASK BY ID -------- */
app.get('/:id', (req, res) => {
    try {
        const task = db.prepare("SELECT id, title, description FROM tasks WHERE id = ?").get(req.params.id);
        if (!task) {
            return res.status(404).json(new ApiResponse({ statusCode: 404, message: "Not Found", data: "Task not found" }));
        }
        return res.status(200).json(new ApiResponse({ statusCode: 200, message: "Task retrieved successfully", data: task }));
    } catch (error) {
        console.error(error);
        return res.status(500).json(new ApiResponse({ statusCode: 500, message: "Internal Server Error", data: "Could not retrieve task" }));
    }
});

/* ---- Replace A TASK BY ID -------- */
app.put('/:id', (req, res) => {
    try {
        const { title, description } = req.body;
        if (typeof title !== "string" || title.trim() || typeof description !== "string" || description.trim()) {
            return res.status(400).json(new ApiResponse({ statusCode: 404, message: "Bad Request", data: "Title and description are required" }));
        }
        const result = db.prepare(`
            UPDATE tasks
            SET title = ?, description = ?
            WHERE id = ?`).run(title.trim(), description.trim(), req.params.id);
        if (result.changes === 0) {
            return res.status(404).json(new ApiResponse({ statusCode: 404, message: "Not Found", data: "Task not found" }));
        }
        const task = db.prepare("SELECT id, title, description FROM tasks WHERE id = ?").get(req.params.id);
        return res.status(200).json(new ApiResponse({ statusCode: 200, message: "Task Updated suxxessfully", data: task }));
    } catch (error) {
        return res.status(500).json(new ApiResponse({ statusCode: 500, message: "Internal Server Error", data: error.message }));
    }
});

/* ---- UPDATE A TASK BY ID -------- */
app.patch('/:id', (req, res) => {
    try {
        const { title, description } = req.body;
        if (title === undefined && description === undefined) {
            return res.status(400).json(new ApiResponse({ statusCode: 400, message: "Bad Request", data: "Provide a title or description to update" }));
        }
        if ((title !== undefined && (typeof title !== "string" || title.trim())) || (description !== undefined && (typeof description !== "string" || description.trim()))) {
            return res.status(400).json(new ApiResponse({ statusCode: 400, message: "Bad Request", data: "Provided Fields must not be empty" }));
        }
        const existing = db.prepare(
            "SELECT id, title, description FROM tasks WHERE id = ?"
        ).get(req.params.id);

        if (!existing) {
            return res.status(404).json(new ApiResponse({ statusCode: 404, message: "Not Found", data: "Task not found" }));
        }
        const updatedTitle = title === undefined ? existing.title : title.trim();
        const updatedDescription = description === undefined ? existing.description : description.trim();
        db.prepare(`
            UPDATE tasks
            SET title = ?, desctiption = ?
            WHERE id = ?`).run(updatedTitle, updatedDescription, req.params.id);
        const task = {
            id: existing.id, title: updatedTitle, description: updatedDescription
        };

        return res.status(200).json(new ApiResponse({ statusCode: 200, message: "Task updated successfully", data: task }));
    } catch (error) {
        return res.status(500).json(new ApiResponse({ statusCode: 500, message: "Internal Server Error", data: error.message }));
    }
});

/* ---- DELETE A TASK BY ID -------- */
app.delete('/:id', (req, res) => {
    try {
        const result = db.prepare("DELETE FROM tasks WHERE id = ?").run(req.params.id);
        if (result.changes === 0) {
            return res.status(404).json(new ApiResponse({ statusCode: 404, message: "Not Found", data: "Task not found" }));
        }
        return res.status(200).json(new ApiResponse({ statusCode: 200, message: "Task deleted successfully" }));
    } catch (error) {
        return res.status(500).json(new ApiResponse({ statusCode: 500, message: "Internal Server Error", data: error.message }));
    }
});

export default app;