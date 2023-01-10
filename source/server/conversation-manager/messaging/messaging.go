package messaging

import (
	"log"

	amqp "github.com/rabbitmq/amqp091-go"
)

var messagingChannel *amqp.Channel

const ExporterExchangeName = "EXCHANGE_NAME_EXPORTER"
const ConversationManagerExchangeName = "EXCHANGE_NAME_CONVERSATION_MANAGER"

func SetupMessaging() {
	conn, err := amqp.Dial("amqp://guest:guest@messaging-service")
	failOnError(err, "Failed to connect to RabbitMQ")
	messagingChannel, err = conn.Channel()
	failOnError(err, "Failed to open a channel")

	declareExchange(ExporterExchangeName)
	declareExchange(ConversationManagerExchangeName)
}

func listenOnExchange(exchangeName string, bindingKey string) <-chan amqp.Delivery {
	q, err := messagingChannel.QueueDeclare(
		"",
		false,
		true,
		true,
		false,
		nil,
	)
	failOnError(err, "Failed to declare a queue")

	err = messagingChannel.QueueBind(
		q.Name,
		bindingKey,
		exchangeName,
		false,
		nil)
	failOnError(err, "Failed to bind a queue")

	msgs, err := messagingChannel.Consume(
		q.Name,
		"",
		true,
		false,
		false,
		false,
		nil,
	)
	return msgs
}

func ListenOnExchange(exchangeName string, bindingKey string, handler func(event amqp.Delivery)) {
	channel := listenOnExchange(exchangeName, bindingKey)
	go func() {
		for event := range channel {
			handler(event)
		}
	}()
}

func PublishOnExchange(exchangeName string, routingKey string, body []byte) {
	messagingChannel.Publish(
		exchangeName,
		routingKey,
		false,
		false,
		amqp.Publishing{
			Body: body,
		},
	)
}

func declareExchange(exchangeName string) {
	err := messagingChannel.ExchangeDeclare(
		exchangeName,
		"topic",
		false,
		false,
		false,
		false,
		nil,
	)
	failOnError(err, "Failed to create exchange")
}

func failOnError(err error, msg string) {
	if err != nil {
		log.Panicf("%s: %s", msg, err)
	}
}
