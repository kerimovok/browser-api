import express from 'express'
import bodyParser from 'body-parser'
import cors from 'cors'
import screenshotRouter from './routes/screenshot'
import pdfRouter from './routes/pdf'
import htmlRouter from './routes/html'
import metadataRouter from './routes/metadata'
import formRouter from './routes/form'
import scriptRouter from './routes/script'

const app = express()

app.use(bodyParser.json())
app.use(cors())

// API Routes
const v1Router = express.Router()
v1Router.use(screenshotRouter)
v1Router.use(pdfRouter)
v1Router.use(htmlRouter)
v1Router.use(metadataRouter)
v1Router.use(formRouter)
v1Router.use(scriptRouter)

app.use('/api/v1', v1Router)

export default app
