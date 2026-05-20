using MediatR;

namespace KcwOps.Api.Features.Projects.GetProjects;

public record GetProjectsQuery : IRequest<List<ProjectDto>>;

public record ProjectDto(Guid Id, string Name, string Key, string Color);
