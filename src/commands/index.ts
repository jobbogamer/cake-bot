import { Command } from '../interfaces';

import { help } from './help';
import { ping } from './ping';
import { list } from './list';
import { set } from './set';
import { birthday } from './birthday';
import { update } from './update';
import { channel } from './channel';
import { role } from './role';
import { notify } from './notify';
import { user } from './user';
import { users } from './users';
import { colour } from './colour';
import { mod } from './mod';
import { unmod } from './unmod';
import { echo } from './echo';
import { breadify } from './breadify';
import { logging } from './logging';
import { shortcut } from './shortcut';
import { emoji } from './emoji';
import { prompt } from './prompt';
import { hug } from './hug';
import { contrast } from './contrast';

export const COMMANDS: { [code: string]: Command } = {
  help,
  // ping,
  // list,
  set,
  birthday,
  update,
  notify,
  prompt,
  hug,
  channel,
  role,
  user,
  users,
  colour,
  mod,
  unmod,
  echo,
  breadify,
  contrast,
  logging,
  shortcut,
  emoji
};

export const findCommand = (name: string) => {
  const foundName = Object.keys(COMMANDS).find(command => {
    if (command === name) {
      return true;
    }

    const aliases = COMMANDS[command].aliases || [];
    return aliases.includes(name);
  });

  if (!foundName) {
    return undefined;
  }

  return COMMANDS[foundName];
};
