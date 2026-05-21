using KcwOps.Api.Infrastructure.Persistence;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace KcwOps.Api.Features.Stories.DeleteStory;

public class DeleteStoryHandler(AppDbContext db) : IRequestHandler<DeleteStoryCommand>
{
    public async Task Handle(DeleteStoryCommand cmd, CancellationToken ct)
    {
        var story = await db.Stories.FirstOrDefaultAsync(s => s.Id == cmd.Id, ct)
            ?? throw new InvalidOperationException("Story not found.");

        db.Stories.Remove(story);
        await db.SaveChangesAsync(ct);
    }
}
