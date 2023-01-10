package scoring

import (
	"conversation-manager/metrics"
	"fmt"
	"testing"
	"time"
)

func TestPresenceScorer(t *testing.T) {
	tests := []struct {
		metrics  metrics.InterventionMetrics
		expected float64
	}{
		{ // Zero on empty record
			metrics.InterventionMetrics{},
			0,
		},
		{ // Zero when no presence
			metrics.InterventionMetrics{
				SpeakingMetrics: metrics.InterventionRecord{
					StartInterventions: []time.Time{time.Now().Add(-time.Second * 5)},
					StopInterventions:  []time.Time{time.Now()},
				},
			},
			0,
		},
		{ // Exact value when present and participating
			metrics.InterventionMetrics{
				SpeakingMetrics: metrics.InterventionRecord{
					StartInterventions: []time.Time{time.Now().Add(-time.Second * 5)},
					StopInterventions:  []time.Time{time.Now()},
				},
				PresenceMetrics: metrics.InterventionRecord{
					StartInterventions: []time.Time{time.Now().Add(-time.Second * 20)},
					StopInterventions:  []time.Time{time.Now()},
				},
			},
			0.25,
		},
	}
	scorer := PresenceScorer{}
	for idx, test := range tests {
		t.Run(fmt.Sprintf("%d", idx), func(t *testing.T) {
			if scorer.ComputeScore(&test.metrics) != test.expected {
				t.Errorf("got %v instead of %v", scorer.ComputeScore(&test.metrics), test.expected)
			}
		})
	}
}
