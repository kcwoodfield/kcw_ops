using MediatR;

namespace KcwOps.Api.Features.Stories.GetComments;

public record GetCommentsQuery(Guid StoryId) : IRequest<IEnumerable<CommentDto>>;

public record CommentDto(Guid Id, string AuthorId, string AuthorName, string AuthorInitials, string AuthorColor, string Body, DateTime CreatedAt);
