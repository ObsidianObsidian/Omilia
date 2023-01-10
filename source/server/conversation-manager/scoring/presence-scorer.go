package scoring

import "conversation-manager/metrics"

type PresenceScorer struct{}

func (scorer PresenceScorer) ComputeScore(metrics *metrics.InterventionMetrics) float64 {
	if metrics.PresenceMetrics.GetTotalInterventionTime() == 0 {
		return 0
	}
	return metrics.SpeakingMetrics.GetTotalInterventionTime() / metrics.PresenceMetrics.GetTotalInterventionTime()
}
