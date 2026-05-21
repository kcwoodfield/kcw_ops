using KcwOps.Api.Features.Epics.CreateEpic;
using KcwOps.Api.Features.Epics.DeleteEpic;
using KcwOps.Api.Features.Epics.GetEpics;
using KcwOps.Api.Features.Epics.UpdateEpic;
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

    [HttpPatch("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateEpicRequest body, CancellationToken ct) =>
        Ok(await mediator.Send(new UpdateEpicCommand(id, body.Title, body.Color, body.StartDate, body.EndDate, body.ClearStartDate, body.ClearEndDate), ct));

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
    {
        await mediator.Send(new DeleteEpicCommand(id), ct);
        return NoContent();
    }
}
