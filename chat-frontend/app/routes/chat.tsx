import { MainViewChat } from '~/components/chat/main-view';
import { MessagingRequestBodySchema } from '~/lib/chat/request-types';
import { chatServerActionHandler } from '~/lib/chat/server';
import type { Route } from './+types/chat';

export function meta(args: Route.MetaArgs) {
  return [
    { title: 'Online Products Selling App' },
    {
      name: 'description',
      content: 'Coloca una descripción útil para las búsquedas de Google',
    },
  ];
}

export async function action(args: Route.ActionArgs) {
  const formData = await args.request.json();

  if (!formData) throw new Error("You didn't send a request body");

  const requestBody = MessagingRequestBodySchema.parse(formData);

  const actionHandlerResult = await chatServerActionHandler(requestBody);

  return actionHandlerResult;
}

export default function ChatRoute() {
  return <MainViewChat />;
}
