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

        return story is null ? null : StoryMapper.ToDetailDto(story);
    }
}
