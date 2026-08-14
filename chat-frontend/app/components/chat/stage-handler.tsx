import { useState } from 'react';
import { toast } from 'sonner';
import type { ChatEvent, ChatState } from '~/lib/chat/stateMachineReducer';

export function ChatViewHandler({
  state,
  dispatch,
}: {
  state: ChatState;
  dispatch: React.Dispatch<ChatEvent>;
}) {
  const [messageValue, setMessageValue] = useState<string | null>(null);

  const handleSubmit = () => {
    if (messageValue && messageValue.length) {
      dispatch({
        type: 'SEND_MESSAGE',
        draftMessage: messageValue,
      });
    }

    toast.error('El mensaje no puede estar vacío');
  };

  return (
    <div className="mx-auto w-1/2">
      <div className="mb-4 space-y-2">
        {state.messages.map((message: any) => (
          <div key={message.id} className="rounded-md border p-3">
            {message.status === 'PENDING_VERIFICATION' ? (
              <div className="text-gray-500">
                mensaje pendiente de verificar
              </div>
            ) : (
              <div>{message.content}</div>
            )}
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <input
          name="content"
          type="text"
          className="flex-1 rounded-md border px-3 py-2"
          placeholder="Escribe un mensaje..."
          onChange={(e) => setMessageValue(e.currentTarget.value)}
        />

        <button
          type="button"
          className="rounded-md border px-4 py-2"
          onClick={handleSubmit}>
          Enviar
        </button>
      </div>
    </div>
  );
}
