export interface Me {
  auth: boolean;
  user?: { id: string; name: string; avatar: string };
  steam?: {
    linked: boolean;
    steam64?: string;
    account_id?: number;
    profile_url?: string;
    dotabuff_url?: string;
    opendota_url?: string;
  };
}

export interface Stats {
  name: string;
  has_games: boolean;
  mmr?: number;
  peak?: number;
  rank?: number;
  rank_of?: number;
  wins?: number;
  losses?: number;
  winrate?: number;
  streak?: number;
  last10?: string;
  calibration_left?: number;
  dota_rank?: string;
  heroes?: { name: string; games: number; wins: number }[];
  predictions?: { points: number; correct: number; wrong: number; streak: number };
}
