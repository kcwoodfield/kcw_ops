using KcwOps.Api.Features.Projects.CreateProject;
using KcwOps.Api.Features.Projects.GetProjects;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace KcwOps.Api.Controllers;

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
}
