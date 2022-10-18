using RabbitMQ.Client;
using RabbitMQ.Client.Events;

// TODO rename all files to follow C# conventions
namespace Messaging
{
    
    class MessagingMediator {
        public static IModel Channel = SetupMessagingChannels();

        static public IModel SetupMessagingChannels() {
            var factory = new ConnectionFactory() { HostName = "messaging-service" };
            IModel channel;

            var connection = factory.CreateConnection();
            channel = connection.CreateModel();
            channel.ExchangeDeclare(exchange: MessagingConstants.ExchangeNameExporter, type: "topic");
            channel.ExchangeDeclare(exchange: MessagingConstants.ExchangeNameConversationManager, type: "topic");            
            return channel;
        }

        static public string SetupListener(string exchangeName, string bindingKey, EventHandler<BasicDeliverEventArgs> eventHandler) {
            var queue = Channel.QueueDeclare("", autoDelete: true);
            Channel.QueueBind(queue.QueueName, exchangeName, bindingKey);
            var consumer = new EventingBasicConsumer(Channel);
            consumer.Received += eventHandler;
            return Channel.BasicConsume(queue.QueueName, autoAck: true, consumer: consumer);
        }

        static public string GetStringFromBuffer(ReadOnlyMemory<byte> bytes) {
            return System.Text.Encoding.UTF8.GetString(bytes.ToArray());
        }

        static public void BasicCancel(string consumerTag) {
            Channel.BasicCancel(consumerTag);
        }
    }

    class MessagingConstants {
        public const string ExchangeNameExporter = "EXCHANGE_NAME_EXPORTER";
        public const string ExchangeNameConversationManager = "EXCHANGE_NAME_CONVERSATION_MANAGER";
    }
}