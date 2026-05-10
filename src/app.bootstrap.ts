import express from 'express';
import { authRouter } from './modules';
import { GlobalErrorHandler } from './middlewares';
const bootstrap = async () => {

    const app: express.Express = express()

    app.use(express.json())

    app.use('/auth', authRouter)

    app.use('{/*dummy}', (req: express.Request, res: express.Response, next: express.NextFunction) => {
        res.status(404).json({ message: 'Not Found' })
    })

    app.use(GlobalErrorHandler)

    app.listen(3000, () => {
        console.log('Server is running on port 3000')
    })
}

export default bootstrap