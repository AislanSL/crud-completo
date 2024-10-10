import { z } from 'zod'

export const userValidation = {
    parse: (req, res, next) => {
        const schema = z.object({
            name: z.string().min(1, 'Name is required'),
            email: z.string().email('Invalid email'),
            password: z.string().min(6, 'Password must be at least 6 characters long')
        })

        try {
            schema.parse(req.body)
            next()
        } catch (error) {
            let formattedErrors

            if(error instanceof z.ZodError) {
                formattedErrors = error.errors.map(err => ({
                    field: err.path[0],
                    message: err.message
                }))
                console.log(formattedErrors)
                console.log(error)
                
            }

            return res.status(400).json({
                status: 'error',
                errors: formattedErrors,
            })
        }

        return res.status(500).json({ status: 'error', message: 'Internal Server Error' })

    }
}