using MediatR;

namespace KcwOps.Api.Features.Stories.DeleteStory;

public record DeleteStoryCommand(Guid Id) : IRequest;
