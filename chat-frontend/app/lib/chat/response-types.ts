import { z } from 'zod';
import { zod_string, zod_uuid } from '../shared/types';

/*
  API RESPONSES
*/

/* Message saved Response DTO schema */
export const SavedMessageResponseDtoSchema = z.object({
  id: zod_uuid,
  message: zod_string,
});
export type SavedMessageResponseDto = z.infer<
  typeof SavedMessageResponseDtoSchema
>;

/*
  SCHEMAS AND TYPES FOR ACTIONS
*/
export const MessagingResponseEnum = z.enum([
  'MESSAGE_SAVED',
  'MESSAGE_VALIDATED',
]);
export type MessagingResponse = z.infer<typeof MessagingResponseEnum>;

/*
  POLYMORPHIC SERVER ACTION'S RESULT TYPE
  TO AID THE SERVER RESULT HANDLING
*/

const ShoppingActionResultBaseSchema = z.object({
  type: MessagingResponseEnum,
});

export const MessageSavedResultSchema =
  ShoppingActionResultBaseSchema.extend({
    type: z.literal(MessagingResponseEnum.enum.MESSAGE_SAVED),
    id: zod_uuid,
    message: zod_string,
  });
export type MessageSavedResult = z.infer<
  typeof MessageSavedResultSchema
>;

export const MesaagingActionResultSchema = z.discriminatedUnion('type', [
  MessageSavedResultSchema,
]);

export type MesaagingActionResult = z.infer<typeof MesaagingActionResultSchema>;
