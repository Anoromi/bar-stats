import consola from "consola";
import { useApplicationService } from "../utils/services/applicationService";

export default defineEventHandler(async () => {
  console.log('hello?')
  await useApplicationService().syncDatabase();
  consola.log('finished')

});
