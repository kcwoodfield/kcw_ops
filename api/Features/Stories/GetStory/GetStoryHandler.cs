using KcwOps.Api.Infrastructure.Persistence;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace KcwOps.Api.Features.Stories.GetStory;

public class GetStoryHandler(AppDbContext db) : IRequestHandler<GetStoryQuery, StoryDetailDto?>
{
    public async Task<StoryDetailDto?> Handle(GetStoryQuery q, CancellationToken ct)
    {
        var story = await db.Stories
            .Include(s => s.Epic)
            .Include(s => s.Sprint)
            .Include(s => s.Project)
            .FirstOrDefaultAsync(s => s.Id == q.Id, ct);

        if (story is null) return null;
        var assignee = story.AssigneeId is null ? null : await db.Users.FindAsync([story.AssigneeId], ct);
        return StoryMapper.ToDetailDto(story, assignee);
    }
}
