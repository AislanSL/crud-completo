import pkg from 'pg'
import { userValidation } from '../validation/user.validation.js'
import bcrypt from 'bcrypt'

const { Pool } = pkg

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
})

export class User{
    static async getUsers(req, res) {

        const { page = 1, limit = 10, name, email, department_id } = req.query
        const offset = (page - 1) * limit
        
        let query = `
            SELECT
                users.*,
                departments.name AS department_name 
            FROM 
                users 
            LEFT JOIN 
                departments ON users.department_id = departments.id
            WHERE 
                1=1
        `

        const values = []

        if(name) {
            query += ` AND users.name ILIKE $${values.length + 1}`
            values.push(`%${name}%`)
        }
        if(email) {
            query += ` AND users.email ILIKE $${values.length + 1}`
            values.push(`%${email}%`)
        }
        if(department_id) {
            query += ` AND users.department_id = $${values.length + 1}`
            values.push(department_id)
        }

        query += ` LIMIT $${values.length + 1} OFFSET $${values.length + 2}`
        values.push(limit, offset)

        try{
            const users = await pool.query(query, values)
          
            const totalUsersResult = await pool.query(`
                SELECT COUNT(*) 
                FROM users
                WHERE 1=1
                ${name ? ' AND name ILIKE $1' : ''}
                ${email ? ' AND email ILIKE $2' : ''}
                ${department_id ? ' AND department_id = $3' : ''}
            `, values.slice(0, values.length - 2))
                
            const totalUsers = totalUsersResult.rows[0].count
            const totalPages = Math.ceil(totalUsers/limit)
            res.status(200).json({
                users: users.rows,
                page: page,
                totalUsers: totalUsers,
                totalPages: totalPages
            }
                
            )
        } catch (erro) {
            res.status(500).json({ massage: `${erro.message} - Falha na requisição`})
        }
    }

    static async getUserById(req, res) {
        try{
            const id = req.params.id
            const user = await pool.query(`
                SELECT 
                    users.*, 
                    departments.name AS department_name 
                FROM 
                    users 
                LEFT JOIN 
                    departments ON users.department_id = departments.id 
                WHERE 
                    users.id = $1`, [id]
            )

            if (user.rows.length === 0) {
                return res.status(404).json({ message: 'Usuário não encontrado' })
            }

            res.status(200).json(user.rows)
        } catch(erro){
            res.status(500).json({ massage: `${erro.message} - Falha na requisição`})
        }
    }

    static async createUser(req, res) {
        try{
            await userValidation.parse(req.body)

            const { name, email, password, phone } = req.body

            const hashedPassword = await bcrypt.hash(password, 10)
        
            const newUser = await pool.query('INSERT INTO users (name, email, password, phone) VALUES ($1, $2, $3, $4) RETURNING *',
                [name, email, hashedPassword, phone]
            )

            res.status(200).json({message: 'Adicionado com sucesso', user: newUser.rows})
        } catch(erro) {
            res.status(500).json({ message: `${erro} - falha ao cadastrar Usuário` })
        }
  
    }

    static async updateUser (req, res) {
        const fields = []
        const values = []
    
        if (req.body.name) {
            fields.push(`name = $${fields.length + 1}`)
            values.push(req.body.name)
        }
        if (req.body.email) {
            fields.push(`email = $${fields.length + 1}`)
            values.push(req.body.email)
        }
        if (req.body.password) {
            fields.push(`password = $${fields.length + 1}`)
            values.push(req.body.password)
        }
        if (req.body.phone) {
            fields.push(`phone = $${fields.length + 1}`)
            values.push(req.body.phone)
        }

        if (req.body.department_id) {
            fields.push(`department_id = $${fields.length + 1}`)
            values.push(req.body.department_id)
        }
    
        if (fields.length === 0) {
            return res.status(400).json({message: 'Nenhum campo para atualizar.'})
        }
        if (req.params.id ==! 0){
            values.push(req.params.id)
        }else{
            return res.status(404).json({message: 'Nenhum usuário para atualizar.'})
        }

        try {
            await pool.query(`UPDATE users SET ${fields.join(', ')}, updated_at = NOW() WHERE id = $${values.length}`, values)
            res.status(200).json({message: 'Usuário atualizado'})
        } catch (error) {
            res.status(500).json({message: `${error} - Erro ao atualizado usuário`})
        }
    };

    static async deleteUser(req, res) {
        try{
            const id = req.params.id
            const user = await pool.query('DELETE FROM users WHERE id = $1', [id])

            if (user.rows.length === 0) {
                return res.status(404).json({ message: 'Usuário não encontrado' })
            }
            
            res.status(200).json({message: 'Excluído com sucesso'})
            
        } catch(erro) {
            res.status(500).json({ message: `${erro} - falha ao atualizar Usuário` })
        }
    }

}