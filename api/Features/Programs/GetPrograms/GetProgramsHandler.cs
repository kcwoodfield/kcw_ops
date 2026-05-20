using KcwOps.Api.Infrastructure.Persistence;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace KcwOps.Api.Features.Programs.GetPrograms;

public class GetProgramsHandler(AppDbContext db) : IRequestHandler<GetProgramsQuery, List<ProgramDto>>
{
    public async Task<List<ProgramDto>> Handle(GetProgramsQuery _, CancellationToken ct) =>
        await db.Programs
            .Include(p => p.Projects)
            .OrderBy(p => p.Name)
            .Select(p => new ProgramDto(
                p.Id,
                p.Name,
                p.Projects
                    .OrderBy(pr => pr.Name)
                    .Select(pr => new ProjectDto(pr.Id, pr.Name, pr.Key, pr.Color))
                    .ToList()))
            .ToListAsync(ct);
}
