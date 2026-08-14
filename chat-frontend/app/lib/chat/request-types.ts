import { z } from 'zod';
import { zod_string } from '../shared/types';

/*
  SCHEMAS AND TYPES FOR ACTIONS
*/
export const MessagingActionEnum = z.enum([
  'REQUEST_MESSAGE_SAVING',
  'REQUEST_MESSAGE_VALIDATION',
]);
export type MessagingAction = z.infer<typeof MessagingActionEnum>;

/*
  ORDERS
*/
const SaveMessageCommandSchema = z.object({
  message: zod_string,
});
export type SaveMessageCommand = z.infer<typeof SaveMessageCommandSchema>;

/*
  POLYMORPHIC REQUEST SCHEMA
*/
const MessagingRequestBaseSchema = z.object({
  intent: MessagingActionEnum,
});

export const MessageSavingRequestSchema = MessagingRequestBaseSchema.extend({
  intent: z.literal(MessagingActionEnum.enum.REQUEST_MESSAGE_SAVING),
  body: SaveMessageCommandSchema,
});
export type MessageSavingRequestBody = z.infer<
  typeof MessageSavingRequestSchema
>;

export const MessagingRequestBodySchema = z.discriminatedUnion('intent', [
  MessageSavingRequestSchema,
]);
export type MessagingRequestBody = z.infer<typeof MessagingRequestBodySchema>;
