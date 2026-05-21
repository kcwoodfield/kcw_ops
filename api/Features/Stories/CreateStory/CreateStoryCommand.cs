using MediatR;

namespace KcwOps.Api.Features.Stories.CreateStory;

public record CreateStoryCommand(
    Guid ProjectId,
    Guid? EpicId,
    string Title,
    Guid? SprintId,
    string? Status,
    string? Priority,
    int? Points
) : IRequest<StoryDetailDto>;

public record CreateStoryRequest(
    Guid ProjectId,
    Guid? EpicId,
    string Title,
    Guid? SprintId,
    string? Status,
    string? Priority,
    int? Points
);
