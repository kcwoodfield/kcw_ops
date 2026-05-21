using MediatR;
using KcwOps.Api.Features.Sprints.GetSprints;

namespace KcwOps.Api.Features.Sprints.CreateSprint;

public record CreateSprintCommand(
    Guid ProjectId,
    string Name,
    string? Goal,
    DateOnly StartDate,
    DateOnly EndDate
) : IRequest<SprintDto>;

public record CreateSprintRequest(
    Guid ProjectId,
    string Name,
    string? Goal,
    DateOnly StartDate,
    DateOnly EndDate
);
