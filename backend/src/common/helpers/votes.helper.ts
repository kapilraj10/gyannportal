import { VoteTarget } from '../../generated/prisma/client.js';

import { DatabaseService } from '../../database/database.service.js';

export async function getVoteMap(
  prisma: DatabaseService,
  userId: string,
  targetType: VoteTarget,
  targetIds: string[],
): Promise<Map<string, number>> {
  const map = new Map<string, number>();

  if (targetIds.length === 0) {
    return map;
  }

  const votes = await prisma.vote.findMany({
    where: {
      userId,
      targetType,
      targetId: { in: targetIds },
    },
    select: {
      targetId: true,
      value: true,
    },
  });

  for (const vote of votes) {
    map.set(vote.targetId, vote.value);
  }

  return map;
}

export function attachUserVotes<T extends { id: string }>(
  items: T[],
  voteMap: Map<string, number>,
): (T & { userVote: number | null })[] {
  return items.map((item) => ({
    ...item,
    userVote: voteMap.get(item.id) ?? null,
  }));
}