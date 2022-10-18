using CompositeScorers;
using UnitScorers;
using ConversationEvents;
using QuickType;

namespace Scorer {
    class Scorer {
        Dictionary<string, ActivityTracker> ActivityTrackers;
        List<CompositeScorer> CompositeScorers;
        UnitScorer BaseUnitScorer;

        public Scorer(Dictionary<string, ActivityTracker> activityTrackers , UnitScorer baseScorer, List<CompositeScorer> ?compositeScorers) {
            ActivityTrackers = activityTrackers;
            CompositeScorers = compositeScorers != null ? compositeScorers : new List<CompositeScorer>();
            BaseUnitScorer = new TotalTimeScorer();
        }

        private List<double> ComputeRawScores() {
            var scores = ActivityTrackers.Values.Select(tracker => BaseUnitScorer.ComputeScore(tracker)).ToList();
            CompositeScorers.ForEach(compositeScorer => {
                scores = compositeScorer.ComputeScores(scores);
            });
            return scores;
        }

        public Dictionary<string, UserScore> ComputeUserScores() {
            var rawScores = ComputeRawScores();
            var result = new Dictionary<string, UserScore>();
            for (int i=0; i < ActivityTrackers.Count; i++) {
                result.Add(ActivityTrackers.Values.ToList()[i].SpeakerId, new UserScore {Score = rawScores[i], UserId = ActivityTrackers.Values.ToList()[i].SpeakerId});
            }
            return result;
        }
    }
}