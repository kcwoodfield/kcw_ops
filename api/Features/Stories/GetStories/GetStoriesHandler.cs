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
            .Where(s => s.ProjectId == q.ProjectId);

        if (q.BacklogOnly)
            query = query.Where(s => s.SprintId == null);
        else if (q.SprintId.HasValue)
            query = query.Where(s => s.SprintId == q.SprintId);

        return await query
            .OrderBy(s => s.Number)
            .Select(s => new StoryDto(
                s.Id,
                $"{s.Project.Key}-{s.Number}",
                s.Title,
                s.Status.ToString().ToLower(),
                s.Priority.ToString().ToLower(),
                s.Points,
                s.Blocked,
                s.EpicId,
                s.Epic.Title,
                s.Epic.Color,
                s.SprintId,
                s.Sprint != null ? s.Sprint.Name : null,
                s.Labels,
                s.DueDate.HasValue ? s.DueDate.Value.ToString("MMM d") : null,
                s.AssigneeId
            ))
            .ToListAsync(ct);
    }
}
