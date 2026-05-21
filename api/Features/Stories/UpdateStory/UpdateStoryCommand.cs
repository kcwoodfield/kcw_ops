using MediatR;

namespace KcwOps.Api.Features.Stories.UpdateStory;

public record UpdateStoryCommand(
    Guid Id,
    string? Title,
    string? Description,
    string? Status,
    string? Priority,
    int? Points,
    bool? Blocked,
    Guid? EpicId,
    Guid? SprintId,
    bool ClearSprint,
    string? DueDate,
    string[]? Labels
) : IRequest<StoryDetailDto?>;

public record UpdateStoryRequest(
    string? Title,
    string? Description,
    string? Status,
    string? Priority,
    int? Points,
    bool? Blocked,
    Guid? EpicId,
    Guid? SprintId,
    bool? ClearSprint,
    string? DueDate,
    string[]? Labels
);
