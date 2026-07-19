import {
  RegenerateHostSlotsInput,
  regenerateHostSlots as runSlotGeneration,
} from "../../services/slot.service.js";

export async function regenerateHostSlotsActivity(
  input: RegenerateHostSlotsInput,
) {
  await runSlotGeneration(input);
}
