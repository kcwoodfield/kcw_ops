using KcwOps.Api.Domain;
using KcwOps.Api.Features.Sprints.GetSprints;
using KcwOps.Api.Infrastructure.Persistence;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace KcwOps.Api.Features.Sprints.UpdateSprint;

public class UpdateSprintHandler(AppDbContext db) : IRequestHandler<UpdateSprintCommand, SprintDto>
{
    public async Task<SprintDto> Handle(UpdateSprintCommand cmd, CancellationToken ct)
    {
        var sprint = await db.Sprints.FirstOrDefaultAsync(s => s.Id == cmd.Id, ct)
            ?? throw new InvalidOperationException("Sprint not found.");

        if (cmd.Name is not null) sprint.Name = cmd.Name.Trim();
        if (cmd.Goal is not null) sprint.Goal = cmd.Goal.Trim();
        if (cmd.StartDate is not null) sprint.StartDate = cmd.StartDate.Value;
        if (cmd.EndDate is not null) sprint.EndDate = cmd.EndDate.Value;
        var prevState = sprint.State;

        if (cmd.State is not null)
        {
            sprint.State = cmd.State switch
            {
                "active"    => SprintState.Active,
                "completed" => SprintState.Completed,
                "planned"   => SprintState.Planned,
                _ => sprint.State,
            };
        }

        if (sprint.State != prevState)
        {
            var eventType = sprint.State switch
            {
                SprintState.Active    => "sprint_started",
                SprintState.Completed => "sprint_completed",
                _                     => "sprint_updated",
            };
            db.ActivityEvents.Add(new ActivityEvent
            {
                Id = Guid.NewGuid(),
                ProjectId = sprint.ProjectId,
                SprintId = sprint.Id,
                ActorId = "kcw",
                Type = eventType,
                Detail = sprint.Name,
                CreatedAt = DateTime.UtcNow,
            });
        }

        await db.SaveChangesAsync(ct);

        return new SprintDto(sprint.Id, sprint.Name, sprint.Goal, sprint.StartDate.ToString(), sprint.EndDate.ToString(), sprint.State.ToString().ToLower(), 0, 0);
    }
}
