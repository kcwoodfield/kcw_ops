using KcwOps.Api.Infrastructure.Persistence;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace KcwOps.Api.Features.Sprints.GetSprints;

public class GetSprintsHandler(AppDbContext db) : IRequestHandler<GetSprintsQuery, List<SprintDto>>
{
    public async Task<List<SprintDto>> Handle(GetSprintsQuery q, CancellationToken ct) =>
        await db.Sprints
            .Where(s => s.ProjectId == q.ProjectId)
            .OrderBy(s => s.StartDate)
            .Select(s => new SprintDto(
                s.Id,
                s.Name,
                s.Goal,
                s.StartDate.ToString("yyyy-MM-dd"),
                s.EndDate.ToString("yyyy-MM-dd"),
                s.State.ToString().ToLower(),
                s.Stories.Sum(st => st.Points),
                s.Stories.Where(st => st.Status == Domain.StoryStatus.Done).Sum(st => st.Points)
            ))
            .ToListAsync(ct);
}
