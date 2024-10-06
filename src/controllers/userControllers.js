import pkg from 'pg'

const { Pool } = pkg

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
})

export class User{
    static async getUsers(req, res) {
        try{
            const users = await pool.query('SELECT * FROM users')
            res.status(200).json(users.rows)
        } catch (erro) {
            res.status(500).json({ massage: `${erro.message} - Falha na requisição`})
        }
    }

    static async getUserById(req, res) {
        try{
            const id = req.params.id
            
            const user = await pool.query('SELECT * FROM users WHERE id = $1', [id])
            res.status(200).json(user.rows)
        } catch(erro){
            res.status(500).json({ massage: `${erro.message} - Falha na requisição`})
        }
    }

    static async createUser(req, res) {
        try{
            const { name, email, password, phone } = req.body
        
            const newUser = await pool.query('INSERT INTO users (name, email, password, phone) VALUES ($1, $2, $3, $4) RETURNING *',
                [name, email, password, phone]
            )

            res.status(200).json({message: 'Adicionado com sucesso', user: newUser.rows})
        } catch(erro) {
            res.status(500).json({ message: `${erro} - falha ao cadastrar Usuário` })
        }
  
    }

    static async updateUser (req, res) {
        const fields = []
        const values = []
    
        // Montar a consulta dinamicamente com base nos campos que estão sendo atualizados
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
    
        // Se não houver campos para atualizar, lança um erro
        if (fields.length === 0) {
            throw new Error('Nenhum campo para atualizar.')
        }
    
        // Adiciona o ID ao final dos valores
        values.push(req.params.id)
      
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
            await pool.query('DELETE FROM users WHERE id = $1', [id])
            
            res.status(200).json({message: 'Excluído com sucesso'})
            
        } catch(erro) {
            res.status(500).json({ message: `${erro} - falha ao atualizar Usuário` })
        }
    }

}