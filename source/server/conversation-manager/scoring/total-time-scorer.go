package scoring

import (
	"conversation-manager/metrics"
)

type TotalTimeScorer struct{}

func (scorer TotalTimeScorer) ComputeScore(metrics *metrics.InterventionMetrics) float64 {
	return metrics.SpeakingMetrics.GetTotalInterventionTime()
}
