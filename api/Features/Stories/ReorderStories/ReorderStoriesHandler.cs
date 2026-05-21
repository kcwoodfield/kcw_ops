using KcwOps.Api.Infrastructure.Persistence;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace KcwOps.Api.Features.Stories.ReorderStories;

public class ReorderStoriesHandler(AppDbContext db) : IRequestHandler<ReorderStoriesCommand, Unit>
{
    public async Task<Unit> Handle(ReorderStoriesCommand cmd, CancellationToken ct)
    {
        if (!StoryEnums.TryParseStatus(cmd.Status, out var status))
            throw new InvalidOperationException("Invalid status.");

        var stories = await db.Stories
            .Where(s => s.ProjectId == cmd.ProjectId && s.Status == status)
            .Where(s => cmd.SprintId == null ? s.SprintId == null : s.SprintId == cmd.SprintId)
            .ToListAsync(ct);

        var storyMap = stories.ToDictionary(s => s.Id);

        // Filter to only IDs that are actually in this column — cross-column drags
        // can send an ID that hasn't fully committed to the DB yet; silently skip those.
        var toOrder = cmd.OrderedStoryIds
            .Distinct()
            .Where(id => storyMap.ContainsKey(id))
            .ToList();

        for (var i = 0; i < toOrder.Count; i++)
            storyMap[toOrder[i]].SortOrder = (i + 1) * 1000;

        await db.SaveChangesAsync(ct);
        return Unit.Value;
    }
}
