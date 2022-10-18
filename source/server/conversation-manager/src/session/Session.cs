using QuickType;
using ConversationEvents;
using Scorer;
using UnitScorers;
using System.Reactive.Linq;
using System.Reactive.Subjects;
using Messaging;

namespace Session
{
    class Session
    {
        static Dictionary<string, Session> Sessions = new Dictionary<string, Session>();
        public readonly string SessionId;
        private string SessionName;
        private Dictionary<string, ActivityTracker> UserActivityTrackers = new Dictionary<string, ActivityTracker>();
        private HashSet<string> RequestsToSpeak = new HashSet<string>();
        private HashSet<string> AuthenticatedSpeakers = new HashSet<string>();
        private readonly BehaviorSubject<Dictionary<string, UserScore>> LatestUserScores;
        static private readonly Subject<Session> SessionCreatedSubject = new Subject<Session>();
        private readonly Subject<Session> SessionEndedSubject = new Subject<Session>();
        private Subject<string> DestroySessionSubject = new Subject<string>();
        private Subject<NotificationToSessionEvent> ReceiveNotificationSubject = new Subject<NotificationToSessionEvent>();
        private Subject<NotificationFromSessionEvent> NotificationFromSessionSubject = new Subject<NotificationFromSessionEvent>();
        Scorer.Scorer Scorer;

        public Session(string sessionId, List<string> userIds) {
            SessionId = sessionId;
            userIds.ForEach((userId) => {
                UserActivityTrackers.Add(userId, new ActivityTracker(userId, sessionId));
            });
            Scorer = new Scorer.Scorer(UserActivityTrackers, new TotalTimeScorer(), new List<CompositeScorers.CompositeScorer>());
            LatestUserScores = new BehaviorSubject<Dictionary<string, UserScore>>(Scorer.ComputeUserScores());
            LatestUserScores.Subscribe(scores => {
                NotificationFromSessionSubject.OnNext(new NotificationFromSessionEvent {EventName = "userScoresUpdate", EventPayload =  new ScoresUpdateEvent { Scores =  scores.Values.ToArray()}.ToJson()});
            });
            var faker = new Bogus.Faker();
            SessionName = $"{faker.Address.City()} {faker.Commerce.Color()}";
            RegisterSession();
            SetupAutomaticScoreRefresh();
            SetupListeners();
            SessionCreatedSubject.OnNext(this);
        }

        void RegisterSession() {
            Sessions.Add(SessionId, this);
            this.DestroySessionSubject.Subscribe(_ => Session.Sessions.Remove(SessionId));
        }

        public SessionStateInfo GetState() {
            string[] connectedSpeakers = this.UserActivityTrackers.Values.Select(activityTracker => activityTracker.SpeakerId).ToArray();
            string[] requestsToSpeak = this.RequestsToSpeak.Select(requestUserId => requestUserId).ToArray();
            string[] authenticatedSpeakers = this.AuthenticatedSpeakers.ToArray();
            
            UserScore[] userScores = LatestUserScores.Value.Values.ToArray();
            return new SessionStateInfo { ConnectedSpeakers = connectedSpeakers, RequestsToSpeak = requestsToSpeak, UserScores = userScores, AuthenticatedSpeakers = authenticatedSpeakers, SessionName = SessionName };
        }
        
        static public Session GetSessionById(string sessionId) {
            Session session;
            var sessionExists = Sessions.TryGetValue(sessionId, out session);
            if (!sessionExists) {
                throw new KeyNotFoundException($"Session with sessionId '{sessionId}' does not exist");
            }
            return session;
        }

        void RefreshUserScores() {
            LatestUserScores.OnNext(Scorer.ComputeUserScores());
        }

        void SetupAutomaticScoreRefresh() {
            var timer = new System.Threading.Timer((_) => {RefreshUserScores();}, null, 1000, 5000);
            DestroySessionSubject.Subscribe(_ => timer.Dispose());
        }


        void SetupListeners() {
            var connectionStatusConsumerTag = MessagingMediator.SetupListener("EXCHANGE_NAME_EXPORTER", $"session_id.{SessionId}.speaker_id.*.connection_status.#", (model, ea) => {
                var userConnectionStatusEvent = UserConnectionStatusEvent.FromJson(MessagingMediator.GetStringFromBuffer(ea.Body));
                var eventToSendName = "";
                if (userConnectionStatusEvent.EventName == "join") {
                    eventToSendName = "userJoin";
                    UserActivityTrackers.Add(userConnectionStatusEvent.UserId, new ActivityTracker(userConnectionStatusEvent.UserId, SessionId));
                } 
                if (userConnectionStatusEvent.EventName == "leave") {
                    eventToSendName = "userLeave";
                    UserActivityTrackers.Remove(userConnectionStatusEvent.UserId);
                }
                SendNotification(new NotificationFromSessionEvent{EventName = eventToSendName, EventPayload = userConnectionStatusEvent.ToJson()});
            });
            var sessionEndConsumerTag = MessagingMediator.SetupListener("EXCHANGE_NAME_EXPORTER", $"session_id.{SessionId}.end", (model, ea) => {
                DestroySessionSubject.OnNext("");
            });
            DestroySessionSubject.Subscribe(_ => {
                MessagingMediator.BasicCancel(connectionStatusConsumerTag);
                MessagingMediator.BasicCancel(sessionEndConsumerTag);
                SendNotification(new NotificationFromSessionEvent{EventName = "sessionEnded"});
                SessionEndedSubject.OnNext(this);
            });

            ReceiveNotificationSubject.Subscribe(notification => {
                switch(notification.EventName) {
                    case "authentication":
                    AuthenticatedSpeakers.Add(UserSessionEvent.FromJson(notification.EventPayload).UserId);
                    SendNotification(new NotificationFromSessionEvent {EventName = "authentication", EventPayload = notification.EventPayload});
                    break;
                    case "endAuthentication":
                    AuthenticatedSpeakers.Remove(UserSessionEvent.FromJson(notification.EventPayload).UserId);
                    SendNotification(new NotificationFromSessionEvent {EventName = "endAuthentication", EventPayload = notification.EventPayload});
                    break;
                    case "requestToSpeak":
                    RequestsToSpeak.Add(UserSessionEvent.FromJson(notification.EventPayload).UserId);
                    SendNotification(new NotificationFromSessionEvent {EventName = "requestToSpeak", EventPayload = notification.EventPayload});
                    break;
                    case "endRequestToSpeak":
                    RequestsToSpeak.Remove(UserSessionEvent.FromJson(notification.EventPayload).UserId);
                    SendNotification(new NotificationFromSessionEvent {EventName = "endRequestToSpeak", EventPayload = notification.EventPayload});
                    break;
                }
            });
        }

        public void NotifyEvent(NotificationToSessionEvent notification) {
            ReceiveNotificationSubject.OnNext(notification);
        }

        private void SendNotification(NotificationFromSessionEvent notification) {
            this.NotificationFromSessionSubject.OnNext(notification);
        }

        public IObservable<NotificationFromSessionEvent> GetNotificationFromSessionObservable() {
            return NotificationFromSessionSubject.AsObservable();
        }

        static public IObservable<Session> GetSessionCreatedObservable() {
            return SessionCreatedSubject.AsObservable();
        }
        public IObservable<Session> GetSessionEndedObservable() {
            return SessionEndedSubject.AsObservable();
        }

    }
}