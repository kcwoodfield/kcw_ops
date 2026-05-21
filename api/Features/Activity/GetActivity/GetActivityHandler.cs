using KcwOps.Api.Infrastructure.Persistence;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace KcwOps.Api.Features.Activity.GetActivity;

public class GetActivityHandler(AppDbContext db) : IRequestHandler<GetActivityQuery, IEnumerable<ActivityEventDto>>
{
    public async Task<IEnumerable<ActivityEventDto>> Handle(GetActivityQuery q, CancellationToken ct)
    {
        var events = await db.ActivityEvents
            .Where(e => e.ProjectId == q.ProjectId)
            .OrderByDescending(e => e.CreatedAt)
            .Take(100)
            .ToListAsync(ct);

        var actorIds = events.Select(e => e.ActorId).Distinct().ToList();
        var storyIds = events.Where(e => e.StoryId.HasValue).Select(e => e.StoryId!.Value).Distinct().ToList();
        var sprintIds = events.Where(e => e.SprintId.HasValue).Select(e => e.SprintId!.Value).Distinct().ToList();

        var users = await db.Users
            .Where(u => actorIds.Contains(u.Id))
            .ToDictionaryAsync(u => u.Id, ct);

        var storyKeys = await db.Stories
            .Where(s => storyIds.Contains(s.Id))
            .ToDictionaryAsync(s => s.Id, s => $"{s.Project.Key}-{s.Number}", ct);

        var sprintNames = await db.Sprints
            .Where(s => sprintIds.Contains(s.Id))
            .ToDictionaryAsync(s => s.Id, s => s.Name, ct);

        return events.Select(e =>
        {
            users.TryGetValue(e.ActorId, out var actor);
            return new ActivityEventDto(
                e.Id,
                e.ProjectId,
                e.StoryId,
                e.StoryId.HasValue ? storyKeys.GetValueOrDefault(e.StoryId.Value) : null,
                e.SprintId,
                e.SprintId.HasValue ? sprintNames.GetValueOrDefault(e.SprintId.Value) : null,
                e.ActorId,
                actor?.Name ?? e.ActorId,
                actor?.Initials ?? e.ActorId[..1].ToUpper(),
                actor?.Color ?? "#7c5cff",
                e.Type,
                e.Detail,
                e.CreatedAt
            );
        });
    }
}
