import usersRoute from './users.js'
import departmentsRoute from './departments.js'
import express from 'express'

const router = express.Router()

router.use(
    usersRoute,
    departmentsRoute
)

export default router
