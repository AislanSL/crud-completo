import express from 'express'
import { User } from '../controllers/userController.js'

const routes = express.Router()

routes.get('/user', User.getUsers)
routes.get('/user/:id', User.getUserById)
routes.post('/user', User.createUser)
routes.put('/user/:id', User.updateUser)
routes.delete('/user/:id', User.deleteUser)

export default routes