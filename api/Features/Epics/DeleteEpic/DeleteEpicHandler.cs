using KcwOps.Api.Infrastructure.Persistence;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace KcwOps.Api.Features.Epics.DeleteEpic;

public class DeleteEpicHandler(AppDbContext db) : IRequestHandler<DeleteEpicCommand>
{
    public async Task Handle(DeleteEpicCommand cmd, CancellationToken ct)
    {
        var epic = await db.Epics.FirstOrDefaultAsync(e => e.Id == cmd.Id, ct)
            ?? throw new InvalidOperationException("Epic not found.");

        db.Epics.Remove(epic);
        await db.SaveChangesAsync(ct);
    }
}
