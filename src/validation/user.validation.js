import * as zod from 'zod'

export const userValidation = zod.object({
    name: zod.string().min(1),
    email: zod.string().email(),
    password: zod.string().min(6)
})