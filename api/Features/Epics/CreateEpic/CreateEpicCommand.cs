using MediatR;
using KcwOps.Api.Features.Epics.GetEpics;

namespace KcwOps.Api.Features.Epics.CreateEpic;

public record CreateEpicCommand(Guid ProjectId, string Title, string Color) : IRequest<EpicDto>;

public record CreateEpicRequest(Guid ProjectId, string Title, string Color);
