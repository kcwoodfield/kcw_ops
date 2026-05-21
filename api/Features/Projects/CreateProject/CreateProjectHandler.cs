using KcwOps.Api.Domain;
using KcwOps.Api.Features.Projects.GetProjects;
using KcwOps.Api.Infrastructure.Persistence;
using MediatR;

namespace KcwOps.Api.Features.Projects.CreateProject;

public class CreateProjectHandler(AppDbContext db) : IRequestHandler<CreateProjectCommand, ProjectDto>
{
    public async Task<ProjectDto> Handle(CreateProjectCommand cmd, CancellationToken ct)
    {
        var project = new Project
        {
            Id    = Guid.NewGuid(),
            Name  = cmd.Name.Trim(),
            Key   = cmd.Key.Trim().ToUpperInvariant(),
            Color = cmd.Color,
        };

        db.Projects.Add(project);
        await db.SaveChangesAsync(ct);

        return new ProjectDto(project.Id, project.Name, project.Key, project.Color);
    }
}
