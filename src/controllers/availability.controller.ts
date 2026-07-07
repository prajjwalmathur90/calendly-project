import { Request, Response } from "express";
import {
  createExceptionService,
  createRuleService,
  deleteExceptionService,
  deleteRuleService,
  listExceptionsService,
  listRulesService,
  updateExceptionService,
  updateRuleService,
} from "../services/availability.service.js";
import { sendSuccess } from "../utils/api-response.js";

export async function findAllRules(req: Request, res: Response) {
  const rules = await listRulesService(req.userId);
  sendSuccess(res, rules);
}

export async function createRule(req: Request, res: Response) {
  const response = await createRuleService(req.userId, req.body);
  sendSuccess(res, response, 201, "Availability Rule Created Successfully");
}

export async function updateRule(req: Request, res: Response) {
  const { id } = req.params;
  const response = await updateRuleService(req.userId, Number(id), req.body);
  sendSuccess(res, response, 200, "Availability Rule Updated Successfully");
}

export async function deleteRule(req: Request, res: Response) {
  const { id } = req.params;
  const rule = await deleteRuleService(req.userId, Number(id));
  sendSuccess(res, rule, 200, "Availability Rule Deleted Successfully");
}

export async function findAllExceptions(req: Request, res: Response) {
  const exceptions = await listExceptionsService(req.userId);
  sendSuccess(res, exceptions);
}

export async function createException(req: Request, res: Response) {
  const response = await createExceptionService(req.userId, req.body);
  sendSuccess(
    res,
    response,
    201,
    "Availability Exception Created Successfully",
  );
}

export async function updateException(req: Request, res: Response) {
  const { id } = req.params;
  const response = await updateExceptionService(
    req.userId,
    Number(id),
    req.body,
  );
  sendSuccess(res, response, 200, "Availability Exception Updated Successfully");
}

export async function deleteException(req: Request, res: Response) {
  const { id } = req.params;
  const exception = await deleteExceptionService(req.userId, Number(id));
  sendSuccess(
    res,
    exception,
    200,
    "Availability Exception Deleted Successfully",
  );
}
