using KcwOps.Api.Features.Sprints.GetSprints;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace KcwOps.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SprintsController(IMediator mediator) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> Get([FromQuery] Guid projectId, CancellationToken ct) =>
        Ok(await mediator.Send(new GetSprintsQuery(projectId), ct));
}
