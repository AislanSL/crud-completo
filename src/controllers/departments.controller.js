import pkg from 'pg'

const { Pool } = pkg

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
})

export class Departments {
    static async getDepartaments(req, res) {
        
        try{
            const departments = await pool.query('SELECT * FROM departments')
            res.status(200).json(departments.rows)
        } catch (erro) {
            res.status(500).json({ massage: `${erro.message} - Falha na requisição`})
        }
    }

    static async getDepartmentById(req, res) {
        try{
            const id = req.params.id
            const department = await pool.query('SELECT * FROM departments WHERE id = $1', [id])

            if (department.rows.length === 0) {
                return res.status(404).json({ message: 'Usuário não encontrado' })
            }

            res.status(200).json(department.rows)
        } catch(erro){
            res.status(500).json({ massage: `${erro.message} - Falha na requisição`})
        }
    }

    static async createDepartment(req, res) {
        try{
            const { name, description } = req.body
      
            const newDepartment = await pool.query('INSERT INTO departments (name, description) VALUES ($1, $2) RETURNING *',
                [name, description]
            )
            
            res.status(200).json({message: 'Adicionado com sucesso', user: newDepartment.rows})
        } catch(erro) {
            res.status(500).json({ message: `${erro} - falha ao cadastrar Usuário` })
        }

    }

    static async updateDepartment (req, res) {
        const fields = []
        const values = []
  
        if (req.body.name) {
            fields.push(`name = $${fields.length + 1}`)
            values.push(req.body.name)
        }
        if (req.body.description) {
            fields.push(`description = $${fields.length + 1}`)
            values.push(req.body.description)
        }
        
        if (req.params.id !== 0){
            values.push(req.params.id)
        }else{
            return res.status(404).json({message: 'Nenhum departamento para atualizar.'})

        }

        try {
            const department = await pool.query(`
              UPDATE departments 
              SET ${fields.join(', ')}, updated_at = NOW() 
              WHERE id = $${values.length}
              RETURNING *
            `, values)
            console.log(department)
            
            res.status(200).json({message: 'Departmento atualizado', user: department.rows}, )
        } catch (error) {
            res.status(500).json({message: `${error} - Erro ao atualizado departamento`})
        }
    };

    static async deleteDepartment(req, res) {
        try{
            const id = req.params.id
            const department = await pool.query('SELECT * FROM departments WHERE id = $1', [id])
            
            if (department.rows.length === 0) {
                return res.status(404).json({ message: 'Departamento não encontrado' })
            }else {
                await pool.query('DELETE FROM departments WHERE id = $1', [id])
              
            }
          
            res.status(200).json({message: 'Excluído com sucesso'})
          
        } catch(erro) {
            res.status(500).json({ message: `${erro} - falha ao atualizar Departamento` })
        }
    }
}