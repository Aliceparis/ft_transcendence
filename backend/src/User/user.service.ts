import { UserRepository } from './user.repositery'
import type {UserDB} from '@shared/user.schema'
import { AppError } from 'src/error/apperror';

export class UserService{
    private userrepository: UserRepository;
    constructor(){
        this.userrepository = new UserRepository();
    }

    async get_profile(input: string): Promise<Omit<UserDB, 'password'>>{
        const user = await this.userrepository.find_by_id(input);
        if (!user){
            throw new AppError("user not exist", 401)
        }
        const {password, ...profil_of_user} = user;
        return profil_of_user
    }
}
