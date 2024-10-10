import express from 'express'
import { User } from '../controllers/userController.js'
import { userValidation } from '../validation/user.validation.js'

const routes = express.Router()

routes.get('/user', User.getUsers)
routes.get('/user/:id', User.getUserById)
routes.post('/user', userValidation.parse, User.createUser)
routes.put('/user/:id', User.updateUser)
routes.delete('/user/:id', User.deleteUser)

export default routes