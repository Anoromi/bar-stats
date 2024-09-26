<script setup lang="tsx">
import { toTypedSchema } from "@vee-validate/zod";
import * as z from "zod";
import { useForm } from "vee-validate";
import type {
  BattlesProcessorRequest,
  BattlesProcessorResponse,
} from "~/utils/worker/battlesProcessorWorker";
import { useClientWorker } from "~/utils/worker/useClientWorker";
import { toast } from "~/components/ui/toast";

const formSchema = toTypedSchema(
  z.object({
    users: z
      .object({
        id: z.number().array(),
        name: z.string(),
        countryCode: z.string(),
      })
      .array()
      .default([]),
    map: z.string().optional(),
  }),
);

const form = useForm({
  validationSchema: formSchema,
});

const { worker } = useClientWorker<
  BattlesProcessorRequest,
  BattlesProcessorResponse
>(
  () =>
    new Worker(
      new URL("~/utils/worker/battlesProcessorWorker", import.meta.url),
      { type: "module" },
    ),
);

//watchEffect(async () => {
//  const client = import.meta.client;
//  if (client) {
//    const hehe2 = new Worker(
//      new URL("~/utils/worker/battlesProcessorWorker", import.meta.url),
//      {
//        type: "module",
//      },
//    );
//    hehe2.postMessage("eheheheh");
//    hehe2.postMessage({
//      type: "battle",
//      requestParams: {
//        map: null,
//        users: null,
//        limit: null,
//        battleType: null,
//      },
//    } satisfies BattleProcessorParams);
//    consola.log("loaded", hehe2);
//    hehe2.onmessage = (event) => {
//      console.log(event);
//    };
//  }
//});

const onSubmit = form.handleSubmit((values) => {
  console.log("Form submitted!", values);
  toast({
    title: "Form submitted!",
    description: JSON.stringify(values),
  });
  const { map, users } = form.values;

  worker
    .value!.request({
      type: "battle",
      params: {
        battleType: null,
        map: map ?? null,
        users: users?.flatMap((v) => v.id) ?? null,
        limit: 500,
      },
    })
    .then((v) => {
      console.log("worker result is ", v);
    });
});
</script>

<template>
  <article class="flex flex-1 flex-col items-center p-4">
    <div class="flex w-full flex-1 flex-col md:flex-row md:justify-center">
      <form
        class="mb-4 mt-4 flex h-max flex-col gap-y-4 rounded-2xl bg-surface p-4 sm:mt-10 md:w-96 md:shadow-md"
        @submit="onSubmit"
      >
        <legend class="mb-2 text-lg font-bold">Filter</legend>
        <GeneralMapSelector name="map"></GeneralMapSelector>
        <GeneralUserSelector name="users"></GeneralUserSelector>
        <Button type="submit" variant="outline">Update</Button>
      </form>

      <div class="flex-1 md:max-w-[56rem]">Other content ehe</div>
    </div>
  </article>
</template>
