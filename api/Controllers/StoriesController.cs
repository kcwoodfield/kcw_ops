using KcwOps.Api.Features.Stories.GetStories;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace KcwOps.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class StoriesController(IMediator mediator) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> Get(
        [FromQuery] Guid projectId,
        [FromQuery] Guid? sprintId,
        [FromQuery] bool backlogOnly,
        CancellationToken ct) =>
        Ok(await mediator.Send(new GetStoriesQuery(projectId, sprintId, backlogOnly), ct));
}
