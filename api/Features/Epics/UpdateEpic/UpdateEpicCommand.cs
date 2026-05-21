using KcwOps.Api.Features.Epics.GetEpics;
using MediatR;

namespace KcwOps.Api.Features.Epics.UpdateEpic;

public record UpdateEpicCommand(Guid Id, string? Title, string? Color, DateOnly? StartDate, DateOnly? EndDate, bool ClearStartDate = false, bool ClearEndDate = false) : IRequest<EpicDto>;

public record UpdateEpicRequest(string? Title, string? Color, DateOnly? StartDate, DateOnly? EndDate, bool ClearStartDate = false, bool ClearEndDate = false);
