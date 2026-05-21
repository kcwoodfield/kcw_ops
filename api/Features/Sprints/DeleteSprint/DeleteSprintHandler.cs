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

        db.Sprints.Remove(sprint);
        await db.SaveChangesAsync(ct);
    }
}
