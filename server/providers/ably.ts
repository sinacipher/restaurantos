import * as Ably from 'ably';
import { env } from '../config/env.js';

export const ably = env.ENABLE_ABLY && env.ABLY_API_KEY
  ? new Ably.Rest(env.ABLY_API_KEY)
  : null;

export async function publishEvent(channelName: string, eventName: string, data: unknown) {
  if (!ably) return; // Silently skip if Ably is disabled
  const channel = ably.channels.get(channelName);
  await channel.publish(eventName, data);
}