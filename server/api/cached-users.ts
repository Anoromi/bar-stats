import { z } from "zod";
import { getCachedUsers } from "../utils/api-calls/bar-cached-users";

const result = z.array(
  z.object({
    id: z.number().array(),
    username: z.string(),
    countryCode: z.string().nullable(),
  }),
);

type Response = z.infer<typeof result>;

export default defineCachedEventHandler<never, Promise<Response>>(
  async () => {
    const response = await getCachedUsers();
    const groupedUpUsers: Response = [
      {
        username: response[0].username,
        id: [response[0].id],
        countryCode: response[0].countryCode,
      },
    ];
    for (let i = 1; i < response.length; i++) {
      const next = response[i];
      const lastValue = groupedUpUsers[groupedUpUsers.length - 1];
      if (lastValue.username === next.username) {
        lastValue.id.push(next.id);
      } else {
        groupedUpUsers.push({
          username: next.username,
          id: [next.id],
          countryCode: next.countryCode,
        });
      }
    }
    return result.parse(groupedUpUsers);
  },
  {
    maxAge: 60 * 60,
  },
);

export type { Response as CachedUsersResponse };
