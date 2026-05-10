import {  GameUpdateResponse, MatchPlayer, PlayerSnapShot, PublicQuestion, StartGameResult } from "src/game/game.types";
import {SendFriendRequestInput} from "@shared/friendship.schema";
import { QueuePlayer } from "src/game/match/match.types";
import { string } from "zod/v4-mini";

export type RoomPlayerInfo = {
    userId: string;
    nickname: string;
    isReady: boolean;
};
export type ReconnectLoad = 
    | {type: 'idle'}
    | {type: 'queue'; message: string}
    | {type: 'matched'; roomId: string; players: MatchPlayer[]}
    | {
        type: "in_room";
        roomId: string;
        players: RoomPlayerInfo[];
        roomStatus: "waiting" | "starting" | "playing" | "finished"; 
    }
    | {
        type: "in_game";
        gameId: string;
        state: GameUpdateResponse
    }


export type GameSocketEvents = {
    //match making before start multiplayer game 
    'matched': {
        roomId: string;
        players: MatchPlayer[];
    };

    'player_ready':{
        playerId: string;
        isReady: boolean;
        allReady: boolean;
    };
    'game_started': {
        gameId: string;
        firstQuestion: PublicQuestion;
        players: Record<string, PlayerSnapShot>;
    };

    'answer_submitted': {
        success: boolean;
    };

    'answer_result': {
        gameId: string;
        status: 'playing' | 'finished';
        lastAnswerUpdate: {
            playerId: string;
            isCorrect: boolean;
            correctAnswerIndex: number;
        };
        nextQuestion?: PublicQuestion | null;
        players: Record<string, PlayerSnapShot>;
        finalScore?:{
            winnerId: string;
            finishedAt: number;
            scores: Record<string, number>; 
            ranking: Array<{playerId: string, score: number, rank:number}>;
        } | null;
    };

    'game_finished': {
        gameId: string;
        state: GameUpdateResponse;
    };

    'player_left':{
        playerId: string;
        newHostId: string;
    };

    'reconnection': ReconnectLoad;
    'error': {
        message: string;
    }
}

export type FriendSocketEvents = {
    'friend_request':{
        fromuserId: string;
        fromNickname: string;
    };

    'friend_accept':{
        userId: string;
        nickname: string;
    };

    'friend_online':{
        userId: string;
        nickname: string;
    };
    'friend_offline':{
        userId: string;
        nickname: string;
    }
}

export type ChatSocketEvents ={

}