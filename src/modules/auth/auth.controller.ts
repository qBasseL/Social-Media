import { NextFunction, Request, Response, Router, type Router as RouterType } from "express";

const router: RouterType = Router()

router.post('/login', (req:Request, res:Response, next:NextFunction): Response => {
    return res.status(201).json({ message: 'Login successful' })
}) 

export default router