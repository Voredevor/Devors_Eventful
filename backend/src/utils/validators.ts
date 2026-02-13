import Joi from "joi";
import { ValidationError } from "./errors";

export const schemas = {
  email: Joi.string().email().required(),
  password: Joi.string()
    .min(8)
    .required()
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/),
  phone: Joi.string()
    .pattern(/^\+?[1-9]\d{1,14}$/)
    .optional()
    .allow(null),
  uuid: Joi.string().guid({ version: "uuidv4" }).required(),
  pagination: Joi.object({
    page: Joi.number().min(1).default(1),
    limit: Joi.number().min(1).max(100).default(10),
  }),
};

export const validateRequest = <T = Record<string, unknown>>(
  data: unknown,
  schema: Joi.Schema
): T => {
  const { error, value } = schema.validate(data, {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    const details = error.details.map((d) => `${d.path.join(".")}: ${d.message}`).join("; ");
    throw new ValidationError(details);
  }

  return value as T;
};

export const createRegisterSchema = () =>
  Joi.object({
    email: schemas.email,
    password: schemas.password,
    firstName: Joi.string().min(2).max(50).required(),
    lastName: Joi.string().min(2).max(50).required(),
    phone: schemas.phone,
    userType: Joi.string().valid("creator", "eventee").required(),
  });

export const createLoginSchema = () =>
  Joi.object({
    email: schemas.email,
    password: Joi.string().required(),
  });

export const createEventSchema = () =>
  Joi.object({
    title: Joi.string().min(3).max(200).required(),
    description: Joi.string().min(10).max(2000).required(),
    category: Joi.string().min(2).max(50).required(),
    imageUrl: Joi.string().uri().optional().allow(null, ""),
    location: Joi.string().min(5).max(200).required(),
    startDate: Joi.date().iso().required(),
    endDate: Joi.date().iso().greater(Joi.ref("startDate")).required(),
    totalTickets: Joi.number().min(1).required(),
    price: Joi.number().min(0).precision(2).required(),
    reminderDefault: Joi.string()
      .valid("1day", "1week", "custom")
      .optional()
      .default("1day"),
    customReminderHours: Joi.number()
      .min(1)
      .when("reminderDefault", {
        is: "custom",
        then: Joi.required(),
        otherwise: Joi.optional(),
      }),
  });

export const createTicketPurchaseSchema = () =>
  Joi.object({
    eventId: schemas.uuid,
  });

export const createPaymentInitSchema = () =>
  Joi.object({
    eventId: schemas.uuid,
    ticketId: schemas.uuid,
    amount: Joi.number().positive().required(),
  });

export const createScanTicketSchema = () =>
  Joi.object({
    qrData: Joi.string().min(1).required(),
  });

export const createReminderPreferenceSchema = () =>
  Joi.object({
    eventId: schemas.uuid,
    reminderDaysBefore: Joi.number().min(1).required(),
    reminderTime: Joi.string()
      .pattern(/^\d{2}:\d{2}$/)
      .required(),
    enabled: Joi.boolean().default(true),
  });
