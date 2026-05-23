using KcwOps.Api.Features.Ai.Chat;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace KcwOps.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/ai")]
public class AiController(IChatService chatService) : ControllerBase
{
    [HttpGet("health")]
    public async Task<IActionResult> Health([FromQuery] string model = "claude-sonnet", CancellationToken ct = default)
    {
        var result = await chatService.HealthAsync(model, ct);
        return result.Available ? Ok(result) : StatusCode(503, result);
    }

    [HttpPost("chat")]
    public async Task Chat([FromBody] ChatRequest request, CancellationToken ct)
    {
        Response.ContentType = "text/event-stream";
        Response.Headers.Append("Cache-Control", "no-cache");
        Response.Headers.Append("X-Accel-Buffering", "no");

        await foreach (var chunk in chatService.StreamAsync(request, ct))
        {
            var data = System.Text.Json.JsonSerializer.Serialize(chunk,
                new System.Text.Json.JsonSerializerOptions { PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase });
            await Response.WriteAsync($"data: {data}\n\n", ct);
            await Response.Body.FlushAsync(ct);
        }
    }
}
