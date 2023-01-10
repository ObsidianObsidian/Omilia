package metrics

import "time"

type InterventionRecord struct {
	StartInterventions []time.Time
	StopInterventions  []time.Time
}

func (r *InterventionRecord) RegisterStart(time time.Time) {
	if r.HasOngoingIntervention() {
		return
	}
	r.StartInterventions = append(r.StartInterventions, time)
}

func (r *InterventionRecord) RegisterStop(time time.Time) {
	if r.HasOngoingIntervention() {
		r.StopInterventions = append(r.StopInterventions, time)
	}
}

func (r *InterventionRecord) HasOngoingIntervention() bool {
	return len(r.StartInterventions) > len(r.StopInterventions)
}

func (r *InterventionRecord) GetTotalInterventionTime() float64 {
	var totalStart int64 = 0
	for _, time := range r.StartInterventions {
		totalStart += time.UnixMilli()
	}
	var totalStop int64 = 0
	for _, time := range r.StopInterventions {
		totalStop += time.UnixMilli()
	}
	if r.HasOngoingIntervention() {
		totalStop += time.Now().UnixMilli()
	}
	return float64(totalStop - totalStart)
}
