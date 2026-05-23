using KcwOps.Api.Infrastructure.Persistence;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace KcwOps.Api.Features.Sprints.DeleteSprint;

public class DeleteSprintHandler(AppDbContext db) : IRequestHandler<DeleteSprintCommand>
{
    public async Task Handle(DeleteSprintCommand cmd, CancellationToken ct)
    {
        var sprint = await db.Sprints.FirstOrDefaultAsync(s => s.Id == cmd.Id, ct)
            ?? throw new InvalidOperationException("Sprint not found.");

        // Return all stories in this sprint to the backlog before removing the sprint.
        await db.Stories
            .Where(s => s.SprintId == cmd.Id)
            .ExecuteUpdateAsync(s => s.SetProperty(x => x.SprintId, (Guid?)null), ct);

        db.Sprints.Remove(sprint);
        await db.SaveChangesAsync(ct);
    }
}
