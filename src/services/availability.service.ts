import {
  CreateAvailabilityExceptionDto,
  CreateAvailabilityRuleDto,
  UpdateAvailabilityExceptionDto,
  UpdateAvailabilityRuleDto,
} from "../dtos/availability.js";
import {
  createAvailability,
  createException,
  deleteAvailability,
  deleteException,
  findAvailabilityById,
  findAvailabilityByUser,
  findAvailabilityExceptionById,
  findAvailabilityExceptionByUser,
  updateAvailability,
  updateException,
} from "../repositories/availability.js";
import { getByID } from "../repositories/user.repository.js";
import { regenerateHostSlotsWorkflow } from "../temporal/workflows/slot-generation.workflow.js";
import { forbidden, notFound } from "../utils/api-error.js";

export async function listRulesService(userId: number) {
  const rules = await findAvailabilityByUser(userId);
  if (!rules) {
    throw notFound("No availability rules found");
  }

  return rules;
}

export async function createRuleService(
  userId: number,
  data: CreateAvailabilityRuleDto,
) {
  const user = await getByID(userId);
  if (!user) {
    throw notFound("User not found");
  }

  await regenerateHostSlotsWorkflow({ hostId: userId });

  return createAvailability(userId, data);
}

export async function updateRuleService(
  userId: number,
  id: number,
  data: UpdateAvailabilityRuleDto,
) {
  const rule = await findAvailabilityById(id);
  if (!rule) {
    throw notFound("Availability rule not found");
  }

  if (rule.userId !== userId) {
    throw forbidden("You are not authorized to update this availability rule");
  }

  const update = await updateAvailability(id, data);
  await regenerateHostSlotsWorkflow({ hostId: userId });
  return update;
}

export async function deleteRuleService(userId: number, id: number) {
  const rule = await findAvailabilityById(id);
  if (!rule) {
    throw notFound("Availability rule not found");
  }

  if (rule.userId !== userId) {
    throw forbidden("You are not authorized to delete this availability rule");
  }

  const remove = await deleteAvailability(id);
  await regenerateHostSlotsWorkflow({ hostId: userId });
  return remove;
}

export async function listExceptionsService(userId: number) {
  const exceptions = await findAvailabilityExceptionByUser(userId);
  if (!exceptions) {
    throw notFound("No availability exceptions found");
  }

  return exceptions;
}

export async function createExceptionService(
  userId: number,
  data: CreateAvailabilityExceptionDto,
) {
  const user = await getByID(userId);
  if (!user) {
    throw notFound("User not found");
  }
  await regenerateHostSlotsWorkflow({ hostId: userId });

  return createException(userId, data);
}

export async function updateExceptionService(
  userId: number,
  id: number,
  data: UpdateAvailabilityExceptionDto,
) {
  const exception = await findAvailabilityExceptionById(id);
  if (!exception) {
    throw notFound("Availability exception not found");
  }

  if (exception.userId !== userId) {
    throw forbidden(
      "You are not authorized to update this availability exception",
    );
  }

  const update = await updateException(id, data);
  await regenerateHostSlotsWorkflow({ hostId: userId });
  return update;
}

export async function deleteExceptionService(userId: number, id: number) {
  const exception = await findAvailabilityExceptionById(id);
  if (!exception) {
    throw notFound("Availability exception not found");
  }

  if (exception.userId !== userId) {
    throw forbidden(
      "You are not authorized to delete this availability exception",
    );
  }

  const remove = await deleteException(id);
  await regenerateHostSlotsWorkflow({ hostId: userId });
  return remove;
}
