using MediatR;

namespace KcwOps.Api.Features.Projects.DeleteProject;

public record DeleteProjectCommand(Guid Id) : IRequest;
