import jwt from 'jsonwebtoken'
import type {Request, Response, NextFunction } from 'express'
import dotenv from 'dotenv';
dotenv.config();

import { redis } from '../lib/redis';

export const verifyToken = async(req: Request, res: Response, next: NextFunction)=>{
    const token = req.cookies?.auth_token;
    if (!token){
        return res.status(401).json({message: "not login"})
    }

    try{
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        
        const exist = await redis.get(`blacklist:${decoded.jti}`);
        if (exist){
            return res.status(401).json({message: "token in blacklist of redis"})
        }
        req.user = decoded
        next()
    }catch(error){
        console.log("error in verif: ", error);
        res.status(401).json({message: "token is unvalide"})
    }
}

//verifie token for profil 
