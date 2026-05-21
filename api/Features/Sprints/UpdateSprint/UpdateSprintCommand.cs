using MediatR;
using KcwOps.Api.Features.Sprints.GetSprints;

namespace KcwOps.Api.Features.Sprints.UpdateSprint;

public record UpdateSprintCommand(
    Guid Id,
    string? Name,
    string? Goal,
    DateOnly? StartDate,
    DateOnly? EndDate,
    string? State
) : IRequest<SprintDto>;

public record UpdateSprintRequest(
    string? Name,
    string? Goal,
    DateOnly? StartDate,
    DateOnly? EndDate,
    string? State
);
