import express from 'express'
import cors from 'cors' 
import routes from './routes/users.js'

const app = express()

app.use(express.json())
app.use(cors())
app.use(routes)

app.listen(process.env.PORT, process.env.HOST, () => {
    console.info(
        `Servidor executando no endereço: http://${process.env.HOST}:${process.env.PORT}`
    )
})