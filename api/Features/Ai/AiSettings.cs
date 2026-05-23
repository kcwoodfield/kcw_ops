namespace KcwOps.Api.Features.Ai;

public class AiSettings
{
    public string AnthropicApiKey { get; set; } = "";
    public string DefaultClaudeModel { get; set; } = "claude-sonnet-4-6";
    public string OllamaBaseUrl { get; set; } = "http://localhost:11434";
    public string OllamaModel { get; set; } = "llama3.2";
}
