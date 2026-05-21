using KcwOps.Api.Domain;
using KcwOps.Api.Infrastructure.Persistence;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace KcwOps.Api.Features.Stories.CreateStory;

public class CreateStoryHandler(AppDbContext db) : IRequestHandler<CreateStoryCommand, StoryDetailDto>
{
    public async Task<StoryDetailDto> Handle(CreateStoryCommand cmd, CancellationToken ct)
    {
        var project = await db.Projects.FirstOrDefaultAsync(p => p.Id == cmd.ProjectId, ct)
            ?? throw new InvalidOperationException("Project not found.");

        // Resolve epic: use provided, fall back to first project epic, or null
        Guid? resolvedEpicId = cmd.EpicId;
        if (!resolvedEpicId.HasValue)
        {
            resolvedEpicId = await db.Epics
                .Where(e => e.ProjectId == cmd.ProjectId)
                .Select(e => (Guid?)e.Id)
                .FirstOrDefaultAsync(ct);
        }
        else
        {
            var epicOk = await db.Epics.AnyAsync(e => e.Id == resolvedEpicId && e.ProjectId == cmd.ProjectId, ct);
            if (!epicOk) throw new InvalidOperationException("Epic does not belong to this project.");
        }

        if (cmd.SprintId.HasValue)
        {
            var sprintOk = await db.Sprints.AnyAsync(s => s.Id == cmd.SprintId && s.ProjectId == cmd.ProjectId, ct);
            if (!sprintOk) throw new InvalidOperationException("Sprint does not belong to this project.");
        }

        var maxNumber = await db.Stories
            .Where(s => s.ProjectId == cmd.ProjectId)
            .MaxAsync(s => (int?)s.Number, ct) ?? 0;

        var status = StoryStatus.Todo;
        if (cmd.Status is not null && StoryEnums.TryParseStatus(cmd.Status, out var parsedStatus))
            status = parsedStatus;

        var priority = Priority.Med;
        if (cmd.Priority is not null && StoryEnums.TryParsePriority(cmd.Priority, out var parsedPriority))
            priority = parsedPriority;

        var points = cmd.Points ?? 1;

        var maxSort = await db.Stories
            .Where(s => s.ProjectId == cmd.ProjectId && s.SprintId == cmd.SprintId && s.Status == status)
            .MaxAsync(s => (int?)s.SortOrder, ct) ?? 0;

        var story = new Story
        {
            Id = Guid.NewGuid(),
            ProjectId = cmd.ProjectId,
            EpicId = resolvedEpicId ?? Guid.Empty,
            SprintId = cmd.SprintId,
            Number = maxNumber + 1,
            SortOrder = maxSort + 1000,
            Title = cmd.Title.Trim(),
            Status = status,
            Priority = priority,
            Points = points,
            Labels = [],
        };

        db.Stories.Add(story);
        await db.SaveChangesAsync(ct);

        await db.Entry(story).Reference(s => s.Epic).LoadAsync(ct);
        await db.Entry(story).Reference(s => s.Sprint).LoadAsync(ct);
        story.Project = project;

        var assignee = story.AssigneeId is null ? null : await db.Users.FindAsync([story.AssigneeId], ct);
        return StoryMapper.ToDetailDto(story, assignee);
    }
}
