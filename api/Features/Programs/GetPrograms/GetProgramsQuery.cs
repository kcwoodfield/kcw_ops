using MediatR;

namespace KcwOps.Api.Features.Programs.GetPrograms;

public record GetProgramsQuery : IRequest<List<ProgramDto>>;

public record ProgramDto(Guid Id, string Name, List<ProjectDto> Projects);
public record ProjectDto(Guid Id, string Name, string Key, string Color);
