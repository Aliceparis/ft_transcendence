import {UserRepository} from '../User/user.repository';
import type { LoginInput, RegisterInput, UserOutput, AuthResult } from '@shared/user.schema';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import {randomUUID, randomInt} from 'crypto';
import { AppError, ErrorCode } from '../error/apperror';
import {Provider} from "@prisma/client";
import { Redis } from 'src/lib/redis';
import dotenv from 'dotenv';
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined");
}

const OAUTH_CONFIG = {
    google:{
        authURL: "https://accounts.google.com/o/oauth2/v2/auth",
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        callbackURL: process.env.GOOGLE_CALLBACK_URL!,
        scope: 'openid profile email',
        tokenURL: "https://oauth2.googleapis.com/token",
        userURL: "https://openidconnect.googleapis.com/v1/userinfo",
    },
    github:{
        authURL: "https://github.com/login/oauth/authorize",
        client_id: process.env.GITHUB_CLIENT_ID!,
        client_secret: process.env.GITHUB_CLIENT_SECRET!,
        callbackURL: process.env.GITHUB_CALLBACK_URL!,
        scope: 'read:user user:email',
        tokenURL: "https://github.com/login/oauth/access_token",
        userURL: 'https://api.github.com/user',
        emailURL: 'https://api.github.com/user/emails'
    },
} as const;

export  class AuthService{

    constructor( private userrepository: UserRepository)
    {}

    /*
     * Registers a new user.
     * - Rejects if the email or username is already taken (409 AppError).
     * - Creates the user, then signs a 24h JWT (with a unique jti).
     * - Returns the token and the created user.
     */
    async register(input: RegisterInput):Promise<AuthResult>{
    //1. check mail or username existe
    //2. create with repository
    //3. generate jwt token update in useroutput and return
    const mail_exist = await this.userrepository.find_by_email(input.email)
    if (mail_exist){
        throw new AppError(
            'Email address already registered',
            ErrorCode.AUTH_MAIL_ALREADY_EXIST,
            409,
            {email: input.email})
    }

    const username_exist = await this.userrepository.find_by_username(input.username)
    if (username_exist){
        throw new AppError(
            'Username already used',
            ErrorCode.AUTH_USERNAME_ALREADY_EXIST,
            409,
            {username: input.username})
    }

    const newuser = await this.userrepository.create(input)
    const token = jwt.sign(
        {
            id: newuser.id,
            username: newuser.username,
            nickname: newuser.username,
            jti: randomUUID(),
        },
        JWT_SECRET!,
        {expiresIn: '24h'}
    )
    return {
        token,
        user: newuser,}
    }

    /*
     * Authenticates a user by email + password.
     * - Throws on unknown email or wrong password (401 AppError).
     * - Sets the user ONLINE, signs a 24h JWT, and returns it with the user.
     */
    async login(input: LoginInput): Promise<AuthResult>{
        //1. find the user bye mail or username
        const user = await this.userrepository.find_by_email(input.email);
        if (!user){
            throw new AppError(
                'Invalid email',
                ErrorCode.AUTH_INVALID_MAIL,
                401)
        }
        if (user.provider !== Provider.LOCAL){
            throw new AppError(`This account uses ${user.provider} login`,
                ErrorCode.BAD_REQUEST
            )
        }

        //2. if exite check the password
        const valide_password = await bcrypt.compare(input.password, user.password);
        if (!valide_password){
            throw new AppError (
                'Invalid password',
                ErrorCode.AUTH_INVALID_PASSWORD,
                401)
        }
        await this.userrepository.update_status(user.id, 'ONLINE');
        //3. get a jwt token
        const token = jwt.sign(
            {
                id: user.id,
                username: user.username,
                nickname: user.username,
                jti: randomUUID()
            },
            JWT_SECRET!,
            {expiresIn: '24h'}
        )
        //return data with token
        return {
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                url: user.url,
                score: user.score,
                wins: user.wins,
                friendsNb: user.friendsNb,
                status: 'ONLINE',
                createdAt: user.createdAt
            }
        }
    }

    async build_url_redirect(provider: 'google'| 'github'): Promise<string>{
        const config = OAUTH_CONFIG[provider];

        const state = randomUUID();
        await Redis.set(`oauth_state:${state}`, provider, {EX:60})
        const params = new URLSearchParams({
            client_id: config.client_id,
            redirect_uri: config.callbackURL,
            response_type: 'code',
            scope: config.scope,
            state,
        })
        const base = config.authURL
        return `${base}?${params}`;
    }

    async handle_oauth_callback(provider: 'google'| 'github', code: string, state: string): Promise<AuthResult>{

        //1. check state in redis
        const storedProvider = await Redis.get(`oauth_state:${state}`);
        if (storedProvider !== provider){
            throw new AppError('Invalide OAuth state', ErrorCode.AUTH_UNAUTHORIZED)
        }
        await Redis.del(`oauth_state:${state}`);
        const config = OAUTH_CONFIG[provider];

        //2. get the access_token with the code
        const tokenParams = new URLSearchParams({
            client_id: config.client_id,
            client_secret: config.client_secret,
            code,
            redirect_uri: config.callbackURL,
        });
        if (provider === 'google') {
            tokenParams.set('grant_type', 'authorization_code');
        }

        const tokenRes = await fetch(config.tokenURL, {
            method: 'POST',
            headers:{
                'Content-Type': 'application/x-www-form-urlencoded',
                'Accept': 'application/json',
            },
            body: tokenParams
        })
        const tokenData = await tokenRes.json()
        if (!tokenRes.ok || !tokenData.access_token) {
            console.error(`OAuth token exchange failed for ${provider}:`, tokenData);
            throw new AppError('OAuth token exchange failed', ErrorCode.AUTH_UNAUTHORIZED);
        }
        const access_token: string = tokenData.access_token;

        //3. get the information of user with token
        const {username, avatarurl, email} = provider === 'google'
            ? await this.get_google_user(access_token)
            : await this.get_github_user(access_token);

        if (!email) {
            throw new AppError('OAuth provider did not return an email address', ErrorCode.AUTH_UNAUTHORIZED);
        }

        const user = await this.find_or_create_oauth_user({
            email,
            username,
            avatarurl,
            provider: provider.toUpperCase() as Provider
        })

        // 4. jwt token sign
        const token = jwt.sign(
            {id: user.id, username: user.username, jti: randomUUID()},
            JWT_SECRET!,
            {expiresIn: '24h'})

        return {token, user};
    }

    async find_or_create_oauth_user(input: {email: string, username: string, avatarurl: string, provider: Provider})
        : Promise<UserOutput>{
        let user = await this.userrepository.find_by_email(input.email);
        if (user){
            user = await this.userrepository.link_oauth_info(user.id, {
                url: input.avatarurl,
                status: 'ONLINE',
                provider: input.provider
            })
            return user;
        }
        //if not find by email, check username
        let finalUsername = input.username;
        let name_exist = await this.userrepository.find_by_username(input.username);
        while (name_exist){
            const randomNumber = randomInt(1000, 10000);
            const safeusername = input.username.slice(0, 16);
            finalUsername = `${safeusername}${randomNumber}`;
            //check if already exist
            name_exist = await this.userrepository.find_by_username(finalUsername);
        }
        const newUser = await this.userrepository.create_oauth_user({
            email: input.email,
            username: finalUsername,
            url: input.avatarurl,
            provider: input.provider.toUpperCase() as Provider
        })
        return newUser
    }

    private async get_github_user(access_token: string){
        const userres = await fetch(OAUTH_CONFIG.github.userURL, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${access_token}`,
                'Accept': 'application/json',
            },
        })
        const user = await userres.json();
        if (!userres.ok) {
            console.error('GitHub user request failed:', user);
            throw new AppError('GitHub user request failed', ErrorCode.AUTH_UNAUTHORIZED);
        }

        //email
        const emailsres = await fetch(OAUTH_CONFIG.github.emailURL, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${access_token}`,
                'Accept': 'application/json',
            }
        })
        const emails = await emailsres.json();
        if (!emailsres.ok || !Array.isArray(emails)) {
            console.error('GitHub email request failed:', emails);
            throw new AppError('GitHub email request failed', ErrorCode.AUTH_UNAUTHORIZED);
        }
        const primary = emails.find((e:any) => e.primary && e.verified)?.email
            ?? emails.find((e:any) => e.verified)?.email
            ?? user.email;
        return {
            email: primary as string,
            username: user.login as string,
            avatarurl: user.avatar_url as string,
        }
    }

    private async get_google_user(access_token: string){
        //get user
        const userres = await fetch(OAUTH_CONFIG.google.userURL, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${access_token}`,
                'Accept': 'application/json',
            },
        })
        const user = await userres.json();
        if (!userres.ok) {
            console.error('Google userinfo request failed:', user);
            throw new AppError('Google userinfo request failed', ErrorCode.AUTH_UNAUTHORIZED);
        }

        return {
            email: user.email as string,
            username: user.name as string,
            avatarurl: user.picture as string,
        }
    }

}
