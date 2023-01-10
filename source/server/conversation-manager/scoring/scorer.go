package scoring

import "conversation-manager/metrics"

type Scorer interface {
	ComputeScore(metrics *metrics.InterventionMetrics) float64
}
