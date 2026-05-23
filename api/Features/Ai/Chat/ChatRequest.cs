namespace KcwOps.Api.Features.Ai.Chat;

public record ChatRequest(
    List<ChatMessage> Messages,
    string Model,
    Guid? ProjectId
);

public record ChatMessage(string Role, string Content);

public record ChatChunk(string Type, string? Delta = null);

public record HealthResponse(bool Available, string Model, string? Error = null);
