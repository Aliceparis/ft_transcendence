import { Request, Response } from 'express';
import { GameServiceFactory } from './game.factory';
import { AppError } from 'src/error/apperror';

export class GameController
{
    public static async start(req: Request, res: Response): Promise<void>
    {
        const service = GameServiceFactory.get(req.params.mode);
        const userId = req.user.id; // userid is in httponly cookie 

        if (!service)
        {
           return res.status(400).json({
                success: false,
                error: {
                    code : "UNKOWN GAME MODE",
                    message: `Unknown game mode: ${req.params.mode}`,
                },
                data: null,
            });
        }

        try{
            const game = await service.startGame(userId);
            res.status(201).json({
                success: true,
                message: 'Game started.',
                data: game,
            });
        }catch(error){
            if (error instanceof AppError){
                return res.status(error.statusCode).json({
                    error:{
                        code: error.code,
                        message: error.message,
                    },
                });
            }
            console.error(error);
            return res.status(500).json({
                error: {
                    code: "INTERNAL",
                    message: "Internal start solo game",
                }
            })

        }
        
        
    }

    public static async answer(req: Request, res: Response): Promise<void>
    {
        const service = GameServiceFactory.get(req.params.mode);
        const userId = req.user.id;

        if (!service)
        {
            return res.status(400).json({
                success: false,
                error: {
                    code: "UNKOWN_GAME_MODE",
                    message: `Unknown game mode: ${req.params.mode}`, 
                },
                data: null,
            });
        }

        const gameId = req.params.gameId;

        if (!gameId)
        {
            return res.status(400).json({
                success: false,
                error:{
                    code: "MISSING_GAME_ID",
                    message: "gameid is required"
                },
                data: null,
            });
        }

        const rawAnswer = req.body?.selectedAnswerIndex ?? req.query.selectedAnswerIndex;
        const selectedAnswerIndex = Number(rawAnswer);

        if (!Number.isInteger(selectedAnswerIndex))
        {
            return res.status(400).json({
                success: false,
                error: {
                    code: "INVALIDE_ANSWER_INDEX",
                    mesage: 'selectedAnswerIndex must be an integer.',
                },
                data: null,
            });
        }

        try{
            const result = await service.submitAnswer(gameId, selectedAnswerIndex, userId);

            if (!result)
            {
                return res.status(404).json({
                    success: false,
                    error:{
                        code: "GAME_NOT_FOUND",
                        message: 'Game not found.',
                    },
                    data: null,
                });
            }

            return res.status(200).json({
                success: true,
                message: result.gameresult.isFinished ? 'Game finished.' : 'Answer submitted.',
                data: result,
            });
        }catch (error){
            if (error instanceof AppError){
                return res.status(error.statusCode).json({
                    error: {
                        code: error.code,
                        message: error.message,
                    },
                })
            }
            console.error(error);
            
            return res.status(500).json({
                error: {
                    code: "INTERNAL",
                    message: "Internal submitanswer in solo",
                }
            })
        }
    }
}
