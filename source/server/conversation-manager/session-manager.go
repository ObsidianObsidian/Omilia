package main

import (
	"conversation-manager/controller"
	"conversation-manager/events"
	"conversation-manager/messaging"
	"conversation-manager/session"
)

func main() {
	messaging.SetupMessaging()
	session.Setup()
	events.Setup()
	controller.Setup()
	select {} // Keep running
}
