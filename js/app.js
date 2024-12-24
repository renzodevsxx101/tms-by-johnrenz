const apiBaseUrl = "https://tms-api-by-johnrenz.onrender.com/tasks/";

// Fetch tasks based on the selected filter
function fetchTasks(status = "all", searchQuery = "") {
    const url = status === "all" ? apiBaseUrl : `${apiBaseUrl}?status=${status}`;
    $("#loadingState").removeClass("d-none");
    $("#loadingState").addClass("d-flex justify-content-center align-items-center");

    $.ajax({
        url: url,
        method: "GET",
        success: function (tasksByCategory) {
            setTimeout(function () {
                $("#loadingState").addClass("d-none");
                $("#loadingState").removeClass("d-flex justify-content-center align-items-center");

                const taskList = $("#taskList");
                taskList.empty();  // Clear previous task rows
                const taskListMobile = $("#taskListMobile");
                taskListMobile.empty();  // Clear previous task rows

                const isMobile = window.innerWidth <= 577;
                for (const category in tasksByCategory) {
                    if (tasksByCategory.hasOwnProperty(category)) {
                        let tasks = tasksByCategory[category];

                        if (searchQuery) {
                            tasks = tasks.filter(task =>
                                task.title.toLowerCase().includes(searchQuery) ||
                                task.description.toLowerCase().includes(searchQuery)
                            );
                        }

                        tasks.forEach(task => {

                            if (isMobile) {
                                const taskRowMobile = `
                                 <div class="tms-row">
                                    <div class="tms-cell-actions">
                                        <button class="btn btn-sm btn-outline-primary edit-btn" data-id="${task.id}" data-title="${task.title}" data-due-date="${task.due_date}" data-description="${task.description}"> <i class="bi bi-pencil"></i> </button>
                                        <button class="btn btn-sm btn-outline-danger delete-btn" data-id="${task.id}"><i class="bi bi-trash"></i></button>
                                    </div>
                                    <div class="tms-cell" data-title="Title">${task.title}</div>
                                    <div class="tms-cell" data-title="Description">${task.description}</div>
                                    <div class="tms-cell" data-title="Due Date">${task.due_date}</div>
                                    <div class="tms-cell" data-title="Status">${task.completed === "Incoming" ? '<span class="btn btn-info px-2 py-1">Incoming</span>' : task.completed === "Today" ? '<span class="btn btn-warning px-2 py-1">Today</span>' : '<span class="btn btn-danger px-2 py-1">Overdue</span>'}</div>

                                  </div>
                                `;
                                taskListMobile.append(taskRowMobile);
                            } else {
                                const taskRow = `
                                    <tr>
                                        <td>${task.title}</td>
                                        <td>${task.description}</td>
                                        <td>${task.due_date}</td>
                                        <td>${task.completed === "Incoming" ? '<span class="btn btn-info px-2 py-1">Incoming</span>' : task.completed === "Today" ? '<span class="btn btn-warning px-2 py-1">Today</span>' : '<span class="btn btn-danger px-2 py-1">Overdue</span>'}</td>
                                        <td>
                                            <button class="btn btn-sm btn-outline-primary edit-btn" data-id="${task.id}" data-title="${task.title}" data-due-date="${task.due_date}" data-description="${task.description}"> <i class="bi bi-pencil"></i> </button>
                                            <button class="btn btn-sm btn-outline-danger delete-btn" data-id="${task.id}"> <i class="bi bi-trash"></i> </button>
                                        </td>
                                    </tr>
                                `;
                                taskList.append(taskRow);
                            }
                        });
                    }
                }
            }, 1000);
        },
        error: function () {
            $("#loadingState").addClass("d-none");
            $("#loadingState").removeClass("d-flex justify-content-center align-items-center");
            Swal.fire('Error', 'Failed to fetch tasks.', 'error');
        }
    });
}


// Add a new task
$("#addTaskForm").on("submit", function (e) {
    e.preventDefault();

    const title = $("#addTitle").val();
    const dueDate = $("#addDueDate").val();
    const description = $("#addDescription").val();

    $.ajax({
        url: apiBaseUrl,
        method: "POST",
        data: {
            "title": title,
            "due_date": dueDate,
            "description": description
        },
        success: function () {
            fetchTasks();
            Swal.fire('Success', 'Task added successfully!', 'success');
            const addModal = bootstrap.Modal.getInstance(document.getElementById('addTaskModal'));
            addModal.hide();
            $("#addTaskForm")[0].reset();
        },
        error: function () {
            Swal.fire('Error', 'Failed to add task.', 'error');
        }
    });
});

// Open edit modal with task data
$(document).on("click", ".edit-btn", function () {
    const taskId = $(this).data("id");
    const taskTitle = $(this).data("title");
    const taskDueDate = $(this).data("due-date");
    const taskDescription = $(this).data("description");

    $("#editTaskId").val(taskId);
    $("#editTitle").val(taskTitle);
    $("#editDueDate").val(taskDueDate);
    $("#editDescription").val(taskDescription);

    const editModal = new bootstrap.Modal(document.getElementById('editTaskModal'));
    editModal.show();
});

// Handle task editing
$("#editTaskForm").on("submit", function (e) {
    e.preventDefault();

    const taskId = $("#editTaskId").val();
    const updatedTitle = $("#editTitle").val();
    const updatedDueDate = $("#editDueDate").val();
    const updatedDescription = $("#editDescription").val();

    $.ajax({
        url: `${apiBaseUrl}${taskId}/`,
        method: "PUT",
        data: {
            "title": updatedTitle,
            "due_date": updatedDueDate,
            "description": updatedDescription
        },
        success: function () {
            fetchTasks();
            Swal.fire('Success', 'Task updated successfully!', 'success');
            const editModal = bootstrap.Modal.getInstance(document.getElementById('editTaskModal'));
            editModal.hide();
        },
        error: function () {
            Swal.fire('Error', 'Failed to update task.', 'error');
        }
    });
});

// Handle task deletion with confirmation
$(document).on("click", ".delete-btn", function () {
    const taskId = $(this).data("id");

    Swal.fire({
        title: 'Are you sure?',
        text: 'You will not be able to recover this task!',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, delete it!',
        cancelButtonText: 'No, cancel!',
        reverseButtons: true
    }).then((result) => {
        if (result.isConfirmed) {
            $.ajax({
                url: `${apiBaseUrl}${taskId}/`,
                method: "DELETE",
                success: function () {
                    fetchTasks();
                    Swal.fire('Deleted!', 'Your task has been deleted.', 'success');
                },
                error: function () {
                    Swal.fire('Error', 'Failed to delete task.', 'error');
                }
            });
        }
    });
});

$('#filterStatus').on('click', function () {
    const arrowIcon = $('#arrowIcon');
    arrowIcon.toggleClass('bi-chevron-down bi-chevron-up');
});

// Reset the arrow on focus out
$('#filterStatus').on('blur', function () {
    $('#arrowIcon').removeClass('bi-chevron-up').addClass('bi-chevron-down');
});

function toggleTheme() {
    $('#taskContainer').toggleClass('border-white');
    $('#task__searchIcon').toggleClass('text-white');
    $('body').toggleClass('bg-dark');
    $('#table-wrapper').toggleClass('tdl-dark-border pt-0.5 pb-2 px-4');
    $('#table').toggleClass('table-dark text-white');
    $('.tdl-search-input').toggleClass('tdl-search-input-dark text-white');
    $('.tdl-header').toggleClass('text-white');


    const icon = $('#themeToggle').find('i');
    icon.toggleClass('bi-brightness-high bi-moon');
}


$("#filterStatus").on("change", function () {
    const selectedStatus = $(this).val();
    fetchTasks(selectedStatus);
});

function handleSearch(event) {
    if (event.type === "click" || event.key === "Enter") {
        const searchQuery = $("#taskSearch").val().toLowerCase(); // Get search query
        fetchTasks("all", searchQuery);
    }
}


fetchTasks();
