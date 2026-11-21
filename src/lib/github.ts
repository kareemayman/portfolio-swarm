import { cacheLife } from "next/cache";

/** 0 is no activity, 4 is the busiest quartile. */
export type Level = 0 | 1 | 2 | 3 | 4;
export type Day = { date: string; count: number; level: Level };
export type Calendar = { weeks: Day[][]; total: number };

const LEVELS: Record<string, Level> = {
  NONE: 0,
  FIRST_QUARTILE: 1,
  SECOND_QUARTILE: 2,
  THIRD_QUARTILE: 3,
  FOURTH_QUARTILE: 4,
};

const QUERY = `
  query ($login: String!) {
    user(login: $login) {
      contributionsCollection {
        contributionCalendar {
          weeks { contributionDays { date contributionCount contributionLevel } }
        }
      }
    }
  }`;

type Response = {
  data?: {
    user?: {
      contributionsCollection: {
        contributionCalendar: {
          weeks: {
            contributionDays: {
              date: string;
              contributionCount: number;
              contributionLevel: string;
            }[];
          }[];
        };
      };
    } | null;
  };
};

const WEEKS = 52;

/**
 * The last 52 weeks of public contributions, or null when GitHub can't be reached.
 * A null hides the panel: the handoff prefers no panel to stale or made-up squares.
 * A good answer is kept for a day; a failure is retried after a minute.
 */
export async function getContributions(login: string): Promise<Calendar | null> {
  "use cache";

  const calendar = await fetchCalendar(login);
  if (calendar) cacheLife("days");
  else cacheLife("minutes");
  return calendar;
}

async function fetchCalendar(login: string): Promise<Calendar | null> {
  const token = process.env.GITHUB_TOKEN;
  if (!token) return null;

  try {
    const res = await fetch("https://api.github.com/graphql", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "User-Agent": "portfolio",
      },
      body: JSON.stringify({ query: QUERY, variables: { login } }),
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return null;

    const json = (await res.json()) as Response;
    const all = json.data?.user?.contributionsCollection.contributionCalendar.weeks;
    if (!all?.length) return null;

    const weeks = all.slice(-WEEKS).map((week) =>
      week.contributionDays.map(
        (d): Day => ({
          date: d.date,
          count: d.contributionCount,
          level: LEVELS[d.contributionLevel] ?? 0,
        }),
      ),
    );
    const total = weeks.flat().reduce((sum, d) => sum + d.count, 0);
    return { weeks, total };
  } catch {
    return null;
  }
}
