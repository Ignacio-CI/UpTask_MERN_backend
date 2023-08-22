import mongoose from "mongoose";
import Project from "../models/Project.js";
import User from '../models/User.js'

const getAllProjects = async (req, res) => {
    // req.user's data has been saved in checkAuth.js. It can be used in this function to get just the projects of the currently authenticated user and not other users' projects. It is recommended to do it so:
    const projects = await Project.find({
        $or: [
            { collaborators: { $in: req.user } },
            { creator: { $in: req.user } }
        ]
    }).select("-tasks");

    res.json({ projects });
};

const newProject = async (req, res) => {
    const project = new Project(req.body);
    project.creator = req.user._id;

    try {
        const storedProject = await project.save();
        res.json(storedProject);
    } catch (error) {
        console.log(error);
    }
};

const getProject = async (req, res) => {
    const { id } = req.params;

    try {
        const project = await Project.findById(id).populate({ path: 'tasks', populate: { path: 'completed', select: 'name' } }).populate('collaborators', 'name email');

        // if creator's ID is different to the user's ID (who is making the request) AND if the user that makes the request is not in the array of collaborators THEN it is an Invalid Action.
        if(project.creator.toString() !== req.user._id.toString() && !project.collaborators.some( collaborator => collaborator._id.toString() === req.user._id.toString() )) {
            const error = new Error('Invalid Action');
            return res.status(401).json({ msg: error.message });
        }

        res.json( project );
    } catch (error) {
        error = new Error('Project not found');
        return res.status(404).json({ msg: error.message });
    }    
};

const editProject = async (req, res) => {
    const { id } = req.params;
    let project;

    const isvalidId = mongoose.Types.ObjectId.isValid(id);

    if(isvalidId) {
        project = await Project.findById(id);
    } else {
        const error = new Error('Project not found');
        return res.status(404).json({ msg: error.message });
    }

    if(project.creator.toString() !== req.user._id.toString()) {
        const error = new Error('Invalid Action');
        return res.status(401).json({ msg: error.message });
    }

    project.name = req.body.name || project.name;
    project.description = req.body.description || project.description;
    project.deadline = req.body.deadline || project.deadline;
    project.client = req.body.client || project.client;
    
    try {
        const updatedProject = await project.save();
        res.json(updatedProject);
    } catch (error) {
        console.log(error);
    }

};

const deleteProject = async (req, res) => {
    const { id } = req.params;
    let project;

    const isvalidId = mongoose.Types.ObjectId.isValid(id);

    if(isvalidId) {
        project = await Project.findById(id);
    } else {
        const error = new Error('Project not found');
        return res.status(404).json({ msg: error.message });
    }

    if(project.creator.toString() !== req.user._id.toString()) {
        const error = new Error('Invalid Action');
        return res.status(401).json({ msg: error.message });
    }

    try {
        await project.deleteOne();
        res.json({ msg: 'Project deleted successfully' });
    } catch (error) {
        console.log(error);
    }
};

const searchCollaborator = async (req, res) => {
    const { email } = req.body;
    const user = await User.findOne({email}).select('-confirmed -createdAt -password -token -updatedAt -__v')

    if(!user) {
        const error = new Error('User not found');
        return res.status(404).json({ msg: error.message });
    }

    return res.json(user);
};

const addCollaborator = async (req, res) => {
    const project = await Project.findById(req.params.id);

    if(!project) {
        const error = new Error('Project not found');
        return res.status(404).jason({ msg: error.message });
    }

    if(project.creator.toString() !== req.user._id.toString()) {
        const error = new Error('Invalid Action');
        return res.status(401).json({ msg: error.message });
    }

    const { email } = req.body;
    const user = await User.findOne({email}).select('-confirmed -createdAt -password -token -updatedAt -__v')

    if(!user) {
        const error = new Error('User not found');
        return res.status(404).json({ msg: error.message });
    }

    // The collaborator must be different to the project's creator
    if(project.creator.toString() === user._id.toString()) {
        const error = new Error('The creator of the project cannot be collaborator');
        return res.status(404).json({ msg: error.message });
    }

    // Check that collaborator is not already added to the project
    if(project.collaborators.includes(user.id)) {
        const error = new Error('This user has already been added to the project');
        return res.status(401).json({ msg: error.message });
    }

    project.collaborators.push(user._id);
    await project.save();
    res.json({ msg: 'Collaborator added successfully!' });
};

const deleteCollaborator = async (req, res) => {
    const project = await Project.findById(req.params.id);

    if(!project) {
        const error = new Error('Project not found');
        return res.status(404).jason({ msg: error.message });
    }

    if(project.creator.toString() !== req.user._id.toString()) {
        const error = new Error('Invalid Action');
        return res.status(401).json({ msg: error.message });
    }

    project.collaborators.pull(req.body.id);
    await project.save();
    res.json({ msg: 'Collaborator deleted successfully' });
};

export {
    getAllProjects,
    newProject,
    getProject,
    editProject,
    deleteProject,
    searchCollaborator,
    addCollaborator,
    deleteCollaborator,
}