using KcwOps.Api.Features.Activity.GetActivity;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace KcwOps.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class ActivityController(IMediator mediator) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> Get([FromQuery] Guid projectId, CancellationToken ct) =>
        Ok(await mediator.Send(new GetActivityQuery(projectId), ct));
}
