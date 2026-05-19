import { AppError, ErrorCode } from "../error/apperror";
import { QuestionService } from "../question/question.service";
import { MultiPlayerFacade } from "./game.multi";
import { IGameRepository } from "./game.redis.repository";
import { PrismaGameRepository } from "./game.score";
import { GameMode, GameState, GameUpdateResponse, SetReadyResult, StartGameParams } from "./game.types";
import { SoloService } from "./solo";

export type GameStartResult = GameUpdateResponse | {status: 'waiting' | 'matched'; players?: any[]; roomId?: string};

export class GameService{
    constructor(
        private soloservice: SoloService,
        private multiplayer: MultiPlayerFacade,
        private gameRepository: IGameRepository,
        private questionService: QuestionService,
        private db: PrismaGameRepository, //save into database
    ){}

    async listCategories(): Promise<string[]> {
        return this.questionService.getCategories();
    }

    async startGame(params:StartGameParams): Promise<GameStartResult>{
        const {mode, userId, nickname, category, size} = params;

        switch(mode){
            case GameMode.SOLO:
                return this.soloservice.startGame(userId, nickname, GameMode.SOLO, category);
            case GameMode.MULTIPLAYER:
                return this.multiplayer.joinMatchmaking(GameMode.MULTIPLAYER, userId, nickname, size);
            default:
                throw new AppError(
                    "Unknown game mode",
                    ErrorCode.GAME_UNKOWN_MODE,
                    400
                )
        }
    }

    async submitAnswer(gameId: string, selectedAnswerIndex: number, userId: string): Promise<GameUpdateResponse>{
            const gameState = await this.gameRepository.findById(gameId);
            
            if (!gameState) {
                throw new AppError(
                    'Game not found',
                    ErrorCode.GAME_NOT_FOUND,
                    404
                );
            }
            if (gameState.mode === GameMode.MULTIPLAYER) {
                return this.multiplayer.submitAnswer(gameId, selectedAnswerIndex, userId);
            } else {
                return this.soloservice.submitAnswer(gameId, selectedAnswerIndex, userId);
            }
    }

    async setReady(roomId: string, userId: string, isReady: boolean): Promise<SetReadyResult>{
        return this.multiplayer.setPlayerReady(roomId, userId, isReady);
    }

    async finishGame(gameId: string): Promise<void>{
        const state = await this.gameRepository.findById(gameId);
        if (!state || !state.isFinished)
                return ;
        await this.db.create(state);
        await this.gameRepository.delete(gameId);
    }


    buildResponseForFront(gamestate: GameState): GameUpdateResponse{
        if (gamestate.mode === GameMode.MULTIPLAYER)
            return this.multiplayer.buildResponseForFront(gamestate);
        return this.soloservice.buildResponseForFront(gamestate);
    }
}

/***
 *  the only entry for the game, need the response for the front 
 * 
 *  
 * 
 * 
 * 
 */