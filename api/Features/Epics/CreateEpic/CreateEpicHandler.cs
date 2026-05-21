using KcwOps.Api.Domain;
using KcwOps.Api.Features.Epics.GetEpics;
using KcwOps.Api.Infrastructure.Persistence;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace KcwOps.Api.Features.Epics.CreateEpic;

public class CreateEpicHandler(AppDbContext db) : IRequestHandler<CreateEpicCommand, EpicDto>
{
    public async Task<EpicDto> Handle(CreateEpicCommand cmd, CancellationToken ct)
    {
        var projectExists = await db.Projects.AnyAsync(p => p.Id == cmd.ProjectId, ct);
        if (!projectExists) throw new InvalidOperationException("Project not found.");

        var epic = new Epic
        {
            Id = Guid.NewGuid(),
            ProjectId = cmd.ProjectId,
            Title = cmd.Title.Trim(),
            Color = cmd.Color,
        };

        db.Epics.Add(epic);
        await db.SaveChangesAsync(ct);

        return new EpicDto(epic.Id, epic.Title, epic.Color, 0, 0, null, null);
    }
}
