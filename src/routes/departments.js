import express from 'express'
import { Departments } from '../controllers/departments.controller.js'

const routes = express.Router()

routes.get('/departments', Departments.getDepartaments)
routes.get('/departments/:id', Departments.getDepartmentById)
routes.post('/departments', Departments.createDepartment)
routes.put('/departments/:id', Departments.updateDepartment)
routes.delete('/departments/:id', Departments.deleteDepartment)

export default routes