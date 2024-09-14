<script setup lang="tsx">
import consola from "consola";
import { toTypedSchema } from "@vee-validate/zod";
import * as z from "zod";
import { useForm } from "vee-validate";
import type { BattleProcessorParams } from "~/utils/worker/battlesProcessor";

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
    //username: z.string().min(2).max(50),
    map: z.string(),
    hehe: z.string(),
  }),
);

const form = useForm({
  validationSchema: formSchema,
});

watchEffect(async () => {
  const client = import.meta.client;
  if (client) {
    const hehe2 = new Worker(
      new URL("~/utils/worker/battlesProcessor", import.meta.url),
      {
        type: "module",
      },
    );
    hehe2.postMessage("eheheheh");
    hehe2.postMessage({
      type: "battle",
      requestParams: {
        map: null,
        users: null,
        limit: null,
        battleType: null,
      },
    } satisfies BattleProcessorParams);
    consola.log("loaded", hehe2);
    hehe2.onmessage = (event) => {
      console.log(event);
    };
  }
});

const onSubmit = form.handleSubmit((values) => {
  console.log("Form submitted!", values);
});

</script>

<template>
  <form @submit="onSubmit">
    <FormField v-slot="data" name="map">
      <GeneralMapSelector v-bind="data"></GeneralMapSelector>
    </FormField>
    <GeneralUserSelector name="users"></GeneralUserSelector>
    <Button type="submit">Submit</Button>
  </form>
</template>
