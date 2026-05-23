export type GameWonPayload = {
  score: number;
  rewardPercent: number;
  wonAt: number;
};

export type GameEvents = {
  GAME_WON: GameWonPayload;
  RESTART_GAME: undefined;
};
