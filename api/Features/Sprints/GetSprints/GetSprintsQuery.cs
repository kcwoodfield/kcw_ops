using MediatR;

namespace KcwOps.Api.Features.Sprints.GetSprints;

public record GetSprintsQuery(Guid ProjectId) : IRequest<List<SprintDto>>;

public record SprintDto(
    Guid Id,
    string Name,
    string? Goal,
    string StartDate,
    string EndDate,
    string State,
    int CommittedPoints,
    int CompletedPoints
);
