using ConversationEvents;

namespace UnitScorers {
    abstract class UnitScorer {
        public abstract double ComputeScore(ActivityTracker activityTracker);
    }

    class TotalTimeScorer : UnitScorer {
        override public double ComputeScore(ActivityTracker activityTracker) {
            return activityTracker.SpeakingTime.GetTotalActiveTime();
        }
    }

    class PresenceScorer : UnitScorer {
        override public double ComputeScore(ActivityTracker activityTracker) {
            return activityTracker.SpeakingTime.GetTotalActiveTime() / activityTracker.ConnectionTime.GetTotalActiveTime();
        }
    }
}