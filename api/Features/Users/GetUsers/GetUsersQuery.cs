using MediatR;

namespace KcwOps.Api.Features.Users.GetUsers;

public record GetUsersQuery : IRequest<IEnumerable<UserDto>>;

public record UserDto(string Id, string Name, string Initials, string Color);
