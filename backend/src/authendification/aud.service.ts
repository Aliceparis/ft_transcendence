import {UserRepository} from '../User/user.repositery.js';
import type { LoginInput, RegisterInput, UserOutput  } from '../../shared_zod/user.schema.js';
import {prisma} from '';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET!

export  const AuthService{
    
    async register(input: RegisterInput):Promise<UserOutput>{
    //1. create with repository 
    //2. generate jwt token update in useroutput and return 
    try{    
        const newuser = await UserRepository.create(input);
        const token = jwt.sign(
            {id: newuser.id},
            JWT_SECRET,
            {expiresIn: '7d'}
        )
    }catch (error){

    }

    }
}