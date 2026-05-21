using KcwOps.Api.Features.Projects.GetProjects;
using KcwOps.Api.Infrastructure.Persistence;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace KcwOps.Api.Features.Projects.UpdateProject;

public class UpdateProjectHandler(AppDbContext db) : IRequestHandler<UpdateProjectCommand, ProjectDto>
{
    public async Task<ProjectDto> Handle(UpdateProjectCommand cmd, CancellationToken ct)
    {
        var project = await db.Projects.FirstOrDefaultAsync(p => p.Id == cmd.Id, ct)
            ?? throw new InvalidOperationException("Project not found.");

        if (cmd.Name is not null) project.Name  = cmd.Name.Trim();
        if (cmd.Key  is not null) project.Key   = cmd.Key.Trim().ToUpperInvariant();
        if (cmd.Color is not null) project.Color = cmd.Color;

        await db.SaveChangesAsync(ct);
        return new ProjectDto(project.Id, project.Name, project.Key, project.Color);
    }
}
