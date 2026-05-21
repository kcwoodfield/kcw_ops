using KcwOps.Api.Features.Projects.GetProjects;
using MediatR;

namespace KcwOps.Api.Features.Projects.CreateProject;

public record CreateProjectCommand(string Name, string Key, string Color) : IRequest<ProjectDto>;

public record CreateProjectRequest(string Name, string Key, string Color);
