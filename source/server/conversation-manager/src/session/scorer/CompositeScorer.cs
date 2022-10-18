

namespace CompositeScorers {
    abstract class CompositeScorer {
        abstract public List<double> ComputeScores(List<double> baseScores);
    }

    class ProportionalScorer: CompositeScorer {
        override public List<double> ComputeScores(List<double> baseScores) {
            var total = baseScores.Sum();
            return baseScores.Select(score => score / total).ToList();
        }
    }

    class RankScorer: CompositeScorer {
        override public List<double> ComputeScores(List<double> baseScores) {
            var ScoreWithId = new List<(double, string)>();
            var idsInOriginalOrder = new List<string>();
            baseScores.ForEach(score => {
                var id = new Guid().ToString();
                ScoreWithId.Add((score, id));
                idsInOriginalOrder.Add(id);
            });
            ScoreWithId.Sort((a, b) => (int)(a.Item1 - b.Item1));
            var idToRank = new Dictionary<string, double>();
            for (int idx = 0; idx < ScoreWithId.Count; idx++) {
                idToRank.Add(ScoreWithId[idx].Item2, idx);
            }
            var ranks = new List<double>();
            idsInOriginalOrder.ForEach(id => ranks.Add(idToRank[id]));
            return ranks;
        }
    }

    class RelativeToMaximumScorer: CompositeScorer {
        override public List<double> ComputeScores(List<double> baseScores) {
            var max = baseScores.Max();
            if (max == 0) {
                max = 1;
            }
            return baseScores.Select(score => score / max).ToList();
        }
    }

    class RelativeToAverageScorer: CompositeScorer {
        override public List<double> ComputeScores(List<double> baseScores) {
            var avg = baseScores.Average();
            if (avg == 0) {
                avg = 1;
            }
            return baseScores.Select(score => score / avg).ToList();
        }
    }
}