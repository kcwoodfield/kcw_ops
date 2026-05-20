using MediatR;

namespace KcwOps.Api.Features.Epics.GetEpics;

public record GetEpicsQuery(Guid ProjectId) : IRequest<List<EpicDto>>;

public record EpicDto(Guid Id, string Title, string Color, int TotalPoints, int DonePoints);
