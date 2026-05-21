using KcwOps.Api.Domain;
using Microsoft.EntityFrameworkCore;

namespace KcwOps.Api.Infrastructure.Persistence;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<Project> Projects => Set<Project>();
    public DbSet<Epic> Epics => Set<Epic>();
    public DbSet<Sprint> Sprints => Set<Sprint>();
    public DbSet<Story> Stories => Set<Story>();
    public DbSet<User> Users => Set<User>();
    public DbSet<Comment> Comments => Set<Comment>();
    public DbSet<ActivityEvent> ActivityEvents => Set<ActivityEvent>();

    protected override void OnModelCreating(ModelBuilder model)
    {
        model.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);
    }
}
