using KcwOps.Api.Domain;
using Microsoft.EntityFrameworkCore;

namespace KcwOps.Api.Infrastructure.Persistence;

public static class DataSeeder
{
    public static async Task SeedAsync(AppDbContext db)
    {
        if (!await db.Users.AnyAsync())
        {
            db.Users.AddRange(
                new User { Id = "kcw", Name = "K. Wolf",      Initials = "KW", Color = "#C84A40" },
                new User { Id = "jt",  Name = "J. Tanaka",    Initials = "JT", Color = "#7c5cff" },
                new User { Id = "mr",  Name = "M. Reyes",     Initials = "MR", Color = "#4cc9e7" },
                new User { Id = "np",  Name = "N. Patel",     Initials = "NP", Color = "#f0b34a" },
                new User { Id = "lc",  Name = "L. Chen",      Initials = "LC", Color = "#4ade80" }
            );
            await db.SaveChangesAsync();
        }

        if (await db.Projects.AnyAsync()) return;

        var histomap = new Project { Id = Guid.NewGuid(), Name = "Histomap", Key = "HIST", Color = "#C4953A" };
        var epic = new Epic { Id = Guid.NewGuid(), ProjectId = histomap.Id, Title = "General", Color = "#C4953A" };

        db.Projects.Add(histomap);
        db.Epics.Add(epic);

        await db.SaveChangesAsync();
    }
}
