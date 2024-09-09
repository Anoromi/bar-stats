import { isClient, useDebounce } from "@vueuse/core";
import consola from "consola";
import { computed } from "vue";
import type { GetMapSuggestionQuery } from "~/server/api/map-suggestion";

export function useMapSearch(searchedValue: Ref<string>) {
  const debouncedSearchValue = useDebounce(searchedValue, 300);

  const computedQuery = computed<GetMapSuggestionQuery>(() => {
    return {
      name: debouncedSearchValue.value,
    };
  });
  

  const { data: mapSuggestions, status } = useLazyFetch("/api/map-suggestion", {
   query: computedQuery,
   onRequest: () => {
     consola.log("request data", computedQuery.value);
   },
   onResponse: () => {
     consola.log("got data");
   },
  });

  // watchEffect(async () => {
  //   if (isClient) {
  //     consola.log("other test");
  //     const result = await $fetch("/api/map-suggestion", {
  //       query: computedQuery.value,
  //     });
  //     consola.log("look how fast I got", result);
  //   }
  // });

  const isLoading = computed(() => status.value === "pending");
  return { mapSuggestions, isLoading: isLoading };
}
