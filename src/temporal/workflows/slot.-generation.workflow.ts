import { proxyActivities } from "@temporalio/workflow";

import * as activities from "../activities/index.js";
import { RegenerateHostSlotsInput } from "../../services/slot.service.js";

const { regenerateHostSlotsActivity } = proxyActivities<typeof activities>({
  retry: { maximumAttempts: 3 },
  startToCloseTimeout: "10 minutes",
});

export async function regenerateHostSlotsWorkflow(
  input: RegenerateHostSlotsInput,
) {
  await regenerateHostSlotsActivity(input);
}
