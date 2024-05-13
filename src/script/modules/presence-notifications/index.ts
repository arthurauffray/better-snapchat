import { getPresencePayload, getTransientMessage } from '../../utils/snapchat';

enum PresenceStates {
  IDLE = 1,
  TYPING = 17,
  HALF_SWIPING = 256,
}

const senderPresenceStates = new Map<string, number>();

(() => {
  const GRPCTransientMessage = getTransientMessage();
  const GRPCPresencePayload = getPresencePayload();
  if (GRPCTransientMessage == null || GRPCPresencePayload == null) {
    return;
  }

  const { InboundTransientMessage } = GRPCTransientMessage as Record<string, any>;
  const { PresencePayload } = GRPCPresencePayload as Record<string, any>;

  MessagePort.prototype.addEventListener = new Proxy(MessagePort.prototype.addEventListener, {
    // eslint-disable-next-line no-undef
    apply: (target, thisArg, [type, listener, ...rest]: [string, EventListener]) => {
      if (type !== 'message') {
        return Reflect.apply(target, thisArg, [type, listener, ...rest]);
      }

      return Reflect.apply(target, thisArg, [
        type,
        (event: MessageEvent<{ path?: string[]; argumentList: { value: any }[] }>) => {
          const { data } = event;

          try {
            if (Array.isArray(data?.path) && data?.path?.includes('onReceive')) {
              const encodedTransientMessage = data.argumentList[0];
              const transientMessage = InboundTransientMessage.decode(encodedTransientMessage.value);
              if (transientMessage?.payload?.type !== 'presence') {
                return listener(event);
              }

              const presencePayload = PresencePayload.decode(transientMessage.payload.data);
              const presenceStateKey = `${presencePayload.senderUserId}:${presencePayload.senderSessionId}`;
              const presenceState = presencePayload.presenceStates[presenceStateKey];

              if (presenceState == null) {
                senderPresenceStates.delete(presencePayload.senderUserId);
                return listener(event);
              }

              const senderPrecenseState = senderPresenceStates.get(presencePayload.senderUserId);
              if (senderPrecenseState === presenceState.extendedBits) {
                return listener(event);
              }

              let notification: Notification | null = null;

              if (presenceState.extendedBits === PresenceStates.IDLE) {
                senderPresenceStates.set(presencePayload.senderUserId, presenceState.extendedBits);
                notification = new Notification(presencePayload.senderUsername, { body: 'Opened your Chat' });
              }

              if (presenceState.extendedBits === PresenceStates.HALF_SWIPING) {
                senderPresenceStates.set(presencePayload.senderUserId, presenceState.extendedBits);
                notification = new Notification(presencePayload.senderUsername, { body: 'Peeked at your Chat' });
              }

              setTimeout(() => notification?.close(), 5000);
            }
          } catch (_) {}

          return listener(event);
        },
        ...rest,
      ]);
    },
  });
})();
