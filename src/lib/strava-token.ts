import { prisma } from "./prisma";
import { refreshAccessToken } from "./strava";

export async function getValidAccessToken(athleteId?: string) {
  const token = await prisma.stravaToken.findFirst({
    where: athleteId ? { athleteId } : undefined,
    orderBy: { updatedAt: "desc" },
  });

  if (!token) return null;

  const bufferMinutes = 5;
  const needsRefresh = new Date() >= new Date(token.expiresAt.getTime() - bufferMinutes * 60 * 1000);

  if (needsRefresh) {
    const refreshed = await refreshAccessToken(token.refreshToken);
    await prisma.stravaToken.update({
      where: { id: token.id },
      data: {
        accessToken: refreshed.accessToken,
        refreshToken: refreshed.refreshToken,
        expiresAt: refreshed.expiresAt,
      },
    });
    return refreshed.accessToken;
  }

  return token.accessToken;
}
