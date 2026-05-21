using KcwOps.Api.Domain;
using KcwOps.Api.Features.Sprints.GetSprints;
using KcwOps.Api.Infrastructure.Persistence;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace KcwOps.Api.Features.Sprints.CreateSprint;

public class CreateSprintHandler(AppDbContext db) : IRequestHandler<CreateSprintCommand, SprintDto>
{
    public async Task<SprintDto> Handle(CreateSprintCommand cmd, CancellationToken ct)
    {
        var projectExists = await db.Projects.AnyAsync(p => p.Id == cmd.ProjectId, ct);
        if (!projectExists) throw new InvalidOperationException("Project not found.");

        var sprint = new Sprint
        {
            Id = Guid.NewGuid(),
            ProjectId = cmd.ProjectId,
            Name = cmd.Name.Trim(),
            Goal = cmd.Goal?.Trim(),
            StartDate = cmd.StartDate,
            EndDate = cmd.EndDate,
            State = SprintState.Planned,
        };

        db.Sprints.Add(sprint);
        await db.SaveChangesAsync(ct);

        return new SprintDto(sprint.Id, sprint.Name, sprint.Goal, sprint.StartDate.ToString(), sprint.EndDate.ToString(), sprint.State.ToString().ToLower(), 0, 0);
    }
}
