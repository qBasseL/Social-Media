import { NextFunction, Request, Response, Router, type Router as RouterType } from "express";
import  AuthenticationService  from "./auth.service";

const router: RouterType = Router()

router.post('/login', (req:Request, res:Response, next:NextFunction): Response => {
    const result = AuthenticationService.Login(req.body)
    return res.status(201).json({ message: 'Login successful', data: result })
}) 

export default router