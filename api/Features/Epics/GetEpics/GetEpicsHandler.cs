using KcwOps.Api.Domain;
using KcwOps.Api.Infrastructure.Persistence;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace KcwOps.Api.Features.Epics.GetEpics;

public class GetEpicsHandler(AppDbContext db) : IRequestHandler<GetEpicsQuery, List<EpicDto>>
{
    public async Task<List<EpicDto>> Handle(GetEpicsQuery q, CancellationToken ct) =>
        await db.Epics
            .Where(e => e.ProjectId == q.ProjectId)
            .Select(e => new EpicDto(
                e.Id,
                e.Title,
                e.Color,
                e.Stories.Sum(s => s.Points),
                e.Stories.Where(s => s.Status == StoryStatus.Done).Sum(s => s.Points)
            ))
            .ToListAsync(ct);
}
