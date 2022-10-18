using System.Linq;
using Messaging;
namespace ConversationEvents
{
    class ActivityTracker {
        public readonly string SpeakerId;
        public readonly string SessionId;

        public ActivityRecord SpeakingTime = new ActivityRecord();
        public ActivityRecord ConnectionTime = new ActivityRecord();
        public ActivityRecord PauseTime = new ActivityRecord();
        public ActivityTracker(string speakerId, string sessionId) {
            SpeakerId = speakerId;
            SessionId = sessionId;
            SetupListeners();
        }

        void SetupListeners() {
            string messagingEventBase = $"#.session_id.{SessionId}.#.speaker_id.{SpeakerId}.#.speaking";
            MessagingMediator.SetupListener(MessagingConstants.ExchangeNameExporter, messagingEventBase + ".start.#" , (model, ea) => {
                SpeakingTime.RegisterStart(((DateTimeOffset)DateTime.UtcNow));
            });
            MessagingMediator.SetupListener(MessagingConstants.ExchangeNameExporter, messagingEventBase + ".stop.#" , (model, ea) => {
                SpeakingTime.RegisterStop(((DateTimeOffset)DateTime.UtcNow));
            });
        }
    }

    class ActivityRecord {
        List<DateTimeOffset> StartRecord = new List<DateTimeOffset>();
        List<DateTimeOffset> StopRecord = new List<DateTimeOffset>();

        public void RegisterStart(DateTimeOffset timestamp) {
            if (OngoingActivity()) return;
            StartRecord.Add(timestamp);
        }

        public void RegisterStop(DateTimeOffset timestamp) {
            if (OngoingActivity()){
                StopRecord.Add(timestamp);
            }
        }

        public bool OngoingActivity() {
            return StartRecord.Count > StopRecord.Count;
        }

        public double GetTotalActiveTime() {
            var sum = StopRecord.Sum(it => it.ToUnixTimeMilliseconds()) - StartRecord.Sum(it => it.ToUnixTimeMilliseconds());
            if(OngoingActivity()) {
                sum += ((DateTimeOffset)DateTime.UtcNow).ToUnixTimeMilliseconds();
            }
            return sum;
        }

    }

}


