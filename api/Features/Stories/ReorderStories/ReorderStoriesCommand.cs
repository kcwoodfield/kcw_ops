using MediatR;

namespace KcwOps.Api.Features.Stories.ReorderStories;

public record ReorderStoriesCommand(
    Guid ProjectId,
    Guid? SprintId,
    string Status,
    List<Guid> OrderedStoryIds
) : IRequest<Unit>;

public record ReorderStoriesRequest(
    Guid ProjectId,
    Guid? SprintId,
    string Status,
    List<Guid> OrderedStoryIds
);
