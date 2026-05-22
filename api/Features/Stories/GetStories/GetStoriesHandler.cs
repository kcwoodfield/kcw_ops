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
            .AsQueryable();

        if (q.ProjectId.HasValue)
            query = query.Where(s => s.ProjectId == q.ProjectId);

        if (q.DraftsOnly)
            query = query.Where(s => s.SprintId == null && (s.Description == null || s.Description == ""));
        else if (q.BacklogOnly)
            query = query.Where(s => s.SprintId == null);
        else if (q.SprintId.HasValue)
            query = query.Where(s => s.SprintId == q.SprintId);

        if (q.AssigneeId is not null)
            query = query.Where(s => s.AssigneeId == q.AssigneeId);

        if (q.StarredOnly)
            query = query.Where(s => s.Starred);

        if (q.DueSoon)
        {
            var today = DateOnly.FromDateTime(DateTime.UtcNow);
            var cutoff = today.AddDays(7);
            query = query.Where(s => s.DueDate.HasValue && s.DueDate.Value <= cutoff);
        }

        var stories = await query.OrderBy(s => s.SortOrder).ThenBy(s => s.Number).ToListAsync(ct);
        return stories.Select(StoryMapper.ToDto).ToList();
    }
}
