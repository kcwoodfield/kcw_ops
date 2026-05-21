using KcwOps.Api.Domain;
using KcwOps.Api.Features.Stories.GetComments;
using KcwOps.Api.Infrastructure.Persistence;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace KcwOps.Api.Features.Stories.AddComment;

public class AddCommentHandler(AppDbContext db) : IRequestHandler<AddCommentCommand, CommentDto>
{
    public async Task<CommentDto> Handle(AddCommentCommand cmd, CancellationToken ct)
    {
        var story = await db.Stories
            .Include(s => s.Project)
            .FirstOrDefaultAsync(s => s.Id == cmd.StoryId, ct)
            ?? throw new InvalidOperationException("Story not found.");

        var author = await db.Users.FindAsync([cmd.AuthorId], ct);

        var comment = new Comment
        {
            Id = Guid.NewGuid(),
            StoryId = cmd.StoryId,
            AuthorId = cmd.AuthorId,
            Body = cmd.Body.Trim(),
            CreatedAt = DateTime.UtcNow,
        };

        db.Comments.Add(comment);

        db.ActivityEvents.Add(new ActivityEvent
        {
            Id = Guid.NewGuid(),
            ProjectId = story.ProjectId,
            StoryId = story.Id,
            ActorId = cmd.AuthorId,
            Type = "comment_added",
            Detail = cmd.Body.Length > 120 ? cmd.Body[..120] + "…" : cmd.Body,
            CreatedAt = comment.CreatedAt,
        });

        await db.SaveChangesAsync(ct);

        return new CommentDto(
            comment.Id,
            comment.AuthorId,
            author?.Name ?? cmd.AuthorId,
            author?.Initials ?? cmd.AuthorId[..1].ToUpper(),
            author?.Color ?? "#7c5cff",
            comment.Body,
            comment.CreatedAt
        );
    }
}
