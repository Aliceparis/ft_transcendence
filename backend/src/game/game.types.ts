export type Question = {
    id: number;
    question: string;
    options: string[];
    correctAnswerIndex: number;
};

//public use to return for front
export type PublicQuestion = {
    id: number;
    question: string;
    options: string[];
};

export type PlayerAnswer = {
    questionId: number;
    selectedAnswerIndex: number; //remember the choice of player answer
    isCorrect: boolean;

    answeredAt?: number; // for multiplayer
}

export type PlayerStatus = "playing" | "answered" | "disconnected";

export interface Player{
    id: string;
    score: number;
    answers: PlayerAnswer[];
<<<<<<< HEAD
    status: "playing" | 'answered';
=======
    status: PlayerStatus;
>>>>>>> alice
    Totaltime: number;
    isAI?: boolean;
<<<<<<< HEAD
    joinOrder?: number; // to get a host for the room 
=======
    joinOrder?: number;
    nickname?: string;
>>>>>>> alice
}


export enum GameMode {
    SOLO = "solo",
    AI = "ai",
    MULTIPLAYER = "multiplayer",
    TOURNAMENT = "tournament",  
}
//runtime gamestate to save in redis 
export interface BaseGameState {
    gameId: string;
    mode: GameMode;
    questions: Question[];
    players: Record<string, Player>;
    currentQuestionIndex: number;
    isFinished: boolean;
    startedAt: number;
    roomId?: string;
    hostId?: string;
    status?: "waiting" | "starting" | "playing" | "finished";
}

export interface SoloGameState extends BaseGameState {
    mode: GameMode.SOLO | GameMode.AI
}

export interface MultiGameState extends BaseGameState {
    mode: GameMode.MULTIPLAYER | GameMode.TOURNAMENT;
    roomId: string;
    hostId: string;
    status: "waiting" | "starting" | "playing" | "finished";
}

export type GameState = SoloGameState | MultiGameState; 

//informations for front 
export interface PlayerSnapShot{
    id: string;
    nickname?: string;
    score: number;
    status: PlayerStatus;
    isAI: boolean;
}

export type FinalScore = {
    winnerId: string;
    finishedAt: number;
    scores: Record<string, number>;
    ranking: Array<{playerId: string; score: number; rank: number}>;
}

export interface GameUpdateResponse {
    gameId: string;
    status: "playing" | "finished";
    state: {
        currentQuestionIndex: number;
        totalQuestions: number;
        player: Record<string, PlayerSnapShot>;
    };
    lastAnswerUpdate? :{
        playerId: string;
        isCorrect: boolean;
        correctAnswerIndex: number;
        correctText: string;
    };

    nextQuestion?: PublicQuestion | null;
    finalScore?: FinalScore | null; 
}


export interface StartGameResult {
    gameId: string;
    question: PublicQuestion;
}

export interface StartMultiResult extends StartGameResult {
    status: "matched" | "waiting";
    players?: MatchPlayer[];
    roomId?: string;
}

export type MatchPlayer = {
    userId: string;
    nickname: string;
};

export type SetReadyResult = {
    allReady: boolean;
    gameresponse?: GameUpdateResponse;
};

<<<<<<< HEAD
export type BaseGameState = {
    gameId: string;
    questions: Question[];
    players: Record<string, Player>;
    currentQuestionIndex: number;
    isFinished: boolean;
    startedAt: number;
}

export type SoloGameState = BaseGameState & {
    mode: "solo" | "ai"
}

export type MultiGameState = BaseGameState & {
    mode: "multiplayer";
    roomId: string;
    hostId: string;
    status: "waiting" | "starting" | "playing" | "finished";
}
export type GameState = SoloGameState | MultiGameState;

//type for front 
export type PublicGameState = {
  gameId: string;
  players: Record<string, PublicPlayer>;
  currentQuestionIndex: number;
  isFinished: boolean;
  totalQuestions: number;
  mode: "solo" | "ai" | "multiplayer";
  roomId?: string;
  hostId?: string;
  status?: "waiting" | "starting" | "playing" | "finished";
}

export type FinalScore = {
    gameId: string;
    players: Record<string, PublicPlayer>;
    winner: string; //give the id of winner
    finishedAt: number;
}
//give all info to front with the correct answer
export type PlayingGameInfo = {
    gameresult: PublicGameState,
    correctAnswer: string,
    nextQuestion: PublicQuestion | null,
}

export type FinishedGameInfo = {
    gameresult: PublicGameState;
    finalscore: FinalScore;
}

export type GameInfo = PlayingGameInfo | FinishedGameInfo; 

export interface IGameRepository {
    create(game:GameState): Promise<void>;
    findById(gameId: string): Promise<GameState | null>;
    update(game: GameState): Promise<void>;
    delete(gameId: string): Promise<void>;
}
=======
//input 
export type StartGameParams = {
   mode: GameMode.SOLO | GameMode.MULTIPLAYER;
   userId: string;
   nickname: string;
}
>>>>>>> alice
