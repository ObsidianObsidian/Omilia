using Microsoft.AspNetCore.SignalR;
using QuickType;

namespace EventsHub
{
    public class EventsHub : Hub
    {
        public EventsHub() {
            Session.Session.GetSessionCreatedObservable().Subscribe(session => {
                OnSessionCreate(session);
            });

        }

        public Task Register(string sessionInfoJson)
        {
            var connectionInfo = SocketConnectionInfo.FromJson(sessionInfoJson);
            JoinGroup(connectionInfo.SessionId);
            try {
                return Clients.Caller.SendAsync("loadSession", Session.Session.GetSessionById(connectionInfo.SessionId).GetState().ToJson());
            } catch {
                return Clients.Caller.SendAsync("error", new OmiliaError { ErrorName = "CANNOT_LOAD_FROM_UNKNOWN_SESSION" }.ToJson()); // TODO send error
            }
        }

        public void NotifySession(string sessionId, string notification) {
            Session.Session.GetSessionById(sessionId).NotifyEvent(NotificationToSessionEvent.FromJson(notification));
        }

        private void JoinGroup(string groupId) {
            Groups.AddToGroupAsync(Context.ConnectionId, groupId);
            Console.WriteLine($"• Added to group {groupId}");
        }

        private void OnSessionCreate(Session.Session session) {
            var eventSub = session.GetNotificationFromSessionObservable().Subscribe(notification => {
                Clients.Group(session.SessionId).SendAsync("notificationFromSession", notification.ToJson());
            });

            session.GetSessionEndedObservable().Subscribe(_ => {
                eventSub.Dispose();
            });
        }
    }
}