import { PrismaClient } from "@prisma/client";
import { IGameRepository } from "./game.redis.repository";
import { GameState } from "./game.types";

export class PrismaGameRepository implements IGameRepository{
    constructor(
        private prisma: PrismaClient
    ){}

    async create(state: GameState): Promise<void>{

    }

    async findById(gameId: string): Promise<GameState | null> {
        return null
    }

    async update(game: GameState): Promise<void> {
        return
    }

    async delete(gameId: string): Promise<void>{
        await this.prisma.
    }

    async findByMode(mode: string){

    } // to use in the profil to show the score by mode

    // ?? need to find by userId, to use in profil? 
}