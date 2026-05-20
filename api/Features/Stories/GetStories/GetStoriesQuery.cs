using KcwOps.Api.Domain;
using MediatR;

namespace KcwOps.Api.Features.Stories.GetStories;

public record GetStoriesQuery(
    Guid ProjectId,
    Guid? SprintId = null,
    bool BacklogOnly = false
) : IRequest<List<StoryDto>>;

public record StoryDto(
    Guid Id,
    string StoryId,       // e.g. "AUTH-247"
    string Title,
    string Status,
    string Priority,
    int Points,
    bool Blocked,
    Guid EpicId,
    string EpicTitle,
    string EpicColor,
    Guid? SprintId,
    string? SprintName,
    string[] Labels,
    string? DueDate,
    string? AssigneeId
);
