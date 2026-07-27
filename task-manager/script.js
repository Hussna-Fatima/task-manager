const api = "http://127.0.0.1:8000";

window.onload = function () {
    loadTasks();

    document.getElementById("taskInput").addEventListener("keypress", function(e){
        if(e.key==="Enter"){
            addTask();
        }
    });
};

async function loadTasks(){

    const response=await fetch(api+"/tasks");
    const tasks=await response.json();

    const taskList=document.getElementById("taskList");
    taskList.innerHTML="";

    tasks.forEach(task=>{

        let div=document.createElement("div");
        div.className="task";

        if(task.completed){
            div.classList.add("completed");
        }

        div.innerHTML=`
            <b>${task.title}</b><br><br>

            <button onclick='toggleComplete(${task.id}, ${JSON.stringify(task.title)}, ${task.completed})'>
            ${task.completed?"Undo":"Complete"}
            </button>

            <button onclick='editTask(${task.id}, ${JSON.stringify(task.title)}, ${task.completed})'>
            Edit
            </button>

            <button onclick="deleteTask(${task.id})">
            Delete
            </button>
        `;

        taskList.appendChild(div);

    });

}

async function addTask(){

    const input=document.getElementById("taskInput");

    if(input.value.trim()==""){
        alert("Task cannot be empty.");
        return;
    }

    await fetch(api+"/tasks",{

        method:"POST",

        headers:{
            "Content-Type":"application/json"
        },

        body:JSON.stringify({
            title:input.value
        })

    });

    showMessage("Task added successfully!");

    input.value="";

    loadTasks();

}

async function deleteTask(id){

    if(!confirm("Are you sure you want to delete this task?")){
        return;
    }

    await fetch(api+"/tasks/"+id,{
        method:"DELETE"
    });

    showMessage("Task deleted.");

    loadTasks();

}

async function editTask(id, title, completed) {

    let newTitle = prompt("Edit Task", title);

    if (newTitle == null || newTitle.trim() == "") {
        return;
    }

    await fetch(api + "/tasks/" + id, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            title: newTitle,
            completed: completed
        })
    });

    showMessage("Task updated successfully!");

    await loadTasks();
}

async function toggleComplete(id, title, completed) {

    await fetch(api + "/tasks/" + id, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            title: title,
            completed: !completed
        })
    });

    showMessage("Task status updated!");

    await loadTasks();
}

function showMessage(text){

    const msg=document.getElementById("message");

    msg.innerText=text;

    setTimeout(function(){

        msg.innerText="";

    },2000);

}