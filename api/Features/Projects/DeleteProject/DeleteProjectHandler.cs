using KcwOps.Api.Infrastructure.Persistence;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace KcwOps.Api.Features.Projects.DeleteProject;

public class DeleteProjectHandler(AppDbContext db) : IRequestHandler<DeleteProjectCommand>
{
    public async Task Handle(DeleteProjectCommand cmd, CancellationToken ct)
    {
        var project = await db.Projects.FirstOrDefaultAsync(p => p.Id == cmd.Id, ct)
            ?? throw new InvalidOperationException("Project not found.");

        db.Projects.Remove(project);
        await db.SaveChangesAsync(ct);
    }
}
