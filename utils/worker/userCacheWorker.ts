import { z } from "zod";
import type { UserDto } from "~/server/utils/dto/dto";
import { WorkerServer } from "./core/server";
import { crashInterrupted } from "./core/crash";
import { sortedFilter } from "../other/sortedFilter";

export type UserCacheRequest = {
  type: "get-users";
  value: string;
};

const barCachedUsers = z.array(
  z.object({
    id: z.number().int(),
    username: z.string(),
    countryCode: z.string().nullable(),
  }),
);

export type UserCacheResponse = {
  type: "get-users";
  data: UserDto[];
};

const usersPromise: Promise<UserDto[]> = getCachedUsers();

const worker = new WorkerServer<UserCacheRequest, UserCacheResponse>(
  async (context, data) => {
    switch (data.type) {
      case "get-users": {
        console.log("getting users for", data.value);
        console.count('getting users')
        const users = await usersPromise;
        console.count('getting users')
        await crashInterrupted(context.check());
        console.count('getting users')
        const searchedValue = data.value;
        console.count('getting users')
        const collator = Intl.Collator(undefined, { sensitivity: "accent" });
        console.count('getting users')
        console.log("getting users for 2", data.value);
        const sortedOptions = sortedFilter(
          users,
          (v) => {
            if (
              v.username
                .toLocaleLowerCase()
                .startsWith(searchedValue.toLocaleLowerCase())
            )
              return 0;
            return collator.compare(v.username, searchedValue);
          },
          (v) => {
            if (
              v.username
                .toLocaleLowerCase()
                .startsWith(searchedValue.toLocaleLowerCase())
            )
              return 0;
            return collator.compare(v.username, searchedValue);
          },
          {
            context,
          },
        );
        const shortenedOptions = (await sortedOptions).slice(undefined, 20);
        console.log('returning', shortenedOptions)
        return {
          type: "get-users",
          data: shortenedOptions,
        };
      }
    }
  },
);

onmessage = worker.listener;

async function getCachedUsers(): Promise<UserDto[]> {
  const response = barCachedUsers.parse(
    await fetch("https://api.bar-rts.com/cached-users").then((v) => v.json()),
  );
  console.log("cached", response.length);
  const collator = new Intl.Collator(undefined, {
    sensitivity: "accent",
  }).compare;
  response.sort((a, b) => collator(a.username, b.username));

  const groupedUpUsers = [
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
  return groupedUpUsers;
}
