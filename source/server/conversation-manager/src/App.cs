using System.Text;
using QuickType;
using Messaging;
using Session;
using Microsoft.AspNetCore.ResponseCompression;
using EventsHub;

var applicationBuilder = WebApplication.CreateBuilder();
applicationBuilder.Services.AddSignalR();
applicationBuilder.Services.AddSingleton<EventsHub.EventsHub>();
applicationBuilder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(
                      policy =>
                      {
                          policy.WithOrigins("http://localhost:4200", "https://localhost:4200", Environment.GetEnvironmentVariable("OMILIA_BASE_URL")).AllowCredentials().AllowAnyMethod().AllowAnyHeader(); // TODO remove when done testing
                      });
});

var app = applicationBuilder.Build();

app.MapHub<EventsHub.EventsHub>("/sessionEvents");
app.UseCors();
conversationmanager.ConversationManager.SetupListeners();
app.Run();

namespace conversationmanager {
    class ConversationManager
    {
        static void Main(String[] args)
        {
            SetupListeners();
        }

        public static void SetupListeners() {
            var consumerTag = MessagingMediator.SetupListener(MessagingConstants.ExchangeNameExporter, "create_session", (model, ea) => {
                var sessionCreationRequest = SessionCreationRequest.FromJson(Encoding.UTF8.GetString(ea.Body.ToArray()));
                createNewSession(sessionCreationRequest);
            });
        }

        static void createNewSession(SessionCreationRequest sessionCreationRequest) {
            var sessionId = Guid.NewGuid().ToString();
            var session = new Session.Session(sessionId, sessionCreationRequest.Users.Select<UserProfileInfo, string>(usr => usr.Id).ToList());
            var response = new SessionCreationRequestResponse {SessionId = sessionId};
            MessagingMediator.Channel.BasicPublish(MessagingConstants.ExchangeNameConversationManager, mandatory: true, routingKey: $"create_session.{sessionCreationRequest.RequestId}", basicProperties: null, body: Encoding.UTF8.GetBytes(response.ToJson()));
        }
    }
}
