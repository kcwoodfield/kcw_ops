using MediatR;

namespace KcwOps.Api.Features.Stories.GetStory;

public record GetStoryQuery(Guid Id) : IRequest<StoryDetailDto?>;
