import './style.css';

let backendStorageModule = (function() {
    //variables
    let storedProjects = [];
    let currentProject = {}
    currentProject.projectTodos = [];

    //functions
    function projectBuilder(name, description) {
        let projectIndex;
        let projectTodos = [];
        if (!storedProjects.length) {
            projectIndex = 0;
        } else {
            projectIndex = storedProjects.length;
        }
        return storedProjects[projectIndex] = { name, description, projectIndex, projectTodos };
    }

    function todoBuilder(title, priority, duedate, status) {
        let correspondingArrayProjectIndex = storedProjects.findIndex(project => project.name == currentProject.name && project.description == currentProject.description);
        storedProjects[correspondingArrayProjectIndex].projectTodos.push({ title, priority, duedate, status });
        currentProject.projectTodos = storedProjects[correspondingArrayProjectIndex].projectTodos;

    }

    function setCurrentProjectBackend(DOMProjectName, DOMProjectDescription) {
        let currentStoredProject = storedProjects.find(project => project.name == DOMProjectName && project.description == DOMProjectDescription);
        currentProject.projectTodos = currentStoredProject.projectTodos;
        currentProject.name = DOMProjectName;
        currentProject.description = DOMProjectDescription;
    }

    function updateCurrentProjectBackend(oldProjectName, oldProjectDescription, newProjectName, newProjectDescription) {
        let correspondingArrayProjectIndex = storedProjects.findIndex(project => project.name == oldProjectName && project.description == oldProjectDescription);
        storedProjects[correspondingArrayProjectIndex].name = newProjectName;
        storedProjects[correspondingArrayProjectIndex].description = newProjectDescription;
        currentProject.name = storedProjects[correspondingArrayProjectIndex].name;
        currentProject.description = storedProjects[correspondingArrayProjectIndex].description;
    }

    function updateCurrentTodoBackend(oldTodoName, editedTodoName, editedTodoPriority, editedTodoDueDate, editedTodoStatus) {
        let currentArrayProjectIndex = storedProjects.findIndex(project => project.name == currentProject.name && project.description == currentProject.description);
        let currentProjectCurrentTodoIndex = currentProject.projectTodos.findIndex(todo => todo.name = oldTodoName);
        currentProject.projectTodos[currentProjectCurrentTodoIndex] = { name: editedTodoName, priority: editedTodoPriority, duedate: editedTodoDueDate, status: editedTodoStatus };
        storedProjects[currentArrayProjectIndex].projectTodos[currentProjectCurrentTodoIndex] = { name: editedTodoName, priority: editedTodoPriority, duedate: editedTodoDueDate, status: editedTodoStatus };
    }

    function getCurrentStoredProjectIndex() {
        return storedProjects.findIndex(project => project.name == currentProject.name && project.description == currentProject.description);
    }

    function addTodosToCurrentProject() {
        let currentStoredProjectIndex = getCurrentStoredProjectIndex();
        currentProject.projectTodos = storedProjects[currentStoredProjectIndex].projectTodos;
    }

    function deleteCurrentProject() {
        let currentStoredProjectIndex = getCurrentStoredProjectIndex();
        delete storedProjects[currentStoredProjectIndex];
        currentProject.name = ``;
        currentProject.description = ``;
        currentProject.projectTodos = [];
    }

    function deleteCurrentTodo(currentTodoName) {
        let currentProjectTodosArray = currentProject.projectTodos;
        let currentTodo = currentProjectTodosArray.findIndex(todo => todo.title == currentTodoName);
        currentProject.projectTodos.splice(currentTodo, 1);
    }

    return { projectBuilder, todoBuilder, setCurrentProjectBackend, updateCurrentProjectBackend, currentProject, addTodosToCurrentProject, updateCurrentTodoBackend, deleteCurrentProject, deleteCurrentTodo };
})();

let frontendModule = (function() {
    //variables
    let sidebarProjects = [];
    let currentlyEditedTodo;
    let currentDOMProjectName = document.getElementById(`infosection-projectname`);
    let currentDOMProjectDescription = document.getElementById(`infosection-projectdescription`);

    let editProjectOpenBtn = document.getElementById(`infosection-editbtn`);
    let editProjectModal = document.getElementById(`modal-editproject`);
    let editProjectCloseBtn = document.getElementById(`close-editproject`);
    let editProjectSubmitBtn = document.getElementById(`submit-editproject`);

    let newProjectModal = document.getElementById(`modal-newproject`);
    let newProjectOpenBtn = document.getElementById(`open-projectmodal`);
    let newProjectCloseBtn = document.getElementById(`close-newproject`);

    let newProjectSubmitBtn = document.getElementById(`submit-newproject`);

    const newTodoModal = document.getElementById(`modal-newtodo`);
    const newTodoOpenBtn = document.getElementById(`todo-addbtn`);
    const newTodoCloseBtn = document.getElementById(`close-newtodo`);

    const newTodoSubmitBtn = document.getElementById(`submit-newtodo`);

    const editTodoModal = document.getElementById(`modal-edittodo`);

    let submitEditTodoBtn = document.getElementById(`submit-edittodo`);

    //functions
    function createDefaultProject() {
        const defaultProjectName = `Default Project`;
        const defaultProjectDescription = `This is your default project`
        createDOMProject(defaultProjectName, defaultProjectDescription);
        backendStorageModule.projectBuilder(defaultProjectName, defaultProjectDescription);
        currentDOMProjectName.textContent = defaultProjectName;
        currentDOMProjectDescription.textContent = defaultProjectDescription;
        backendStorageModule.setCurrentProjectBackend(defaultProjectName, defaultProjectDescription);
        const defaultDOMProjectBtn = document.querySelector(`#sidebar-projectnames`).firstChild;
        defaultDOMProjectBtn.addEventListener(`click`, () => {
            currentDOMProjectName.textContent = defaultProjectName;
            currentDOMProjectDescription.textContent = defaultProjectDescription;
        })
    }

    function createDOMProject(name, description) {
        let newProjectDescription = description;
        let sidebarProjectSection = document.getElementById(`sidebar-projectnames`);
        let newSidebarProject = document.createElement(`button`);
        newSidebarProject.classList.add(`sidebar-projectname`);
        newSidebarProject.textContent = name;
        let sidebarProjectObject = {
            name: name,
            description: newProjectDescription,
            domBtn: newSidebarProject,
        }
        sidebarProjectSection.appendChild(newSidebarProject);
        if (!sidebarProjects) {
            newSidebarProject.setAttribute(`index`, 0)
            sidebarProjects.push(sidebarProjectObject);
        } else {
            newSidebarProject.setAttribute(`index`, `${sidebarProjects.length}`)
            sidebarProjects.push(sidebarProjectObject)
        }
        updateCurrentDOMProject();
    }

    function updateCurrentDOMProject() {
        sidebarProjects.forEach(project => {
            let projectDOMBtn = project.domBtn;
            projectDOMBtn.addEventListener(`click`, () => {
                currentDOMProjectName.textContent = project.name;
                currentDOMProjectDescription.textContent = project.description;
                backendStorageModule.setCurrentProjectBackend(currentDOMProjectName.textContent, currentDOMProjectDescription.textContent);
                backendStorageModule.addTodosToCurrentProject();
                addProjectTodosToDOM();
            })
        })
    }

    function addTodoToDOM(todoName, todoDueDate) {
        updateCurrentDOMProject();
        const mainTodoArea = document.getElementById(`main-todoarea`);
        const newDOMTodoInstance = document.createElement(`div`);
        newDOMTodoInstance.classList.add(`todo-instance`);
        mainTodoArea.appendChild(newDOMTodoInstance);
        let newDOMTodoLeftDiv = document.createElement(`div`);
        newDOMTodoLeftDiv.classList.add(`todo-left`);
        newDOMTodoInstance.appendChild(newDOMTodoLeftDiv);
        let DOMTodoCheckboxInput = document.createElement(`input`);
        DOMTodoCheckboxInput.setAttribute(`type`, `checkbox`);
        let DOMTodoName = document.createElement(`p`);
        DOMTodoName.classList.add(`todo-name`);
        DOMTodoName.textContent = todoName;
        newDOMTodoLeftDiv.appendChild(DOMTodoCheckboxInput);
        newDOMTodoLeftDiv.appendChild(DOMTodoName);
        let newDOMTodoRightDiv = document.createElement(`div`);
        newDOMTodoRightDiv.classList.add(`todo-right`);
        newDOMTodoInstance.appendChild(newDOMTodoRightDiv);
        let DOMTodoDueDate = document.createElement(`p`);
        DOMTodoDueDate.classList.add(`todo-date`);
        DOMTodoDueDate.textContent = todoDueDate;
        newDOMTodoRightDiv.appendChild(DOMTodoDueDate);
        let newDOMTodoEditBtn = document.createElement(`button`);
        newDOMTodoEditBtn.classList.add(`todo-edit`);
        newDOMTodoEditBtn.textContent = `Edit`;
        newDOMTodoRightDiv.appendChild(newDOMTodoEditBtn);
        let deleteTodoBtn = document.createElement(`button`);
        deleteTodoBtn.classList.add(`todo-delete`);
        deleteTodoBtn.textContent = `DELETE`;
        newDOMTodoRightDiv.appendChild(deleteTodoBtn);
        newTodoModal.style.display = `none`;
        addTodoEditListener(newDOMTodoEditBtn);
        currentlyEditedTodo = newDOMTodoInstance;
        addTodoDeleteListener(deleteTodoBtn);
        checkboxTodoCheckListener(DOMTodoCheckboxInput);
    }

    function addProjectTodosToDOM() {
        deleteAllTodoInstances();
        if (!backendStorageModule.currentProject.projectTodos) return;
        backendStorageModule.currentProject.projectTodos.forEach(todo => {
            addTodoToDOM(todo.title, todo.duedate);
            updateTodoDOMColor(todo.priority);
        });
    }

    function deleteAllTodoInstances() {
        let todoInstances = document.querySelectorAll(`.todo-instance`);
        todoInstances.forEach(instance => {
            instance.remove();
        })
    }

    function addTodoEditListener(editBtn) {
        editBtn.addEventListener(`click`, () => {
            editTodoModal.style.display = `flex`;
            const editTodoCloseBtn = document.getElementById(`close-edittodo`);
            editTodoCloseBtn.addEventListener(`click`, () => editTodoModal.style.display = `none`);
            currentlyEditedTodo = editBtn.parentElement.parentElement;
        })
    }

    function addTodoDeleteListener(deleteBtn) {
        deleteBtn.addEventListener(`click`, () => {
            let currentDOMTodoInstance = deleteBtn.parentElement.parentElement;
            let currentDOMTodoName = currentDOMTodoInstance.querySelector(`.todo-name`).textContent;
            currentDOMTodoInstance.remove();
            backendStorageModule.deleteCurrentTodo(currentDOMTodoName);
        })
    }

    function checkboxTodoCheckListener(checkbox) {
        checkbox.addEventListener(`click`, () => {
            let currentDOMTodoInstance = checkbox.parentElement.parentElement;
            let currentDOMTodoName = currentDOMTodoInstance.querySelector(`.todo-name`).textContent;
            setTimeout(() => {
                currentDOMTodoInstance.remove();
                backendStorageModule.deleteCurrentTodo(currentDOMTodoName);
            }, 500);
        })
    }

    function editDOMTodo(currentDOMTodoInstance, editedTodoName, editedTodoStatus, editedTodoDate) {
        let currentTodoName = currentDOMTodoInstance.querySelector(`.todo-name`);
        let currentTodoDate = currentDOMTodoInstance.querySelector(`.todo-date`);
        currentTodoName.textContent = editedTodoName;
        currentTodoStatus = editedTodoStatus;
        currentTodoDate.textContent = editedTodoDate;
        editTodoModal.style.display = `none`;
    }

    function updateTodoDOMColor(editTodoPriority) {
        if (editTodoPriority == `LOW`) {
            currentlyEditedTodo.style.backgroundColor = `#F2B252`;
        } else if (editTodoPriority == `MEDIUM`) {
            currentlyEditedTodo.style.backgroundColor = `#F27052`;
        } else {
            currentlyEditedTodo.style.backgroundColor = `#F15152`;
        }
    }

    //eventListeners
    editProjectCloseBtn.addEventListener(`click`, () => editProjectModal.style.display = `none`);
    editProjectOpenBtn.addEventListener(`click`, () => {
        if (currentDOMProjectName.textContent == ``) return;
        editProjectModal.style.display = `flex`;
    });

    editProjectSubmitBtn.addEventListener(`click`, () => {
        let sidebarCorrespondingProject = sidebarProjects.find(project => project.name == currentDOMProjectName.textContent && project.description == currentDOMProjectDescription.textContent);
        let oldProjectName = currentDOMProjectName.textContent;
        let oldProjectDescription = currentDOMProjectDescription.textContent;
        let editProjectFieldName = document.getElementById(`input-editprojectname`);
        let editProjectFieldDescription = document.getElementById(`input-editprojectdescription`);
        currentDOMProjectName.textContent = editProjectFieldName.value;
        currentDOMProjectDescription.textContent = editProjectFieldDescription.value;
        editProjectModal.style.display = `none`;
        sidebarCorrespondingProject.name = currentDOMProjectName.textContent;
        sidebarCorrespondingProject.description = currentDOMProjectDescription.textContent;
        sidebarCorrespondingProject.domBtn.textContent = sidebarCorrespondingProject.name;
        backendStorageModule.updateCurrentProjectBackend(oldProjectName, oldProjectDescription, currentDOMProjectName.textContent, currentDOMProjectDescription.textContent);
    });

    newProjectOpenBtn.addEventListener(`click`, () => newProjectModal.style.display = `flex`);
    newProjectCloseBtn.addEventListener(`click`, () => newProjectModal.style.display = `none`);

    newProjectSubmitBtn.addEventListener(`click`, () => {
        let newProjectName = document.getElementById(`input-newprojectname`).value;
        let newProjectDescription = document.getElementById(`input-newprojectdescription`).value;
        backendStorageModule.projectBuilder(newProjectName, newProjectDescription);
        createDOMProject(newProjectName, newProjectDescription);
        newProjectModal.style.display = `none`;
    });

    newTodoCloseBtn.addEventListener(`click`, () => newTodoModal.style.display = `none`);
    newTodoOpenBtn.addEventListener(`click`, () => {
        if (currentDOMProjectName.textContent == ``) return;
        newTodoModal.style.display = `flex`
    });

    newTodoSubmitBtn.addEventListener(`click`, () => {
        let newTodoName = document.getElementById(`input-newtodoname`).value;
        let newTodoPriority = document.getElementById(`input-newtodopriority`).value;
        let newTodoDueDate = document.getElementById(`input-newtododuedate`).value;
        let newTodoStatus = document.getElementById(`input-newtodostatus`).value;
        backendStorageModule.todoBuilder(newTodoName, newTodoPriority, newTodoDueDate, newTodoStatus);
        addTodoToDOM(newTodoName, newTodoDueDate);
        updateTodoDOMColor(newTodoPriority);
    });

    submitEditTodoBtn.addEventListener(`click`, () => {
        let editTodoModal = document.getElementById(`modal-edittodo`);
        let oldTodoName = currentlyEditedTodo.querySelector(`.todo-name`);
        let editedTodoName = document.getElementById(`input-edittodoname`).value;
        let editedTodoPriority = document.getElementById(`input-edittodopriority`).value;
        let editedTodoDueDate = document.getElementById(`input-edittododuedate`).value;
        let editedTodoStatus = document.getElementById(`input-edittodostatus`).value;
        if (editedTodoStatus == `completed`) {
            let completedTodo = currentlyEditedTodo;
            return setTimeout(() => {
                completedTodo.remove();
                backendStorageModule.deleteCurrentTodo(editedTodoName);
            }, 500);
        }
        editTodoModal.style.display = `none`;
        editDOMTodo(currentlyEditedTodo, editedTodoName, editedTodoStatus, editedTodoDueDate);
        updateTodoDOMColor(editedTodoPriority)
        backendStorageModule.updateCurrentTodoBackend(oldTodoName, editedTodoName, editedTodoPriority, editedTodoDueDate, editedTodoStatus)
    });

    let deleteProjectBtn = document.getElementById(`infosection-deletebtn`);
    deleteProjectBtn.addEventListener(`click`, () => {
        sidebarCorrespondingProjectIndex = sidebarProjects.findIndex(project => project.name == currentDOMProjectName.textContent && project.description == currentDOMProjectDescription.textContent);
        let sidebarDOM = document.getElementById(`sidebar-projectnames`);
        let sidebarButtonsArray = Array.from(sidebarDOM.querySelectorAll(`button.sidebar-projectname`));
        let currentDOMProject = sidebarButtonsArray.find(sidebarProject => sidebarProject.innerHTML == currentDOMProjectName.textContent);
        delete sidebarProjects[sidebarCorrespondingProjectIndex];
        currentDOMProjectName.textContent = ``;
        currentDOMProjectDescription.textContent = ``;
        deleteAllTodoInstances();
        currentDOMProject.remove();
        backendStorageModule.deleteCurrentProject();
    });

    //function calls
    createDefaultProject();
})();