import { useState } from 'react';
import type { AvailableUsername } from '~/lib/shared/types';
import { cn } from '~/lib/utils';
import { ChatController } from './chat-controller';

export function MainViewChat() {
  const [username, setUsername] = useState<AvailableUsername | null>(null);

  return (
    <div className="space-y-8 pt-8">
      <h1 className="text-3xl">Bienvenido al chat</h1>

      <div className="mx-auto grid w-1/2 grid-cols-2 gap-2">
        <div
          className={cn(
            'cursor-pointer rounded-md border p-4 text-center',
            username != null && username === 'Fulanito'
              ? 'border-sky-100 bg-sky-50'
              : ''
          )}
          onClick={() => setUsername('Fulanito')}>
          Fulanito
        </div>

        <div
          className={cn(
            'cursor-pointer rounded-md border p-4 text-center',
            username != null && username === 'Fulanita'
              ? 'border-sky-100 bg-sky-50'
              : ''
          )}
          onClick={() => setUsername('Fulanita')}>
          Fulanita
        </div>
      </div>

      {username && (
        <>
          <h2 className="text-xl">Ingresarás al chat como {username}</h2>

          <ChatController username={username} />
        </>
      )}
    </div>
  );
}
