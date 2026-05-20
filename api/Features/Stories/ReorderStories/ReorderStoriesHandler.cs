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

        var idSet = cmd.OrderedStoryIds.ToHashSet();
        if (idSet.Count != cmd.OrderedStoryIds.Count)
            throw new InvalidOperationException("Duplicate story ids in order list.");

        var storyMap = stories.ToDictionary(s => s.Id);
        foreach (var id in cmd.OrderedStoryIds)
        {
            if (!storyMap.ContainsKey(id))
                throw new InvalidOperationException("Story not found in this column.");
        }

        for (var i = 0; i < cmd.OrderedStoryIds.Count; i++)
            storyMap[cmd.OrderedStoryIds[i]].SortOrder = (i + 1) * 1000;

        await db.SaveChangesAsync(ct);
        return Unit.Value;
    }
}
