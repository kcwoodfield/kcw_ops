using System.Net.Http.Headers;
using System.Text.Json;
using System.Text.Json.Nodes;
using KcwOps.Api.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace KcwOps.Api.Features.Ai.Chat;

public interface IChatService
{
    IAsyncEnumerable<ChatChunk> StreamAsync(ChatRequest request, CancellationToken ct);
    Task<HealthResponse> HealthAsync(string model, CancellationToken ct);
}

public class ClaudeChatService(
    IHttpClientFactory httpFactory,
    IOptions<AiSettings> options,
    ToolExecutor toolExecutor,
    AppDbContext db) : IChatService
{
    private const string AnthropicApi = "https://api.anthropic.com/v1/messages";
    private static readonly JsonSerializerOptions JsonOpts = new() { PropertyNamingPolicy = JsonNamingPolicy.CamelCase };

    public async IAsyncEnumerable<ChatChunk> StreamAsync(ChatRequest request, [System.Runtime.CompilerServices.EnumeratorCancellation] CancellationToken ct)
    {
        var settings = options.Value;

        if (string.IsNullOrEmpty(settings.AnthropicApiKey))
        {
            yield return new ChatChunk("error", "ANTHROPIC_API_KEY is not configured. Add it to appsettings.Development.json.");
            yield return new ChatChunk("done");
            yield break;
        }

        var systemPrompt = await BuildSystemPromptAsync(request.ProjectId, ct);
        var claudeModel = ResolveClaudeModel(request.Model, settings);

        // Convert incoming messages to Claude format
        var messages = new JsonArray();
        foreach (var m in request.Messages)
            messages.Add(new JsonObject { ["role"] = m.Role, ["content"] = m.Content });

        string? finalText = null;
        string? errorText = null;
        try
        {
            finalText = await RunToolLoopAsync(claudeModel, systemPrompt, messages, settings.AnthropicApiKey, ct);
        }
        catch (Exception ex)
        {
            errorText = ex.Message;
        }

        if (errorText is not null)
        {
            yield return new ChatChunk("error", errorText);
            yield return new ChatChunk("done");
            yield break;
        }

        // Simulate streaming: yield words in small chunks
        var words = finalText!.Split(' ');
        foreach (var word in words)
        {
            yield return new ChatChunk("text", word + " ");
            await Task.Delay(10, ct);
        }

        yield return new ChatChunk("done");
    }

    private async Task<string> RunToolLoopAsync(
        string model,
        string systemPrompt,
        JsonArray messages,
        string apiKey,
        CancellationToken ct)
    {
        var http = httpFactory.CreateClient();
        const int maxIterations = 10;

        for (var i = 0; i < maxIterations; i++)
        {
            var payload = new JsonObject
            {
                ["model"]      = model,
                ["max_tokens"] = 4096,
                ["system"]     = systemPrompt,
                ["tools"]      = ToolRegistry.Tools.DeepClone().AsArray(),
                ["messages"]   = messages.DeepClone().AsArray(),
            };

            using var req = new HttpRequestMessage(HttpMethod.Post, AnthropicApi);
            req.Headers.Add("x-api-key", apiKey);
            req.Headers.Add("anthropic-version", "2023-06-01");
            req.Content = new StringContent(payload.ToJsonString(), System.Text.Encoding.UTF8, "application/json");

            using var resp = await http.SendAsync(req, ct);
            var body = await resp.Content.ReadFromJsonAsync<JsonObject>(ct)
                ?? throw new InvalidOperationException("Empty response from Claude API");

            if (!resp.IsSuccessStatusCode)
            {
                var errMsg = body["error"]?["message"]?.GetValue<string>() ?? resp.ReasonPhrase;
                throw new InvalidOperationException($"Claude API error: {errMsg}");
            }

            var content    = body["content"]!.AsArray();
            var stopReason = body["stop_reason"]?.GetValue<string>();

            if (stopReason == "end_turn")
            {
                return string.Join("", content
                    .Where(b => b!["type"]?.GetValue<string>() == "text")
                    .Select(b => b!["text"]?.GetValue<string>() ?? ""));
            }

            if (stopReason == "tool_use")
            {
                // Add assistant turn with tool use blocks
                messages.Add(new JsonObject
                {
                    ["role"]    = "assistant",
                    ["content"] = content.DeepClone(),
                });

                // Execute all tool calls and collect results
                var toolResults = new JsonArray();
                foreach (var block in content)
                {
                    if (block!["type"]?.GetValue<string>() != "tool_use") continue;

                    var toolName  = block["name"]!.GetValue<string>();
                    var toolInput = block["input"]?.AsObject() ?? new JsonObject();
                    var toolId    = block["id"]!.GetValue<string>();

                    var result = await toolExecutor.ExecuteAsync(toolName, toolInput, ct);
                    toolResults.Add(new JsonObject
                    {
                        ["type"]        = "tool_result",
                        ["tool_use_id"] = toolId,
                        ["content"]     = result,
                    });
                }

                messages.Add(new JsonObject
                {
                    ["role"]    = "user",
                    ["content"] = toolResults,
                });

                continue;
            }

            // Unexpected stop reason — return what we have
            return string.Join("", content
                .Where(b => b!["type"]?.GetValue<string>() == "text")
                .Select(b => b!["text"]?.GetValue<string>() ?? ""));
        }

        return "I hit the tool iteration limit. Please try a more specific question.";
    }

    private async Task<string> BuildSystemPromptAsync(Guid? projectId, CancellationToken ct)
    {
        var projectContext = "";

        if (projectId.HasValue)
        {
            var project = await db.Projects.FindAsync([projectId.Value], ct);
            if (project is not null)
            {
                var activeSprint = await db.Sprints
                    .Where(s => s.ProjectId == projectId.Value && s.State == Domain.SprintState.Active)
                    .Select(s => new { s.Name, s.EndDate, s.Id })
                    .FirstOrDefaultAsync(ct);

                var storyStats = activeSprint is not null
                    ? await db.Stories
                        .Where(s => s.SprintId == activeSprint.Id)
                        .GroupBy(_ => 1)
                        .Select(g => new
                        {
                            Total   = g.Count(),
                            Done    = g.Count(s => s.Status == Domain.StoryStatus.Done),
                            Blocked = g.Count(s => s.Blocked),
                        })
                        .FirstOrDefaultAsync(ct)
                    : null;

                projectContext = $"""

Active project: {project.Name} ({project.Key})
""";

                if (activeSprint is not null)
                {
                    projectContext += $"""

Current sprint: {activeSprint.Name} (ends {activeSprint.EndDate:yyyy-MM-dd})
Sprint progress: {storyStats?.Done ?? 0}/{storyStats?.Total ?? 0} done, {storyStats?.Blocked ?? 0} blocked
""";
                }
            }
        }

        var users = await db.Users.Select(u => u.Name).ToListAsync(ct);
        var team = users.Count > 0 ? string.Join(", ", users) : "no users seeded";

        return $"""
You are Lobo, an AI assistant embedded in Ops — a personal project management tool.
You are precise, patient, and action-oriented. You help the user manage their projects, sprints, epics, and stories.
Respond concisely. Use plain text, not markdown.
When asked to create or modify data, describe what you would do and ask for confirmation first.
{projectContext}
Team members: {team}

Today: {DateOnly.FromDateTime(DateTime.UtcNow):yyyy-MM-dd}
Use your tools to answer questions accurately. Only include information you retrieved from tools.
""";
    }

    public async Task<HealthResponse> HealthAsync(string model, CancellationToken ct)
    {
        var settings = options.Value;

        if (model.StartsWith("ollama", StringComparison.OrdinalIgnoreCase))
        {
            try
            {
                var http = httpFactory.CreateClient();
                var resp = await http.GetAsync($"{settings.OllamaBaseUrl}/api/version", ct);
                return new HealthResponse(resp.IsSuccessStatusCode, settings.OllamaModel);
            }
            catch
            {
                return new HealthResponse(false, settings.OllamaModel, "Ollama is not running");
            }
        }

        // Claude: just verify API key is set
        if (string.IsNullOrEmpty(settings.AnthropicApiKey))
            return new HealthResponse(false, model, "ANTHROPIC_API_KEY not configured");

        return new HealthResponse(true, ResolveClaudeModel(model, settings));
    }

    private static string ResolveClaudeModel(string requested, AiSettings settings) =>
        requested switch
        {
            "claude-haiku" => "claude-haiku-4-5-20251001",
            "ollama"       => throw new InvalidOperationException("Use OllamaChatService for Ollama"),
            _              => settings.DefaultClaudeModel,
        };
}
