namespace KcwOps.Api.Features.Stories;

public record StoryDto(
    Guid Id,
    string StoryId,
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
    string? AssigneeId,
    int SortOrder
);

public record StoryDetailDto(
    Guid Id,
    string StoryId,
    Guid ProjectId,
    string ProjectKey,
    string Title,
    string? Description,
    string Status,
    string Priority,
    int Points,
    bool Blocked,
    Guid EpicId,
    string EpicTitle,
    string EpicColor,
    Guid? SprintId,
    string? SprintName,
    string? SprintState,
    string[] Labels,
    string? DueDate,
    string? AssigneeId,
    int SortOrder
);
