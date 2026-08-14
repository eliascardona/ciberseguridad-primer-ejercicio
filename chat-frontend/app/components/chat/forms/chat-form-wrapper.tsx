import { FormProvider, useForm } from 'react-hook-form';
import { ChatForm } from './chat-form';

export function ChatFormWrapper() {
  const form = useForm();
  return (
    <div className={'containerLy'}>
      <FormProvider {...form}>
        <ChatForm />
      </FormProvider>
    </div>
  );
}
