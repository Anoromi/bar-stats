<script setup lang="ts">
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  CalendarDate,
  DateFormatter,
  getLocalTimeZone,
  parseDate,
  today,
} from "@internationalized/date";
import { CalendarIcon } from "@radix-icons/vue";
import { toDate } from "radix-vue/date";
import { useField } from "vee-validate";
import { computed, ref } from "vue";
import { cn } from "~/lib/utils";

const props = defineProps<{
  name: string;
}>();

const fieldData = useField<string | undefined>(props.name);

const df = new DateFormatter("en-US", {
  dateStyle: "long",
});

const placeholder = ref();

const value = computed({
  get: () =>
    fieldData.value.value ? parseDate(fieldData.value.value) : undefined,
  set: (val) => val,
});

/* const onSubmit = (values) => {
  toast({
    title: "You submitted the following values:",
    description: h(
      "pre",
      { class: "mt-2 w-[340px] rounded-md bg-slate-950 p-4" },
      h("code", { class: "text-white" }, JSON.stringify(values, null, 2)),
    ),
  });
} */
</script>

<template>
  <FormField :name="props.name">
    <FormItem class="flex flex-col">
      <FormLabel>Start date</FormLabel>
      <Popover>
        <PopoverTrigger as-child>
          <FormControl>
            <Button
              variant="elevated"
              :class="
                cn(
                  'w-[240px] ps-3 text-start font-normal',
                  !value && 'text-muted-foreground',
                )
              "
            >
              <span>{{
                value ? df.format(toDate(value)) : "Pick a date"
              }}</span>
              <CalendarIcon class="ms-auto h-4 w-4 opacity-50" />
            </Button>
            <input hidden />
          </FormControl>
        </PopoverTrigger>
        <PopoverContent class="w-auto p-0">
          <Calendar
            v-model:placeholder="placeholder"
            v-model="value"
            calendar-label="Date of birth"
            initial-focus
            :min-value="new CalendarDate(1900, 1, 1)"
            :max-value="today(getLocalTimeZone())"
            :clearable="true"
            @update:model-value="
              (v) => {
                if (v) {
                  fieldData.setValue(v.toString());
                } else {
                  fieldData.setValue(undefined);
                }
              }
            "
          />
        </PopoverContent>
      </Popover>
      <FormMessage />
    </FormItem>
  </FormField>
</template>
