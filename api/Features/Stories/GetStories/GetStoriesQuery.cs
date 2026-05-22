using MediatR;

namespace KcwOps.Api.Features.Stories.GetStories;

public record GetStoriesQuery(
    Guid? ProjectId = null,
    Guid? SprintId = null,
    bool BacklogOnly = false,
    string? AssigneeId = null,
    bool DueSoon = false,
    bool StarredOnly = false,
    bool DraftsOnly = false
) : IRequest<List<StoryDto>>;
