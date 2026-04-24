import { Apiresponse } from "src/lib/api_response";
import { RoomManager } from "./room.manager";
import {Request, Response} from 'express'
import { AppError, ErrorCode } from "src/error/apperror";


export class RoomController{
    constructor(private roommanager: RoomManager){
    }
    setReady = async (req: Request, res: Response)=>{

        try{
            const result = await this.roommanager.setReady(
               req.params.roomId, req.user.id, true
            )
            return res.status(200).json(
                Apiresponse.success(result, "set ready update")
            )
        }catch (error){
            console.error(error)
            if (error instanceof AppError){
                return res.status(error.statusCode).json(
                    Apiresponse.error(error.code, error.message)
                )
            }
            return res.status(500).json(
                Apiresponse.error("INTERNAL_ERROR", "Internal setready")
            )
        }
    }
}
/****
 *  room input: 
 *      need to get the mode for the chat or for the different strategie 
 * 
 * 
 * 
 * 
 * 
 */