using KcwOps.Api.Domain;
using KcwOps.Api.Infrastructure.Persistence;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace KcwOps.Api.Features.Stories.UpdateStory;

public class UpdateStoryHandler(AppDbContext db) : IRequestHandler<UpdateStoryCommand, StoryDetailDto?>
{
    public async Task<StoryDetailDto?> Handle(UpdateStoryCommand cmd, CancellationToken ct)
    {
        var story = await db.Stories
            .Include(s => s.Epic)
            .Include(s => s.Sprint)
            .Include(s => s.Project)
            .FirstOrDefaultAsync(s => s.Id == cmd.Id, ct);

        if (story is null) return null;

        if (cmd.Title is not null) story.Title = cmd.Title.Trim();
        if (cmd.Description is not null) story.Description = string.IsNullOrWhiteSpace(cmd.Description) ? null : cmd.Description;

        if (cmd.Status is not null && StoryEnums.TryParseStatus(cmd.Status, out var status))
            story.Status = status;

        if (cmd.Priority is not null && StoryEnums.TryParsePriority(cmd.Priority, out var priority))
            story.Priority = priority;

        if (cmd.Points.HasValue) story.Points = cmd.Points.Value;
        if (cmd.Blocked.HasValue) story.Blocked = cmd.Blocked.Value;

        if (cmd.EpicId.HasValue)
        {
            var epicOk = await db.Epics.AnyAsync(e => e.Id == cmd.EpicId && e.ProjectId == story.ProjectId, ct);
            if (!epicOk) throw new InvalidOperationException("Epic does not belong to this project.");
            story.EpicId = cmd.EpicId.Value;
        }

        if (cmd.ClearSprint)
            story.SprintId = null;
        else if (cmd.SprintId.HasValue)
        {
            var sprintOk = await db.Sprints.AnyAsync(s => s.Id == cmd.SprintId && s.ProjectId == story.ProjectId, ct);
            if (!sprintOk) throw new InvalidOperationException("Sprint does not belong to this project.");
            story.SprintId = cmd.SprintId.Value;
        }

        if (cmd.DueDate is not null)
            story.DueDate = string.IsNullOrWhiteSpace(cmd.DueDate)
                ? null
                : DateOnly.Parse(cmd.DueDate);

        await db.SaveChangesAsync(ct);

        await db.Entry(story).Reference(s => s.Epic).LoadAsync(ct);
        await db.Entry(story).Reference(s => s.Sprint).LoadAsync(ct);
        await db.Entry(story).Reference(s => s.Project).LoadAsync(ct);

        return StoryMapper.ToDetailDto(story);
    }
}
