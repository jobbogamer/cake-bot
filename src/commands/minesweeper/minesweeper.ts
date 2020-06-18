import { Command, CommandFn } from '../../interfaces';
import {
  createGameState,
  GameState,
  move,
  Direction,
  revealSquare,
  flagSquare,
} from './GameState';
import { range } from './utils';
import { HEIGHT, WIDTH, FLAG, COVERED } from './constants';
import { RichEmbed, Message, CollectorFilter } from 'discord.js';

const TWO_MINUTES = 1000 * 60 * 2;

const drawBoard = (state: GameState) => {
  let grid = '';

  range(0, HEIGHT + 1).forEach((y) => {
    range(0, WIDTH).forEach((x) => {
      const isCursor = state.cursorX === x && state.cursorY === y;
      const isBelowCursor = state.cursorX === x && state.cursorY === y - 1;

      grid += isCursor ? '┌' : isBelowCursor ? '└' : ' ';
      grid += isCursor || isBelowCursor ? '─' : ' ';
      grid += isCursor ? '┐' : isBelowCursor ? '┘' : ' ';
    });

    grid += '\n';

    if (y < HEIGHT) {
      range(0, WIDTH).forEach((x) => {
        const isCursor = state.cursorX === x && state.cursorY === y;

        grid += isCursor ? '│' : ' ';

        if (state.flagged[x][y]) {
          grid += FLAG;
        } else if (!state.revealed[x][y]) {
          grid += COVERED;
        } else {
          grid += state.board[x][y];
        }

        grid += isCursor ? '│' : ' ';
      });

      grid += '\n';
    }
  });

  return `\`\`\`\n${grid}\n\`\`\``;
};

const playMinesweeper: CommandFn = async (params, msg) => {
  const playerId = msg.author.id;

  let state = createGameState();

  const board = drawBoard(state);
  const gameMsg = (await msg.channel.send(board)) as Message;

  await gameMsg.react('◀️');
  await gameMsg.react('🔼');
  await gameMsg.react('🔽');
  await gameMsg.react('▶️');
  await gameMsg.react('🆗');
  await gameMsg.react('🚩');

  const filter: CollectorFilter = (reaction, user) =>
    ['◀️', '🔼', '🔽', '▶️', '🆗', '🚩'].includes(reaction.emoji.name) &&
    user.id === playerId;

  let finished = false;

  while (!finished) {
    const reactions = await gameMsg.awaitReactions(filter, {
      time: TWO_MINUTES,
      max: 1,
    });

    if (!!reactions && !!reactions.size) {
      const command = reactions.first().emoji.name;
      if (command === '◀️') {
        state = move(state, Direction.Left);
      }
      if (command === '🔼') {
        state = move(state, Direction.Up);
      }
      if (command === '🔽') {
        state = move(state, Direction.Down);
      }
      if (command === '▶️') {
        state = move(state, Direction.Right);
      }
      if (command === '🆗') {
        state = revealSquare(state, state.cursorX, state.cursorY);
      }
      if (command === '🚩') {
        state = flagSquare(state, state.cursorX, state.cursorY);
      }
      await reactions.first().remove(playerId);
    } else {
      finished = true;
    }

    const updatedBoard = drawBoard(state);
    await gameMsg.edit(updatedBoard);

    finished = finished || state.completed || state.gameOver;
  }

  await gameMsg.clearReactions();
};

export const minesweeper: Command = {
  fn: playMinesweeper,
  description: 'Play an interactive game of minesweeer.',
  params: [],
};
