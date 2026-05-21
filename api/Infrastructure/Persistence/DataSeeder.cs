using KcwOps.Api.Domain;
using Microsoft.EntityFrameworkCore;

namespace KcwOps.Api.Infrastructure.Persistence;

public static class DataSeeder
{
    public static async Task SeedAsync(AppDbContext db)
    {
        if (await db.Projects.AnyAsync()) return;

        var histomap = new Project { Id = Guid.NewGuid(), Name = "Histomap", Key = "HIST", Color = "#C4953A" };

        var epic = new Epic { Id = Guid.NewGuid(), ProjectId = histomap.Id, Title = "General", Color = "#C4953A" };

        db.Projects.Add(histomap);
        db.Epics.Add(epic);

        await db.SaveChangesAsync();
    }
}
