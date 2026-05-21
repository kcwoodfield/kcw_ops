using KcwOps.Api.Features.Epics.CreateEpic;
using KcwOps.Api.Features.Epics.GetEpics;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace KcwOps.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class EpicsController(IMediator mediator) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> Get([FromQuery] Guid projectId, CancellationToken ct) =>
        Ok(await mediator.Send(new GetEpicsQuery(projectId), ct));

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateEpicRequest req, CancellationToken ct) =>
        Ok(await mediator.Send(new CreateEpicCommand(req.ProjectId, req.Title, req.Color), ct));
}
