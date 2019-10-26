import moment from 'moment';

import { Command, CommandFn } from '../interfaces';
import { getBirthdays } from '../database';
import { getUsername } from '../users';
import { formatDate } from '../dates';

const showNextBirthday: CommandFn = async (params, msg) => {
  const serverId = msg.guild.id;
  const serverBirthdays = await getBirthdays(serverId);

  let date = moment();
  let foundBirthdays = undefined;

  const startDate = moment();
  const startMonth = startDate.get('month');
  const startDay = startDate.get('date');

  while (!foundBirthdays) {
    date = date.add(1, 'day');
    const month = date.get('month');
    const day = date.get('date');

    if (serverBirthdays[month] && serverBirthdays[month][day]) {
      if (serverBirthdays[month][day].length) {
        foundBirthdays = serverBirthdays[month][day];
        break;
      }
    }

    if (month === startMonth && day === startDay) {
      return msg.channel.send('⚠️ No birthdays have been saved.');
    }
  }

  const names = foundBirthdays
    .map((userId: string) => getUsername(serverId, userId))
    .filter(Boolean);

  if (names.length === 0) {
    return;
  }

  const startOfList = names.slice(0, -1).join(', ');
  const endOfList = names.slice(-1).join('');

  const list =
    names.length > 2
      ? `${startOfList}, and ${endOfList}`
      : names.length === 2
      ? `${startOfList} and ${endOfList}`
      : names[0];

  const unit = names.length === 1 ? 'birthday' : 'birthdays';
  const message = `The next ${unit} will be ${list} on ${formatDate(date)}.`;

  msg.channel.send(message);
};

export const birthday: Command = {
  description: 'Shows the next upcoming birthday in the server.',
  params: [],
  fn: showNextBirthday
};
