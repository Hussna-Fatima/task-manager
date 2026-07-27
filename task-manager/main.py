from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
import sqlite3

app = FastAPI()

# Allow frontend to connect
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create database and table
conn = sqlite3.connect("tasks.db", check_same_thread=False)
cursor = conn.cursor()

cursor.execute("""
CREATE TABLE IF NOT EXISTS tasks(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    completed INTEGER DEFAULT 0
)
""")
conn.commit()


# Show all tasks
@app.get("/tasks")
def get_tasks():
    cursor.execute("SELECT * FROM tasks")
    rows = cursor.fetchall()

    tasks = []
    for row in rows:
        tasks.append({
            "id": row[0],
            "title": row[1],
            "completed": bool(row[2])
        })

    return tasks


# Add task
@app.post("/tasks")
def add_task(task: dict):

    title = task["title"]

    if title.strip() == "":
        return {"message": "Task cannot be empty"}

    cursor.execute(
        "INSERT INTO tasks(title, completed) VALUES(?, ?)",
        (title, 0)
    )
    conn.commit()

    return {"message": "Task Added"}


# Update task
@app.put("/tasks/{task_id}")
def update_task(task_id: int, task: dict):

    cursor.execute(
        """
        UPDATE tasks
        SET title=?, completed=?
        WHERE id=?
        """,
        (
            task["title"],
            int(task["completed"]),
            task_id
        )
    )

    conn.commit()

    return {"message": "Task Updated"}


# Delete task
@app.delete("/tasks/{task_id}")
def delete_task(task_id: int):

    cursor.execute(
        "DELETE FROM tasks WHERE id=?",
        (task_id,)
    )

    conn.commit()

    return {"message": "Task Deleted"}

