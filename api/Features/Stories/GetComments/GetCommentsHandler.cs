using KcwOps.Api.Infrastructure.Persistence;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace KcwOps.Api.Features.Stories.GetComments;

public class GetCommentsHandler(AppDbContext db) : IRequestHandler<GetCommentsQuery, IEnumerable<CommentDto>>
{
    public async Task<IEnumerable<CommentDto>> Handle(GetCommentsQuery q, CancellationToken ct)
    {
        var comments = await db.Comments
            .Where(c => c.StoryId == q.StoryId)
            .OrderBy(c => c.CreatedAt)
            .ToListAsync(ct);

        var authorIds = comments.Select(c => c.AuthorId).Distinct().ToList();
        var users = await db.Users
            .Where(u => authorIds.Contains(u.Id))
            .ToDictionaryAsync(u => u.Id, ct);

        return comments.Select(c =>
        {
            users.TryGetValue(c.AuthorId, out var author);
            return new CommentDto(
                c.Id,
                c.AuthorId,
                author?.Name ?? c.AuthorId,
                author?.Initials ?? c.AuthorId[..1].ToUpper(),
                author?.Color ?? "#7c5cff",
                c.Body,
                c.CreatedAt
            );
        });
    }
}
