using KcwOps.Api.Features.Projects.CreateProject;
using KcwOps.Api.Features.Projects.DeleteProject;
using KcwOps.Api.Features.Projects.GetProjects;
using KcwOps.Api.Features.Projects.UpdateProject;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace KcwOps.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class ProjectsController(IMediator mediator) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> Get(CancellationToken ct) =>
        Ok(await mediator.Send(new GetProjectsQuery(), ct));

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateProjectRequest body, CancellationToken ct) =>
        Ok(await mediator.Send(new CreateProjectCommand(body.Name, body.Key, body.Color), ct));

    [HttpPatch("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateProjectRequest body, CancellationToken ct) =>
        Ok(await mediator.Send(new UpdateProjectCommand(id, body.Name, body.Key, body.Color), ct));

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
    {
        await mediator.Send(new DeleteProjectCommand(id), ct);
        return NoContent();
    }
}
