import express from 'express'
import { 
    getAllProjects,
    newProject,
    getProject,
    editProject,
    deleteProject,
    searchCollaborator,
    addCollaborator,
    deleteCollaborator,
 } from "../controllers/projectController.js";

 import checkAuth from '../middleware/checkAuth.js'

const router = express.Router();

router.route("/")
 .get(checkAuth, getAllProjects)
 .post(checkAuth, newProject)

router.route("/:id")
 .get(checkAuth, getProject)
 .put(checkAuth, editProject)
 .delete(checkAuth, deleteProject)

router.post("/collaborators", checkAuth, searchCollaborator);
router.post("/collaborators/:id", checkAuth, addCollaborator);
router.post("/delete-collaborator/:id", checkAuth, deleteCollaborator);


export default router;