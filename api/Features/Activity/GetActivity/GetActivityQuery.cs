using MediatR;

namespace KcwOps.Api.Features.Activity.GetActivity;

public record GetActivityQuery(Guid ProjectId) : IRequest<IEnumerable<ActivityEventDto>>;

public record ActivityEventDto(
    Guid Id,
    Guid ProjectId,
    Guid? StoryId,
    string? StoryKey,
    Guid? SprintId,
    string? SprintName,
    string ActorId,
    string ActorName,
    string ActorInitials,
    string ActorColor,
    string Type,
    string Detail,
    DateTime CreatedAt
);
