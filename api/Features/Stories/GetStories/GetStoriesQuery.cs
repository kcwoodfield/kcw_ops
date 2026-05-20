using MediatR;

namespace KcwOps.Api.Features.Stories.GetStories;

public record GetStoriesQuery(
    Guid ProjectId,
    Guid? SprintId = null,
    bool BacklogOnly = false
) : IRequest<List<StoryDto>>;
