export async function serverActionHandler(requestBody: any): Promise<any> {
  const intent = requestBody.intent;
  if (!requestBody) return null;

  try {
    switch (intent) {
      case 'UPDATE': {
        return {
          success: true,
          message: 'The form data was successfully processed',
        };
      }

      default:
        return {
          success: false,
          message: 'Invalid server action intent',
        };
    }
  } catch (error: any) {
    console.error('Error performing server action:', error.message || 'null');
    return null;
  }
}
