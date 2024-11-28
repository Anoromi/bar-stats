<script setup lang="ts">
import Button from "../ui/button/Button.vue";
import { generateURLParams } from "~/utils/battleProcessor/generateParams";
import type { GeneralPageQuery } from "~/pages/stats/index.vue";
import { useToast } from "../ui/toast";
import type { GeneralFormData } from "~/utils/general/formSchema";

const props = defineProps<{
  searchParams: GeneralFormData;
}>();

const { toast } = useToast();
function copy() {
  let url: string;
  if (window.location.port !== "443" && window.location.port !== "80") {
    url = window.location.host;
  } else {
    url = window.location.hostname;
  }
  navigator.clipboard.writeText(
    `${url}/stats?` +
      generateURLParams<GeneralPageQuery>(
        ["search", btoa(JSON.stringify(props.searchParams))],
        ["preload", ""],
      ),
  );
  toast({
    title: "Copied!",
  });
}
</script>
<template>
  <Button variant="outline" @click="copy">
    <slot />
  </Button>
</template>
