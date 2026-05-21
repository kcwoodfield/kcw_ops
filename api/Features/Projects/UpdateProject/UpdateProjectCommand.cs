using KcwOps.Api.Features.Projects.GetProjects;
using MediatR;

namespace KcwOps.Api.Features.Projects.UpdateProject;

public record UpdateProjectCommand(Guid Id, string? Name, string? Key, string? Color) : IRequest<ProjectDto>;

public record UpdateProjectRequest(string? Name, string? Key, string? Color);
