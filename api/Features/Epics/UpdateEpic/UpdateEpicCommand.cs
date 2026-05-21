using KcwOps.Api.Features.Epics.GetEpics;
using MediatR;

namespace KcwOps.Api.Features.Epics.UpdateEpic;

public record UpdateEpicCommand(Guid Id, string? Title, string? Color) : IRequest<EpicDto>;

public record UpdateEpicRequest(string? Title, string? Color);
