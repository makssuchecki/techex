fetch("/api/tasks")
    .then(response => response.json())
    .then(tasks => {
        const list = document.getElementById("tasks");

        tasks.forEach(task => {
            const li = document.createElement("li");

            li.textContent =
                `${task.id}. ${task.title} - ${task.priority} (${task.completed})`;

            list.appendChild(li);
        });
    })
    .catch(err => console.error(err));


function addTask() {
    console.log("clicked");

    const title = document.getElementById("title").value;
    const priority = document.getElementById("priority").value;

    fetch("/api/tasks", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            title,
            priority
        })
    });
}