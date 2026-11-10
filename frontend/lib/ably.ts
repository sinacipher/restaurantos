import * as Ably from 'ably';

let ablyClient: Ably.Realtime | null = null;

export async function getAblyClient(restaurantId: string) {
  if (ablyClient) return ablyClient;

  ablyClient = new Ably.Realtime({
    authUrl: '/api/v1/ably/token',
    authMethod: 'POST',
    authHeaders: {
      'x-restaurant-id': restaurantId,
    },
  });

  return ablyClient;
}

export function disconnectAbly() {
  if (ablyClient) {
    ablyClient.close();
    ablyClient = null;
  }
}