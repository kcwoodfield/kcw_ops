using KcwOps.Api.Features.Epics.GetEpics;
using KcwOps.Api.Infrastructure.Persistence;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace KcwOps.Api.Features.Epics.UpdateEpic;

public class UpdateEpicHandler(AppDbContext db) : IRequestHandler<UpdateEpicCommand, EpicDto>
{
    public async Task<EpicDto> Handle(UpdateEpicCommand cmd, CancellationToken ct)
    {
        var epic = await db.Epics.FirstOrDefaultAsync(e => e.Id == cmd.Id, ct)
            ?? throw new InvalidOperationException("Epic not found.");

        if (cmd.Title is not null) epic.Title = cmd.Title.Trim();
        if (cmd.Color is not null) epic.Color = cmd.Color;
        if (cmd.ClearStartDate) epic.StartDate = null;
        else if (cmd.StartDate is not null) epic.StartDate = cmd.StartDate;
        if (cmd.ClearEndDate) epic.EndDate = null;
        else if (cmd.EndDate is not null) epic.EndDate = cmd.EndDate;

        await db.SaveChangesAsync(ct);
        return new EpicDto(epic.Id, epic.Title, epic.Color, 0, 0, epic.StartDate, epic.EndDate);
    }
}
