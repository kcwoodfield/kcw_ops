using MediatR;

namespace KcwOps.Api.Features.Sprints.DeleteSprint;

public record DeleteSprintCommand(Guid Id) : IRequest;
