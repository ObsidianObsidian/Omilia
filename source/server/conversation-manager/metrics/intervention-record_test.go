package metrics

import (
	"fmt"
	"testing"
	"time"
)

func createEmptyRecord() InterventionRecord {
	return InterventionRecord{
		StartInterventions: []time.Time{},
		StopInterventions:  []time.Time{},
	}
}

func createOpenRecord() InterventionRecord {
	return InterventionRecord{
		StartInterventions: []time.Time{time.Now()},
		StopInterventions:  []time.Time{},
	}
}

func createClosedRecord() InterventionRecord {
	return InterventionRecord{
		StartInterventions: []time.Time{time.Now().Add(-time.Second * 5)},
		StopInterventions:  []time.Time{time.Now()},
	}
}

func TestOngoingIntervention(t *testing.T) { // on empty, on closed, on open
	tests := []struct {
		record   InterventionRecord
		expected bool
	}{
		{ // False on empty record
			createEmptyRecord(),
			false,
		},
		{ // False on closed record
			createClosedRecord(),
			false,
		},
		{ // True on ongoing record
			createOpenRecord(),
			true,
		},
	}
	for idx, test := range tests {
		t.Run(fmt.Sprintf("%d", idx), func(t *testing.T) {
			if test.record.HasOngoingIntervention() != test.expected {
				t.Errorf("got %v instead of %v", test.record.HasOngoingIntervention(), test.expected)
			}
		})
	}
}

func TestTotalInterventionTime(t *testing.T) {
	tests := []struct {
		record   InterventionRecord
		expected float64
	}{
		{ // zero on empty record
			InterventionRecord{},
			0,
		},
		{ // get exact score on closed record
			InterventionRecord{
				StartInterventions: []time.Time{time.Now().Add(-time.Second * 5)},
				StopInterventions:  []time.Time{time.Now()},
			},
			float64((time.Second * 5).Milliseconds()),
		},
		{ // get exact score on open record
			InterventionRecord{
				StartInterventions: []time.Time{time.Now().Add(-time.Second * 5)},
				StopInterventions:  []time.Time{},
			},
			float64((time.Second * 5).Milliseconds()),
		},
	}
	for idx, test := range tests {
		t.Run(fmt.Sprintf("%d", idx), func(t *testing.T) {
			if test.record.GetTotalInterventionTime() != test.expected {
				t.Errorf("got %v instead of %v", test.record.GetTotalInterventionTime(), test.expected)
			}
		})
	}
}
