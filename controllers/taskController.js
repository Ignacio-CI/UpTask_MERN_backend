import mongoose from "mongoose";
import Project from "../models/Project.js";
import Task from "../models/Task.js";

const addTask = async (req, res) => {
    const { project } = req.body;

    const isvalidId = mongoose.Types.ObjectId.isValid(project);

    let projectExists;

    if(isvalidId) {
        projectExists = await Project.findById(project);
    } else {
        const error = new Error('Project not found');
        return res.status(404).json({ msg: error.message });
    }

    if(projectExists.creator.toString() !== req.user._id.toString()) {
        const error = new Error('You do not have permission to add tasks to this project');
        return res.status(403).json({ msg: error.message });
    }

    try {
        const storedTask = await Task.create(req.body);
        
        // store the ID in the project
        projectExists.tasks.push(storedTask._id);
        await projectExists.save();
        res.json( storedTask );
    } catch (error) {
        console.log(error);
    }

    //console.log(projectExists);
};

const getTask = async (req, res) => {
    const { id } = req.params;
    // populate() methods cross over the information about task/project and allows to just query the database once. "project" refers to project key contained in Task Model and add the refered project object as value of the property "project" .   
    try {
        const task = await Task.findById(id).populate("project");

        if(task.project.creator.toString() !== req.user._id.toString()) {
            const error = new Error('Invalid Action');
            return res.status(403).json({ msg: error.message });
        }

        res.json({ task });
    } catch (error) {
        error = new Error('Task not found');
        return res.status(404).json({ msg: error.message });
    }
};

const updateTask = async (req, res) => {
    const { id } = req.params;

    try {
        const task = await Task.findById(id).populate("project");

        if(task.project.creator.toString() !== req.user._id.toString()) {
            const error = new Error('Invalid Action');
            return res.status(403).json({ msg: error.message });
        }

        task.name = req.body.name || task.name;
        task.description = req.body.description || task.description;
        task.priority = req.body.priority || task.priority;
        task.deadline = req.body.deadline || task.deadline;

        const storedTask = await task.save();

        res.json( storedTask );
    } catch (error) {
        error = new Error('Task not found');
        return res.status(404).json({ msg: error.message });
    }
};

const deleteTask = async (req, res) => {
    const { id } = req.params;

    try {
        const task = await Task.findById(id).populate("project");
    
        if(task.project.creator.toString() !== req.user._id.toString()) {
            const error = new Error('Invalid Action');
            return res.status(403).json({ msg: error.message });
        }

        //These lines delete both the task stored in the project array and the task stored in the DB route "Tasks"
        const project = await Project.findById(task.project)
        project.tasks.pull(task._id);
        
        await Promise.allSettled([ await project.save(), await task.deleteOne() ]);
        res.json({ msg: 'Task deleted successfully' })
    } catch (error) {
        error = new Error('Task not found');
        return res.status(404).json({ msg: error.message });
    }
};

const changeTaskState = async (req, res) => {
    const { id } = req.params;

    try {
        const task = await Task.findById(id).populate("project");
    
        // if creator's ID is different to the user's ID (who is making the request) AND if the user that makes the request is not in the array of collaborators THEN it is an Invalid Action.
        if(task.project.creator.toString() !== req.user._id.toString() && !task.project.collaborators.some( collaborator => collaborator._id.toString() === req.user._id.toString() )) {
            const error = new Error('Invalid Action');
            return res.status(401).json({ msg: error.message });
        }

        task.state = !task.state;
        task.completed = req.user._id;
        await task.save();

        const storedTask = await Task.findById(id).populate("project").populate("completed");

        res.json(storedTask);
    } catch (error) {
        error = new Error('Task not found');
        return res.status(404).json({ msg: error.message });
    }
};

export {
    addTask,
    getTask,
    updateTask,
    deleteTask,
    changeTaskState
};
