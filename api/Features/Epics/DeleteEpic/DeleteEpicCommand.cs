using MediatR;

namespace KcwOps.Api.Features.Epics.DeleteEpic;

public record DeleteEpicCommand(Guid Id) : IRequest;
