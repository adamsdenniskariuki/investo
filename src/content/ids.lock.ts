/**
 * Every lesson, question, track and badge id that has ever shipped.
 * Append only. A test fails if a shipped id disappears, because saved progress and backups depend on them.
 */
export const LOCKED_TRACK_IDS = ['basics', 'kenya', 'global', 'trading', 'forex', 'crypto'];

export const LOCKED_LESSON_IDS = [
  'b01', 'b02', 'b03', 'b04', 'b05', 'b06', 'b07', 'b08', 'b09', 'b10',
  'k01', 'k02', 'k03', 'k04', 'k05', 'k06', 'k07', 'k08', 'k09',
  'g01', 'g02', 'g03', 'g04', 'g05', 'g06',
  't01', 't02', 't03', 't04', 't05', 't06', 't07', 't08',
  'f01', 'f02', 'f03', 'f04', 'f05',
];

export const LOCKED_QUESTION_IDS = [
  'b01-q1', 'b01-q2', 'b01-q3',
  'b02-q1', 'b02-q2', 'b02-q3',
  'b03-q1', 'b03-q2', 'b03-q3',
  'b04-q1', 'b04-q2', 'b04-q3',
  'b05-q1', 'b05-q2', 'b05-q3',
  'b06-q1', 'b06-q2', 'b06-q3',
  'b07-q1', 'b07-q2', 'b07-q3',
  'b08-q1', 'b08-q2', 'b08-q3',
  'b09-q1', 'b09-q2', 'b09-q3',
  'b10-q1', 'b10-q2', 'b10-q3', 'b10-q4',
  'k01-q1', 'k01-q2', 'k01-q3',
  'k02-q1', 'k02-q2', 'k02-q3',
  'k03-q1', 'k03-q2', 'k03-q3',
  'k04-q1', 'k04-q2', 'k04-q3',
  'k05-q1', 'k05-q2', 'k05-q3',
  'k06-q1', 'k06-q2', 'k06-q3',
  'k07-q1', 'k07-q2', 'k07-q3',
  'k08-q1', 'k08-q2', 'k08-q3',
  'k09-q1', 'k09-q2', 'k09-q3',
  'g01-q1', 'g01-q2', 'g01-q3',
  'g02-q1', 'g02-q2', 'g02-q3',
  'g03-q1', 'g03-q2', 'g03-q3',
  'g04-q1', 'g04-q2', 'g04-q3',
  'g05-q1', 'g05-q2', 'g05-q3',
  'g06-q1', 'g06-q2', 'g06-q3',
  't01-q1', 't01-q2', 't01-q3',
  't02-q1', 't02-q2', 't02-q3',
  't03-q1', 't03-q2', 't03-q3',
  't04-q1', 't04-q2', 't04-q3',
  't05-q1', 't05-q2', 't05-q3',
  't06-q1', 't06-q2', 't06-q3',
  't07-q1', 't07-q2', 't07-q3',
  't08-q1', 't08-q2', 't08-q3',
  'f01-q1', 'f01-q2', 'f01-q3',
  'f02-q1', 'f02-q2', 'f02-q3',
  'f03-q1', 'f03-q2', 'f03-q3',
  'f04-q1', 'f04-q2', 'f04-q3',
  'f05-q1', 'f05-q2', 'f05-q3',
];

export const LOCKED_BADGE_IDS = [
  'first-step', 'perfect-quiz', 'scam-spotter', 'basics-done', 'kenya-done',
  'streak-3', 'streak-7', 'toolkit', 'backed-up', 'xp-250',
  'global-done', 'trading-done', 'paper-trader',
    'forex-done',
  ];

export const LOCKED_TOOL_IDS = ['compound', 'inflation', 'fees', 'mmf-tbill', 'bond', 'emergency', 'fx-return', 'position-size', 'risk-reward', 'replay', 'leverage'];
