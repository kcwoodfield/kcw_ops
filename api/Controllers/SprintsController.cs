using KcwOps.Api.Features.Sprints.CreateSprint;
using KcwOps.Api.Features.Sprints.DeleteSprint;
using KcwOps.Api.Features.Sprints.GetSprints;
using KcwOps.Api.Features.Sprints.UpdateSprint;
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

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateSprintRequest req, CancellationToken ct) =>
        Ok(await mediator.Send(new CreateSprintCommand(req.ProjectId, req.Name, req.Goal, req.StartDate, req.EndDate), ct));

    [HttpPatch("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateSprintRequest req, CancellationToken ct) =>
        Ok(await mediator.Send(new UpdateSprintCommand(id, req.Name, req.Goal, req.StartDate, req.EndDate, req.State), ct));

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
    {
        await mediator.Send(new DeleteSprintCommand(id), ct);
        return NoContent();
    }
}
