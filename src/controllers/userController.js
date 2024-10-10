import pkg from 'pg'
import bcrypt from 'bcrypt'

const { Pool } = pkg

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
})

function queryDinamic(fields) {
    const values = []
    let filters = ''

    Object.entries(fields).forEach(([chave, valor]) => {
        if (valor) {
            if (values.length === 0) {
                if(chave === 'department_id'){
                    filters += ` WHERE users.${chave} = $${values.length + 1}`
                }else{
                    filters += ` WHERE users.${chave} ILIKE $${values.length + 1}`
                }
            } else {
                if(chave === 'department_id'){
                    filters += ` AND users.${chave} = $${values.length + 1}`
                }else{
                    filters += ` AND users.${chave} ILIKE $${values.length + 1}`
                }
            
            }
            values.push(chave === 'department_id' ? Number(valor):`%${valor}%`) 
        }
    })
    return {values, filters}
}

export class User{
    static async getUsers(req, res) {

        const { page = 1, limit = 10, name, email, phone, department_id } = req.query
        const offset = (page - 1) * limit
        
        let query = `
            SELECT
                users.*,
                departments.name AS department_name 
            FROM 
                users 
            LEFT JOIN 
                departments ON users.department_id = departments.id
        `

        const {filters, values} = queryDinamic({name, email, phone, department_id, })
        
        query += filters
        query += ` LIMIT $${values.length + 1} OFFSET $${values.length + 2}`
        values.push(limit, offset)

        console.log(query, values)

        try{
            const users = await pool.query(query, values)
          
            let queryCount = `
                SELECT COUNT(*) 
                FROM users
            `
            queryCount += filters
            let totalUsersResult
            if (filters === ''){
                totalUsersResult = await pool.query(queryCount)
            }else {
                totalUsersResult = await pool.query(queryCount, values.slice(0, values.length - 2))
            }
            
            console.log(totalUsersResult)
            
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