using KcwOps.Api.Infrastructure.Persistence;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace KcwOps.Api.Features.Stories.GetStories;

public class GetStoriesHandler(AppDbContext db) : IRequestHandler<GetStoriesQuery, List<StoryDto>>
{
    public async Task<List<StoryDto>> Handle(GetStoriesQuery q, CancellationToken ct)
    {
        var query = db.Stories
            .Include(s => s.Epic)
            .Include(s => s.Sprint)
            .Include(s => s.Project)
            .Where(s => s.ProjectId == q.ProjectId);

        if (q.BacklogOnly)
            query = query.Where(s => s.SprintId == null);
        else if (q.SprintId.HasValue)
            query = query.Where(s => s.SprintId == q.SprintId);

        var stories = await query.OrderBy(s => s.SortOrder).ThenBy(s => s.Number).ToListAsync(ct);
        return stories.Select(StoryMapper.ToDto).ToList();
    }
}
