using KcwOps.Api.Features.Stories.GetComments;
using MediatR;

namespace KcwOps.Api.Features.Stories.AddComment;

public record AddCommentCommand(Guid StoryId, string AuthorId, string Body) : IRequest<CommentDto>;

public record AddCommentRequest(string AuthorId, string Body);
