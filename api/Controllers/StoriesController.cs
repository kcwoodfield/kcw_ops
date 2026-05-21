using KcwOps.Api.Features.Stories.AddComment;
using KcwOps.Api.Features.Stories.CreateStory;
using KcwOps.Api.Features.Stories.DeleteStory;
using KcwOps.Api.Features.Stories.GetComments;
using KcwOps.Api.Features.Stories.GetStories;
using KcwOps.Api.Features.Stories.GetStory;
using KcwOps.Api.Features.Stories.ReorderStories;
using KcwOps.Api.Features.Stories.UpdateStory;
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

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateStoryRequest body, CancellationToken ct)
    {
        try
        {
            var story = await mediator.Send(new CreateStoryCommand(
                body.ProjectId,
                body.EpicId,
                body.Title,
                body.SprintId,
                body.Status,
                body.Priority,
                body.Points
            ), ct);
            return CreatedAtAction(nameof(GetById), new { id = story.Id }, story);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    [HttpPost("reorder")]
    public async Task<IActionResult> Reorder([FromBody] ReorderStoriesRequest body, CancellationToken ct)
    {
        try
        {
            await mediator.Send(new ReorderStoriesCommand(
                body.ProjectId,
                body.SprintId,
                body.Status,
                body.OrderedStoryIds
            ), ct);
            return NoContent();
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id, CancellationToken ct)
    {
        var story = await mediator.Send(new GetStoryQuery(id), ct);
        return story is null ? NotFound() : Ok(story);
    }

    [HttpPatch("{id:guid}")]
    public async Task<IActionResult> Patch(Guid id, [FromBody] UpdateStoryRequest body, CancellationToken ct)
    {
        try
        {
            var story = await mediator.Send(new UpdateStoryCommand(
                id,
                body.Title,
                body.Description,
                body.Status,
                body.Priority,
                body.Points,
                body.Blocked,
                body.EpicId,
                body.SprintId,
                body.ClearSprint ?? false,
                body.DueDate,
                body.Labels,
                body.AssigneeId
            ), ct);
            return story is null ? NotFound() : Ok(story);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
    {
        await mediator.Send(new DeleteStoryCommand(id), ct);
        return NoContent();
    }

    [HttpGet("{id:guid}/comments")]
    public async Task<IActionResult> GetComments(Guid id, CancellationToken ct) =>
        Ok(await mediator.Send(new GetCommentsQuery(id), ct));

    [HttpPost("{id:guid}/comments")]
    public async Task<IActionResult> AddComment(Guid id, [FromBody] AddCommentRequest body, CancellationToken ct)
    {
        try
        {
            var comment = await mediator.Send(new AddCommentCommand(id, body.AuthorId, body.Body), ct);
            return Created("", comment);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }
}
